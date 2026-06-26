import { Router, type IRouter } from "express";
import { supabase } from "@workspace/db";
import { logger } from "../lib/logger";
import Stripe from "stripe";
import { sendBookingConfirmationEmail } from "../lib/email";

const router: IRouter = Router();

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
}

function formatPayment(p: Record<string, unknown>) {
  return {
    ...p,
    grossAmount: Number(p.gross_amount),
    stripeFee: p.stripe_fee != null ? Number(p.stripe_fee) : null,
    netAmount: p.net_amount != null ? Number(p.net_amount) : null,
    createdAt: p.created_at ? new Date(p.created_at as string).toISOString() : null,
  };
}

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

      await supabase.from('orders').update({
        status: "in_progress",
        paid_at: new Date().toISOString(),
      }).eq('id', orderId);

      await supabase.from('payments').insert({
        order_id: orderId,
        stripe_payment_id: session.payment_intent as string ?? session.id,
        stripe_session_id: session.id,
        gross_amount: grossAmount.toString(),
        currency: session.currency ?? "gbp",
        method: "card",
        status: "paid",
      });

      await supabase.from('activity_logs').insert({
        order_id: orderId,
        action: "payment_received",
        detail: `Payment of £${grossAmount.toFixed(2)} received via Stripe`,
      });

      req.log.info({ orderId }, "Payment recorded for order");

      // Fetch order details to trigger confirmation email
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (orderErr || !orderData) {
        req.log.error({ orderId, orderErr }, "Failed to fetch order for sending confirmation email");
      } else {
        // Fetch service details for turnaround and deliverables description
        const { data: serviceData } = await supabase
          .from('services')
          .select('*')
          .eq('id', orderData.service_id)
          .maybeSingle();

        // Send booking confirmation email asynchronously (so it doesn't block the webhook response)
        sendBookingConfirmationEmail({
          customerName: orderData.customer_name,
          customerEmail: orderData.customer_email,
          orderNumber: orderData.order_number,
          serviceName: orderData.service_name,
          totalAmount: Number(orderData.total_amount),
          propertyCount: orderData.property_count,
          country: orderData.country,
          propertyAddress: orderData.property_address,
          turnaround: serviceData?.turnaround ?? "From 1 hour",
          deliverables: serviceData?.deliverables ?? "",
        }).then(async () => {
          // Log email activity in DB
          await supabase.from('activity_logs').insert({
            order_id: orderId,
            action: "email_sent",
            detail: `Booking confirmation email sent to ${orderData.customer_email}`,
          });
        }).catch((emailErr) => {
          req.log.error({ orderId, emailErr }, "Error sending booking confirmation email");
        });
      }
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : "";

    if (paymentIntentId) {
      const { data: payment } = await supabase.from('payments').select('*').eq('stripe_payment_id', paymentIntentId).maybeSingle();
      if (payment) {
        await supabase.from('payments').update({ status: "refunded" }).eq('id', payment.id);
        await supabase.from('orders').update({ status: "refunded" }).eq('id', payment.order_id);
        await supabase.from('activity_logs').insert({
          order_id: payment.order_id,
          action: "refund_processed",
          detail: "Payment refunded via Stripe",
        });
      }
    }
  }

  res.json({ received: true });
});

export default router;
