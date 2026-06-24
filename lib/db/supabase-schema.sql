-- 1. Create Custom Types (Enums)
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('new', 'in_progress', 'awaiting_docs', 'completed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE country_type AS ENUM ('england_wales', 'scotland');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tracking_type AS ENUM ('standard', 'fast_track', 'super_fast_track');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE delivery_type AS ENUM ('pdf_only', 'pdf_printed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('email', 'sms', 'both');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Services Table
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    base_price NUMERIC(10, 2) NOT NULL,
    description TEXT NOT NULL,
    deliverables TEXT NOT NULL,
    category TEXT,
    turnaround TEXT,
    popular BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    status order_status NOT NULL DEFAULT 'new',
    service_id INTEGER NOT NULL,
    service_name TEXT NOT NULL,
    customer_title TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    customer_address TEXT,
    property_count INTEGER NOT NULL DEFAULT 1,
    country country_type NOT NULL DEFAULT 'england_wales',
    tenure TEXT,
    title_number TEXT,
    postcode TEXT,
    property_address TEXT,
    lat NUMERIC(12, 8),
    lng NUMERIC(12, 8),
    addons TEXT[] NOT NULL DEFAULT '{}',
    tracking_type tracking_type NOT NULL DEFAULT 'standard',
    delivery_type delivery_type NOT NULL DEFAULT 'pdf_only',
    notification_type notification_type NOT NULL DEFAULT 'email',
    document_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    service_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    vat_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    stripe_session_id TEXT,
    agreed_to_waive_cancel BOOLEAN NOT NULL DEFAULT FALSE,
    paid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    staff_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    stripe_payment_id TEXT NOT NULL,
    stripe_session_id TEXT,
    gross_amount NUMERIC(10, 2) NOT NULL,
    stripe_fee NUMERIC(10, 2),
    net_amount NUMERIC(10, 2),
    currency TEXT NOT NULL DEFAULT 'gbp',
    method TEXT,
    status payment_status NOT NULL DEFAULT 'pending',
    refund_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5. Create Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    detail TEXT,
    author TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 6. Insert Default Services
INSERT INTO services (name, slug, base_price, description, deliverables, category, turnaround, popular) VALUES
('Title Register', 'title-register', 36.00, 'Official record confirming the registered owners, tenure type (Freehold/Leasehold), purchase price, mortgages, and charges.', 'Title number, Owner, Tenure (freehold or leasehold), Purchase price/value', 'property_document', 'From 1 hour', TRUE),
('Title Plan', 'title-plan', 36.00, 'Detailed geographic representation of the property boundaries, drawn by HM Land Registry.', 'Extent of property owned, General boundaries, Title number, Orientation & scale', 'property_document', 'From 1 hour', FALSE),
('Property Ownership (Register + Plan)', 'ownership-bundle', 60.00, 'These two documents are the documents proving ownership (or non-ownership) of a property. They are packed with information relating to ownership, tenure, purchase price, mortgages, date of purchase, easements and covenants. Read together, they contain all the information needed to prove ownership.', 'Title Register, Title Plan, Owner Info', 'property_bundle', 'From 1 hour', TRUE),
('Deed Search', 'deed-search', 41.00, 'Historical transfers (TR1 forms), original leasehold contracts, and historic boundary plans.', 'Conveyance, Lease, Transfer, Charge', 'deed_search', '4 hours Fast-Track', FALSE),
('Map / Land Search (no address)', 'map-land-search', 53.00, 'GIS coordinate-based lookup for plots, fields, verges, or forests lacking a standard postal address.', 'fields, tracks, barns, roads', 'land_search', '4 hours Fast-Track', FALSE),
('Property Alert Service', 'property-alert', 36.00, 'Fraud monitoring for up to 3 titles. Notifies you instantly if third parties attempt to alter deeds.', 'Fraud Alert, Real-time Monitoring', 'monitoring', 'Instant Setup', FALSE),
('Deceased Joint Proprietor (DJP)', 'deceased-joint-proprietor', 65.00, 'Form preparation and filing service to remove a deceased joint owner''s name and establish sole absolute title.', 'Form DJP, Registration Update', 'legal_form', '1-2 days Dispatch', FALSE)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description,
    deliverables = EXCLUDED.deliverables,
    category = EXCLUDED.category,
    turnaround = EXCLUDED.turnaround,
    popular = EXCLUDED.popular;
