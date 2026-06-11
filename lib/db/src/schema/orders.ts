import { pgTable, serial, text, numeric, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const orderStatusEnum = pgEnum("order_status", ["new", "in_progress", "awaiting_docs", "completed", "refunded"]);
export const countryEnum = pgEnum("country_type", ["england_wales", "scotland"]);
export const trackingTypeEnum = pgEnum("tracking_type", ["standard", "fast_track", "super_fast_track"]);
export const deliveryTypeEnum = pgEnum("delivery_type", ["pdf_only", "pdf_printed"]);
export const notificationTypeEnum = pgEnum("notification_type", ["email", "sms", "both"]);

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  status: orderStatusEnum("status").notNull().default("new"),
  serviceId: integer("service_id").notNull(),
  serviceName: text("service_name").notNull(),
  customerTitle: text("customer_title"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  customerAddress: text("customer_address"),
  propertyCount: integer("property_count").notNull().default(1),
  country: countryEnum("country").notNull().default("england_wales"),
  tenure: text("tenure"),
  titleNumber: text("title_number"),
  postcode: text("postcode"),
  propertyAddress: text("property_address"),
  lat: numeric("lat", { precision: 12, scale: 8 }),
  lng: numeric("lng", { precision: 12, scale: 8 }),
  addons: text("addons").array().notNull().default([]),
  trackingType: trackingTypeEnum("tracking_type").notNull().default("standard"),
  deliveryType: deliveryTypeEnum("delivery_type").notNull().default("pdf_only"),
  notificationType: notificationTypeEnum("notification_type").notNull().default("email"),
  documentFee: numeric("document_fee", { precision: 10, scale: 2 }).notNull().default("0"),
  serviceFee: numeric("service_fee", { precision: 10, scale: 2 }).notNull().default("0"),
  vatAmount: numeric("vat_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  stripeSessionId: text("stripe_session_id"),
  agreedToWaiveCancel: boolean("agreed_to_waive_cancel").notNull().default(false),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  notes: text("notes"),
  staffNotes: text("staff_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
