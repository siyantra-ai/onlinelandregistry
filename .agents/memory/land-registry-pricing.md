---
name: Land registry pricing model
description: How prices are calculated for Onlinelandregistry.uk orders.
---

Price = Document Fee + Service Fee + VAT

- **Document Fee**: £7.00 × propertyCount (official HMLR fee, passed through, NOT subject to VAT)
- **Service Fee**: (basePrice - £7) × propertyCount × scotlandMultiplier + tracking extra + delivery extra + notification extra + addon totals
  - scotlandMultiplier = 1.1 for Scotland, 1.0 for England & Wales
  - Tracking: standard=£0, fast_track=+£10, super_fast_track=+£20 (non-refundable)
  - Delivery: pdf_only=£0, pdf_printed=+£9.95
  - Notification: email=£0, sms=+£4.95, both=+£4.95
- **VAT**: 20% on service fee only (NOT on document fee — it's a pass-through government fee)

**Why:** UK regulations require transparent breakdown separating the registry document fee from the intermediary service fee. VAT applies only to the service portion.

**How to apply:** Always use `artifacts/api-server/src/lib/pricing.ts` `calculatePrice()` function server-side. Never trust a price sent from the browser.
