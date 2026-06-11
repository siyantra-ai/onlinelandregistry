import { pgTable, serial, text, numeric, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "refunded"]);

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  stripePaymentId: text("stripe_payment_id").notNull(),
  stripeSessionId: text("stripe_session_id"),
  grossAmount: numeric("gross_amount", { precision: 10, scale: 2 }).notNull(),
  stripeFee: numeric("stripe_fee", { precision: 10, scale: 2 }),
  netAmount: numeric("net_amount", { precision: 10, scale: 2 }),
  currency: text("currency").notNull().default("gbp"),
  method: text("method"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  refundReason: text("refund_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
