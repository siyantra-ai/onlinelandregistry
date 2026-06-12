import { Router, type IRouter } from "express";
import { supabase } from "@workspace/db";
import {
  CreateOrderBody,
  GetOrderResponse,
} from "@workspace/api-zod";
import { calculatePrice } from "../lib/pricing";

const router: IRouter = Router();

function formatOrder(o: Record<string, unknown>) {
  return {
    id: o.id,
    orderNumber: o.order_number,
    serviceId: o.service_id,
    serviceName: o.service_name,
    customerTitle: o.customer_title,
    customerName: o.customer_name,
    customerEmail: o.customer_email,
    customerPhone: o.customer_phone,
    customerAddress: o.customer_address,
    propertyCount: o.property_count,
    country: o.country,
    tenure: o.tenure,
    titleNumber: o.title_number,
    postcode: o.postcode,
    propertyAddress: o.property_address,
    lat: o.lat != null ? Number(o.lat) : null,
    lng: o.lng != null ? Number(o.lng) : null,
    addons: o.addons,
    trackingType: o.tracking_type,
    deliveryType: o.delivery_type,
    notificationType: o.notification_type,
    documentFee: Number(o.document_fee),
    serviceFee: Number(o.service_fee),
    vatAmount: Number(o.vat_amount),
    totalAmount: Number(o.total_amount),
    status: o.status,
    paymentStatus: o.payment_status,
    agreedToWaiveCancel: o.agreed_to_waive_cancel,
    paidAt: o.paid_at ? new Date(o.paid_at as string).toISOString() : null,
    createdAt: o.created_at ? new Date(o.created_at as string).toISOString() : null,
    updatedAt: o.updated_at ? new Date(o.updated_at as string).toISOString() : null,
  };
}

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `OLR-${year}-${random}`;
}

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;

  // Get service to compute prices server-side
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('*')
    .eq('id', data.serviceId)
    .maybeSingle();

  if (serviceError || !service) {
    res.status(400).json({ error: "Service not found" });
    return;
  }

  const pricing = calculatePrice({
    basePrice: Number(service.base_price),
    propertyCount: data.propertyCount ?? 1,
    country: data.country ?? "england_wales",
    trackingType: data.trackingType ?? "standard",
    deliveryType: data.deliveryType ?? "pdf_only",
    notificationType: data.notificationType ?? "email",
    addons: (data.addons as string[]) ?? [],
  }, Number(service.base_price));

  const orderNumber = generateOrderNumber();

  const { data: order, error: orderError } = await supabase.from('orders').insert({
    order_number: orderNumber,
    service_id: data.serviceId,
    service_name: service.name,
    customer_title: data.customerTitle ?? null,
    customer_name: data.customerName,
    customer_email: data.customerEmail,
    customer_phone: data.customerPhone ?? null,
    customer_address: data.customerAddress ?? null,
    property_count: data.propertyCount ?? 1,
    country: (data.country ?? "england_wales") as "england_wales" | "scotland",
    tenure: data.tenure ?? null,
    title_number: data.titleNumber ?? null,
    postcode: data.postcode ?? null,
    property_address: data.propertyAddress ?? null,
    lat: data.lat?.toString() ?? null,
    lng: data.lng?.toString() ?? null,
    addons: (data.addons as string[]) ?? [],
    tracking_type: (data.trackingType ?? "standard") as "standard" | "fast_track" | "super_fast_track",
    delivery_type: (data.deliveryType ?? "pdf_only") as "pdf_only" | "pdf_printed",
    notification_type: (data.notificationType ?? "email") as "email" | "sms" | "both",
    document_fee: pricing.documentFee.toString(),
    service_fee: pricing.serviceFee.toString(),
    vat_amount: pricing.vatAmount.toString(),
    total_amount: pricing.totalAmount.toString(),
    agreed_to_waive_cancel: data.agreedToWaiveCancel ?? false,
  }).select().single();

  if (orderError || !order) {
    res.status(500).json({ error: orderError?.message || "Failed to create order" });
    return;
  }

  await supabase.from('activity_logs').insert({
    order_id: order.id,
    action: "order_created",
    detail: `Order ${orderNumber} created for ${data.customerName}`,
  });

  res.status(201).json(GetOrderResponse.parse(formatOrder(order)));
});

export default router;
