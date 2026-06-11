import { Router, type IRouter } from "express";
import { db, paymentsTable, ordersTable, activityLogsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ListPaymentsQueryParams, ListPaymentsResponse } from "@workspace/api-zod";
import { logger } from "../lib/logger";
import Stripe from "stripe";

const router: IRouter = Router();

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
}

function formatPayment(p: Record<string, unknown>) {
  return {
    ...p,
    grossAmount: Number(p.grossAmount),
    stripeFee: p.stripeFee != null ? Number(p.stripeFee) : null,
    netAmount: p.netAmount != null ? Number(p.netAmount) : null,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
  };
}

router.get("/payments", async (req, res): Promise<void> => {
  const params = ListPaymentsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const payments = await db.select().from(paymentsTable)
    .where(params.data.orderId ? eq(paymentsTable.orderId, params.data.orderId) : undefined)
    .orderBy(paymentsTable.createdAt);

  res.json(ListPaymentsResponse.parse(payments.map(p => formatPayment(p as unknown as Record<string, unknown>))));
});

// Stripe webhook — raw body required
router.post("/webhooks/stripe", async (req, res): Promise<void> => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    req.log.error("STRIPE_WEBHOOK_SECRET not set");
    res.status(500).json({ error: "Webhook secret not configured" });
    return;
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
  } catch (err) {
    req.log.warn({ err }, "Stripe webhook signature verification failed");
    res.status(400).json({ error: "Invalid signature" });
    return;
  }

  req.log.info({ type: event.type }, "Stripe webhook received");

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = parseInt(session.metadata?.orderId ?? "0");

    if (orderId) {
      const grossAmount = (session.amount_total ?? 0) / 100;

      await db.update(ordersTable).set({
        status: "in_progress",
        paidAt: new Date(),
      }).where(eq(ordersTable.id, orderId));

      await db.insert(paymentsTable).values({
        orderId,
        stripePaymentId: session.payment_intent as string ?? session.id,
        stripeSessionId: session.id,
        grossAmount: grossAmount.toString(),
        currency: session.currency ?? "gbp",
        method: "card",
        status: "paid",
      });

      await db.insert(activityLogsTable).values({
        orderId,
        action: "payment_received",
        detail: `Payment of £${grossAmount.toFixed(2)} received via Stripe`,
      });

      req.log.info({ orderId }, "Payment recorded for order");
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : "";

    if (paymentIntentId) {
      const [payment] = await db.select().from(paymentsTable).where(eq(paymentsTable.stripePaymentId, paymentIntentId));
      if (payment) {
        await db.update(paymentsTable).set({ status: "refunded" }).where(eq(paymentsTable.id, payment.id));
        await db.update(ordersTable).set({ status: "refunded" }).where(eq(ordersTable.id, payment.orderId));
        await db.insert(activityLogsTable).values({
          orderId: payment.orderId,
          action: "refund_processed",
          detail: "Payment refunded via Stripe",
        });
      }
    }
  }

  res.json({ received: true });
});

export default router;
