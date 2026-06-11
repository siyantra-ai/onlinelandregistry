# Onlinelandregistry.uk

A premium, independent UK property document search and retrieval portal — multi-step checkout wizard, Stripe payments, and an admin CRM for order fulfilment.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/land-registry run dev` — run the frontend (port 22692)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `STRIPE_SECRET_KEY` — Stripe secret key (test key for dev)
- Required env: `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Wouter routing, TanStack Query, Tailwind, shadcn/ui, framer-motion, Recharts
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Payments: Stripe Checkout (server-side session creation, webhook confirmation)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle schema: services, orders, payments, activity_logs
- `artifacts/api-server/src/routes/` — Express route handlers (services, orders, checkout, payments, admin)
- `artifacts/api-server/src/lib/pricing.ts` — Server-side price calculator (document fee + service fee + VAT)
- `artifacts/land-registry/src/` — React frontend

## Architecture decisions

- Stripe Checkout Session is created server-side; the amount is never trusted from the browser (PCI-safe)
- Stripe webhook (`/api/webhooks/stripe`) is the source of truth for payment confirmation — not the browser redirect
- Price breakdown: Document Fee (£7/property, official HMLR fee passed through) + Service & Processing Fee + 20% VAT on service fee only
- Scotland orders carry a 10% service fee premium over England & Wales
- Fast-track and Super-Fast Track fees are flagged as non-refundable in the price breakdown
- Raw body parsing is applied only to `/api/webhooks/stripe` before `express.json()` middleware to preserve Stripe signature verification

## Product

- **Homepage** (`/`) — 7 land registry services with pricing, how-it-works, trust signals
- **Checkout Wizard** (`/order`) — 4 steps: Property Details → Your Details → Finalise → Review & Pay
- **Success Page** (`/order/success`) — confirmation with order number (OLR-YYYY-XXXXX format)
- **Admin Dashboard** (`/admin`) — KPI cards, revenue chart, recent orders
- **Admin Orders** (`/admin/orders`) — searchable/filterable order list
- **Admin Order Detail** (`/admin/orders/:id`) — full order record, payment history, status management, staff notes

## Gotchas

- Re-run codegen after every OpenAPI spec change: `pnpm --filter @workspace/api-spec run codegen`
- Run `pnpm run typecheck:libs` before leaf artifact typechecks if you change `lib/*`
- The Stripe webhook needs raw body — the middleware order in `app.ts` is intentional
- Services are seeded on first run via `INSERT ... ON CONFLICT DO NOTHING`

## User preferences

- Colors: Navy #16243B (primary) + Amber #C8861A (accent)
- Fonts: Plus Jakarta Sans (headings) / Inter (body) / IBM Plex Mono (order numbers/codes)
