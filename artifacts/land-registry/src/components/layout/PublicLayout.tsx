import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FileText, Map, Package, Search, MapPin, Bell, FileSignature, Mail, ExternalLink } from "lucide-react";

const FOOTER_SERVICES = [
  { icon: FileText,      label: "Title Register",   price: "£36", slug: "title-register" },
  { icon: Map,           label: "Title Plan",        price: "£36", slug: "title-plan" },
  { icon: Package,       label: "Ownership Bundle",  price: "£60", slug: "ownership-bundle" },
  { icon: Search,        label: "Deed Search",       price: "£41", slug: "deed-search" },
  { icon: MapPin,        label: "Map / Land Search", price: "£53", slug: "map-land-search" },
  { icon: Bell,          label: "Property Alert",    price: "£36", slug: "property-alert" },
  { icon: FileSignature, label: "DJP Application",   price: "£65", slug: "deceased-joint-proprietor" },
];

const FOOTER_COMPANY = [
  { label: "About Us",          href: "/about" },
  { label: "Contact Support",   href: "/contact" },
  { label: "FAQs",              href: "/#faqs" },
  { label: "Privacy Policy",    href: "/privacy" },
  { label: "Terms & Conditions",href: "/terms" },
  { label: "Cookie Policy",     href: "/cookies" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">

      {/* ─── Navigation ─── */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-50 border-b border-white/8">
        <div className="container mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">

          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="bg-accent p-1.5 rounded-md">
              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="font-heading font-bold text-[1.0625rem] tracking-tight text-white">
              Onlinelandregistry<span className="text-accent">.uk</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-[0.875rem] font-medium">
            <a href="/#services" className="text-white/65 hover:text-white transition-colors">Services</a>
            <a href="/#how-it-works" className="text-white/65 hover:text-white transition-colors">How It Works</a>
            <a href="/#faqs" className="text-white/65 hover:text-white transition-colors">FAQs</a>
            <Link href="/admin" className="text-white/65 hover:text-white transition-colors">Admin</Link>
          </nav>

          <Link href="/order">
            <Button className="bg-accent hover:bg-accent/90 text-white border-0 font-semibold text-sm h-9 px-5 shadow-sm rounded-md">
              Order Documents
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* ═══════════════════════════════════════════════════
          FOOTER — Corporate
      ═══════════════════════════════════════════════════ */}
      <footer className="bg-[#0d1a2d] text-white/60">

        {/* Main grid */}
        <div className="container mx-auto px-6 lg:px-8 pt-16 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">

            {/* Col 1 — Brand (wider) */}
            <div className="lg:col-span-4 space-y-5">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <div className="bg-accent p-1.5 rounded-md shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="font-heading font-bold text-white text-[1.0625rem] tracking-tight">
                  Onlinelandregistry<span className="text-accent">.uk</span>
                </span>
              </Link>

              <p className="text-[0.8125rem] leading-relaxed text-white/45 max-w-xs">
                A premium, self-service portal for obtaining official UK Land Registry documents — Title Registers, Plans, Deeds, and more.
              </p>

              <div className="pt-1 space-y-1.5">
                <p className="text-[0.6875rem] font-bold uppercase tracking-[0.15em] text-white/25 mb-3">Delivery Options</p>
                {[
                  { dot: "bg-emerald-400", label: "Standard — next working day" },
                  { dot: "bg-accent",      label: "Fast Track — within 4 hours" },
                  { dot: "bg-orange-400",  label: "Super-Fast — within 1 hour" },
                ].map(({ dot, label }) => (
                  <div key={label} className="flex items-center gap-2.5 text-[0.8125rem] text-white/40">
                    <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Col 2 — Services */}
            <div className="lg:col-span-3 lg:col-start-6">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.15em] text-white/30 mb-5">Document Shop</p>
              <ul className="space-y-3">
                {FOOTER_SERVICES.map(({ icon: Icon, label, price, slug }) => (
                  <li key={slug}>
                    <Link
                      href={`/order?service=${slug}`}
                      className="flex items-center justify-between gap-3 group"
                    >
                      <span className="flex items-center gap-2 text-[0.8125rem] text-white/45 group-hover:text-white/80 transition-colors">
                        <Icon className="w-3 h-3 shrink-0 text-white/25 group-hover:text-accent/70 transition-colors" />
                        {label}
                      </span>
                      <span className="font-mono text-[0.75rem] text-white/25 group-hover:text-white/50 transition-colors tabular-nums">
                        {price}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Company */}
            <div className="lg:col-span-2">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.15em] text-white/30 mb-5">Company</p>
              <ul className="space-y-3">
                {FOOTER_COMPANY.map(({ label, href }) => (
                  <li key={href}>
                    <a href={href} className="text-[0.8125rem] text-white/45 hover:text-white/80 transition-colors">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4 — Contact */}
            <div className="lg:col-span-3">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.15em] text-white/30 mb-5">Contact</p>
              <div className="space-y-5">
                <div>
                  <p className="text-[0.6875rem] font-semibold text-white/25 uppercase tracking-wide mb-1.5">Support</p>
                  <a href="mailto:support@onlinelandregistry.uk" className="flex items-center gap-1.5 text-[0.8125rem] text-white/45 hover:text-white/80 transition-colors">
                    <Mail className="w-3 h-3 shrink-0" />
                    support@onlinelandregistry.uk
                  </a>
                </div>
                <div>
                  <p className="text-[0.6875rem] font-semibold text-white/25 uppercase tracking-wide mb-1.5">Sales</p>
                  <a href="mailto:sales@onlinelandregistry.uk" className="flex items-center gap-1.5 text-[0.8125rem] text-white/45 hover:text-white/80 transition-colors">
                    <Mail className="w-3 h-3 shrink-0" />
                    sales@onlinelandregistry.uk
                  </a>
                </div>
                <div className="pt-1 border-t border-white/8">
                  <p className="text-[0.6875rem] font-semibold text-white/25 uppercase tracking-wide mb-2">Registered Office</p>
                  <address className="not-italic text-[0.8125rem] text-white/35 leading-relaxed">
                    Swift Task Services Ltd<br />
                    1 Limbrick, Blackburn<br />
                    Lancashire, BB1 8AB
                  </address>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-white/6">
          <div className="container mx-auto px-6 lg:px-8 py-6">
            <p className="text-[0.75rem] text-white/25 leading-relaxed max-w-5xl">
              <strong className="text-white/40 font-semibold">Independent Service Notice:</strong>{" "}
              Onlinelandregistry.uk is operated by <strong className="text-white/35 font-semibold">Swift Task Services Ltd</strong>, an independent intermediary. We are{" "}
              <strong className="text-white/35 font-semibold">not affiliated with HM Land Registry or the UK Government</strong>. Documents are available directly from{" "}
              <a href="https://www.gov.uk/search-property-information-land-registry" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-white/35 hover:text-white/55 transition-colors inline-flex items-center gap-0.5">
                gov.uk <ExternalLink className="w-2.5 h-2.5" />
              </a>{" "}
              for £7.00 per document. Our prices include the HMLR document fee (£7, passed through at cost) plus our service fee (postcode validation, address mapping, priority dispatch, PDF delivery) with 20% VAT on the service portion only.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/6">
          <div className="container mx-auto px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[0.75rem] text-white/25">
              &copy; {new Date().getFullYear()} Swift Task Services Ltd. All rights reserved.
              <span className="mx-2 text-white/12">·</span>
              Company No. <span className="font-mono">SC123456</span>
            </p>
            <p className="text-[0.75rem] text-white/20">
              1 Limbrick, Blackburn, Lancashire, BB1 8AB
            </p>
          </div>
        </div>

      </footer>
    </div>
  );
}
