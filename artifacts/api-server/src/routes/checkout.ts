import { Router, type IRouter } from "express";
import { db, ordersTable, servicesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateCheckoutSessionBody, CalculatePriceBody, LookupPostcodeQueryParams } from "@workspace/api-zod";
import { calculatePrice } from "../lib/pricing";
import { logger } from "../lib/logger";
import Stripe from "stripe";

const router: IRouter = Router();

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
}

router.post("/checkout/session", async (req, res): Promise<void> => {
  const parsed = CreateCheckoutSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, parsed.data.orderId));
  if (!order) {
    res.status(400).json({ error: "Order not found" });
    return;
  }

  const stripe = getStripe();
  const totalInPence = Math.round(Number(order.totalAmount) * 100);

  // Build base URL from the request
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const baseUrl = `${protocol}://${host}`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: {
            name: order.serviceName,
            description: `Order ${order.orderNumber} — ${order.propertyCount} propert${order.propertyCount === 1 ? "y" : "ies"} (${order.country === "england_wales" ? "England & Wales" : "Scotland"})`,
          },
          unit_amount: totalInPence,
        },
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}&order_number=${order.orderNumber}`,
    cancel_url: `${baseUrl}/order?cancelled=true`,
    customer_email: order.customerEmail,
    metadata: {
      orderId: order.id.toString(),
      orderNumber: order.orderNumber,
    },
    payment_intent_data: {
      metadata: {
        orderId: order.id.toString(),
        orderNumber: order.orderNumber,
      },
    },
  });

  // Save session ID on order
  await db.update(ordersTable).set({ stripeSessionId: session.id }).where(eq(ordersTable.id, order.id));

  res.json({ url: session.url ?? "", sessionId: session.id });
});

router.post("/checkout/price", async (req, res): Promise<void> => {
  const parsed = CalculatePriceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, parsed.data.serviceId));

  if (!service) {
    res.status(400).json({ error: "Service not found" });
    return;
  }

  const pricing = calculatePrice({
    basePrice: Number(service.basePrice),
    propertyCount: parsed.data.propertyCount,
    country: parsed.data.country,
    trackingType: parsed.data.trackingType,
    deliveryType: parsed.data.deliveryType,
    notificationType: parsed.data.notificationType,
    addons: parsed.data.addons as string[],
  }, Number(service.basePrice));

  res.json(pricing);
});

router.get("/postcode/lookup", async (req, res): Promise<void> => {
  const params = LookupPostcodeQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const postcode = params.data.postcode.replace(/\s+/g, "").toUpperCase();

  try {
    const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
    if (!response.ok) {
      res.json({ addresses: [], postcode: params.data.postcode });
      return;
    }
    const data = await response.json() as { result?: { admin_district?: string; admin_ward?: string; country?: string } };
    const result = data.result;
    if (!result) {
      res.json({ addresses: [], postcode: params.data.postcode });
      return;
    }

    // Return formatted postcode as found address (in production, integrate with a full address lookup)
    const addresses = [
      `${postcode} (${result.admin_district ?? ""}, ${result.country ?? "England"})`,
    ];

    res.json({ addresses, postcode: params.data.postcode });
  } catch (err) {
    req.log.warn({ err }, "Postcode lookup failed");
    res.json({ addresses: [], postcode: params.data.postcode });
  }
});

export default router;
