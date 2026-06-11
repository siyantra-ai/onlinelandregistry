import { Router, type IRouter } from "express";
import { db, ordersTable, activityLogsTable, servicesTable } from "@workspace/db";
import { eq, desc, ilike, sql, and } from "drizzle-orm";
import {
  ListOrdersQueryParams,
  ListOrdersResponse,
  CreateOrderBody,
  GetOrderParams,
  GetOrderResponse,
  UpdateOrderParams,
  UpdateOrderBody,
  UpdateOrderResponse,
  AddOrderNoteParams,
  AddOrderNoteBody,
} from "@workspace/api-zod";
import { calculatePrice } from "../lib/pricing";

const router: IRouter = Router();

function formatOrder(o: Record<string, unknown>) {
  return {
    ...o,
    documentFee: Number(o.documentFee),
    serviceFee: Number(o.serviceFee),
    vatAmount: Number(o.vatAmount),
    totalAmount: Number(o.totalAmount),
    lat: o.lat != null ? Number(o.lat) : null,
    lng: o.lng != null ? Number(o.lng) : null,
    paidAt: o.paidAt instanceof Date ? o.paidAt.toISOString() : o.paidAt,
    createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : o.createdAt,
    updatedAt: o.updatedAt instanceof Date ? o.updatedAt.toISOString() : o.updatedAt,
  };
}

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `OLR-${year}-${random}`;
}

router.get("/orders", async (req, res): Promise<void> => {
  const params = ListOrdersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { status, search, limit = 50, offset = 0 } = params.data;

  const conditions = [];
  if (status) conditions.push(eq(ordersTable.status, status as "new" | "in_progress" | "awaiting_docs" | "completed" | "refunded"));
  if (search) conditions.push(ilike(ordersTable.customerName, `%${search}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [orders, countResult] = await Promise.all([
    db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(where),
  ]);

  res.json(ListOrdersResponse.parse({
    orders: orders.map(formatOrder),
    total: Number(countResult[0]?.count ?? 0),
  }));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;

  // Get service to compute prices server-side
  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, data.serviceId));
  if (!service) {
    res.status(400).json({ error: "Service not found" });
    return;
  }

  const pricing = calculatePrice({
    basePrice: Number(service.basePrice),
    propertyCount: data.propertyCount ?? 1,
    country: data.country ?? "england_wales",
    trackingType: data.trackingType ?? "standard",
    deliveryType: data.deliveryType ?? "pdf_only",
    notificationType: data.notificationType ?? "email",
    addons: (data.addons as string[]) ?? [],
  }, Number(service.basePrice));

  const orderNumber = generateOrderNumber();

  const [order] = await db.insert(ordersTable).values({
    orderNumber,
    serviceId: data.serviceId,
    serviceName: service.name,
    customerTitle: data.customerTitle ?? null,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    customerPhone: data.customerPhone ?? null,
    customerAddress: data.customerAddress ?? null,
    propertyCount: data.propertyCount ?? 1,
    country: (data.country ?? "england_wales") as "england_wales" | "scotland",
    tenure: data.tenure ?? null,
    titleNumber: data.titleNumber ?? null,
    postcode: data.postcode ?? null,
    propertyAddress: data.propertyAddress ?? null,
    lat: data.lat?.toString() ?? null,
    lng: data.lng?.toString() ?? null,
    addons: (data.addons as string[]) ?? [],
    trackingType: (data.trackingType ?? "standard") as "standard" | "fast_track" | "super_fast_track",
    deliveryType: (data.deliveryType ?? "pdf_only") as "pdf_only" | "pdf_printed",
    notificationType: (data.notificationType ?? "email") as "email" | "sms" | "both",
    documentFee: pricing.documentFee.toString(),
    serviceFee: pricing.serviceFee.toString(),
    vatAmount: pricing.vatAmount.toString(),
    totalAmount: pricing.totalAmount.toString(),
    agreedToWaiveCancel: data.agreedToWaiveCancel ?? false,
  }).returning();

  await db.insert(activityLogsTable).values({
    orderId: order.id,
    action: "order_created",
    detail: `Order ${orderNumber} created for ${data.customerName}`,
  });

  res.status(201).json(GetOrderResponse.parse(formatOrder(order as unknown as Record<string, unknown>)));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(GetOrderResponse.parse(formatOrder(order as unknown as Record<string, unknown>)));
});

router.patch("/orders/:id", async (req, res): Promise<void> => {
  const params = UpdateOrderParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.status != null) updateData.status = parsed.data.status;
  if (parsed.data.staffNotes != null) updateData.staffNotes = parsed.data.staffNotes;
  if (parsed.data.notes != null) updateData.notes = parsed.data.notes;

  const [order] = await db.update(ordersTable).set(updateData).where(eq(ordersTable.id, params.data.id)).returning();
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (parsed.data.status) {
    await db.insert(activityLogsTable).values({
      orderId: order.id,
      action: "status_changed",
      detail: `Status updated to ${parsed.data.status}`,
      author: "Admin",
    });
  }

  res.json(UpdateOrderResponse.parse(formatOrder(order as unknown as Record<string, unknown>)));
});

router.post("/orders/:id/notes", async (req, res): Promise<void> => {
  const params = AddOrderNoteParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = AddOrderNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [log] = await db.insert(activityLogsTable).values({
    orderId: params.data.id,
    action: "staff_note",
    detail: parsed.data.note,
    author: parsed.data.author ?? "Staff",
  }).returning();

  res.status(201).json({
    id: log.id,
    orderId: log.orderId,
    action: log.action,
    detail: log.detail,
    author: log.author,
    createdAt: log.createdAt.toISOString(),
  });
});

export default router;
