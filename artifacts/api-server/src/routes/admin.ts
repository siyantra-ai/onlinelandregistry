import { Router, type IRouter } from "express";
import { db, ordersTable, paymentsTable, servicesTable } from "@workspace/db";
import { eq, desc, gte, sql } from "drizzle-orm";
import { GetDashboardResponse, GetRecentOrdersQueryParams, GetRecentOrdersResponse, GetRevenueStatsQueryParams, GetRevenueStatsResponse } from "@workspace/api-zod";

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

router.get("/admin/dashboard", async (req, res): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [allOrders, todayPayments, statusCounts, topServices] = await Promise.all([
    db.select({
      status: ordersTable.status,
      count: sql<number>`count(*)`,
    }).from(ordersTable).groupBy(ordersTable.status),
    db.select({ total: sql<number>`coalesce(sum(gross_amount::numeric), 0)` })
      .from(paymentsTable)
      .where(gte(paymentsTable.createdAt, today)),
    db.select({
      status: ordersTable.status,
      count: sql<number>`count(*)::int`,
    }).from(ordersTable).groupBy(ordersTable.status),
    db.select({
      serviceName: ordersTable.serviceName,
      count: sql<number>`count(*)::int`,
      revenue: sql<number>`coalesce(sum(total_amount::numeric), 0)`,
    }).from(ordersTable).groupBy(ordersTable.serviceName).orderBy(desc(sql`count(*)`)).limit(5),
  ]);

  const counts = Object.fromEntries(allOrders.map(r => [r.status, Number(r.count)]));
  const totalOrders = allOrders.reduce((s, r) => s + Number(r.count), 0);

  const totalRevenue = await db.select({ total: sql<number>`coalesce(sum(gross_amount::numeric), 0)` }).from(paymentsTable);

  const completedOrders = counts.completed ?? 0;
  const conversionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  const stats = {
    totalOrders,
    newOrders: counts.new ?? 0,
    inProgressOrders: counts.in_progress ?? 0,
    completedOrders,
    totalRevenue: Math.round(Number(totalRevenue[0]?.total ?? 0) * 100) / 100,
    todayRevenue: Math.round(Number(todayPayments[0]?.total ?? 0) * 100) / 100,
    conversionRate,
    statusBreakdown: statusCounts.map(s => ({ status: s.status, count: Number(s.count) })),
    topServices: topServices.map(s => ({
      serviceName: s.serviceName,
      count: Number(s.count),
      revenue: Math.round(Number(s.revenue) * 100) / 100,
    })),
  };

  res.json(GetDashboardResponse.parse(stats));
});

router.get("/admin/orders/recent", async (req, res): Promise<void> => {
  const params = GetRecentOrdersQueryParams.safeParse(req.query);
  const limit = params.success ? (params.data.limit ?? 10) : 10;

  const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(limit);
  res.json(GetRecentOrdersResponse.parse(orders.map(o => formatOrder(o as unknown as Record<string, unknown>))));
});

router.get("/admin/revenue", async (req, res): Promise<void> => {
  const params = GetRevenueStatsQueryParams.safeParse(req.query);
  const period = params.success ? (params.data.period ?? "month") : "month";

  let days: number;
  if (period === "week") days = 7;
  else if (period === "year") days = 365;
  else days = 30;

  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await db.select({
    date: sql<string>`date_trunc('day', ${paymentsTable.createdAt})::date::text`,
    revenue: sql<number>`coalesce(sum(gross_amount::numeric), 0)`,
    orders: sql<number>`count(*)::int`,
  }).from(paymentsTable)
    .where(gte(paymentsTable.createdAt, since))
    .groupBy(sql`date_trunc('day', ${paymentsTable.createdAt})`)
    .orderBy(sql`date_trunc('day', ${paymentsTable.createdAt})`);

  const totalRevenue = rows.reduce((s, r) => s + Number(r.revenue), 0);
  const totalOrders = rows.reduce((s, r) => s + Number(r.orders), 0);

  res.json(GetRevenueStatsResponse.parse({
    period,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalOrders,
    dailyRevenue: rows.map(r => ({
      date: r.date,
      revenue: Math.round(Number(r.revenue) * 100) / 100,
      orders: Number(r.orders),
    })),
  }));
});

export default router;
