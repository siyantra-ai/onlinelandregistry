---
name: Stripe webhook raw body
description: Express middleware ordering for Stripe signature verification in this monorepo.
---

In `artifacts/api-server/src/app.ts`, register `express.raw({ type: 'application/json' })` for `/api/webhooks/stripe` BEFORE `express.json()`. If express.json() runs first, the raw body is consumed and Stripe's `webhooks.constructEvent()` will throw "No signatures found matching the expected signature for payload."

**Why:** Stripe webhook signature verification requires the raw unparsed request body. express.json() replaces `req.body` with a parsed object, destroying the raw buffer.

**How to apply:** Always keep the raw middleware line above the json middleware line in app.ts whenever adding Stripe webhook support.
