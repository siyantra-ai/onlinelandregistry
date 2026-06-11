import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { FileText, Map, Package, Search, MapPin, Bell, FileSignature, Mail, Phone, ExternalLink, ShieldAlert } from "lucide-react";

const services = [
  { icon: FileText,      label: "Title Register",    price: "£36", slug: "title-register" },
  { icon: Map,           label: "Title Plan",         price: "£36", slug: "title-plan" },
  { icon: Package,       label: "Ownership Bundle",   price: "£60", slug: "ownership-bundle" },
  { icon: Search,        label: "Deed Search",        price: "£41", slug: "deed-search" },
  { icon: MapPin,        label: "Map / Land Search",  price: "£53", slug: "map-land-search" },
  { icon: Bell,          label: "Property Alert",     price: "£36", slug: "property-alert" },
  { icon: FileSignature, label: "DJP Application",    price: "£65", slug: "deceased-joint-proprietor" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* ─── Header ─── */}
      <header className="bg-primary text-primary-foreground border-b border-primary/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-accent text-accent-foreground p-1.5 rounded-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="font-heading font-bold text-lg tracking-tight">
              Onlinelandregistry<span className="text-accent/90">.uk</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-primary-foreground/80 hover:text-white transition-colors">Services</Link>
            <a href="#how-it-works" className="text-primary-foreground/80 hover:text-white transition-colors">How it Works</a>
            <Link href="/admin" className="text-primary-foreground/80 hover:text-white transition-colors">Admin</Link>
          </nav>
          <Link href="/order">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground border-0 font-semibold shadow-sm hover-elevate">
              Order Documents
            </Button>
          </Link>
        </div>
      </header>

      {/* ─── Page content ─── */}
      <main className="flex-1">{children}</main>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════ */}
      <footer className="bg-primary text-primary-foreground/70">

        {/* ── 4-column grid ── */}
        <div className="container mx-auto px-4 pt-14 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Column 1 — Brand & overview */}
            <div className="space-y-4 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2 text-primary-foreground">
                <div className="bg-accent text-accent-foreground p-1.5 rounded-sm shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="font-heading font-bold text-base tracking-tight">
                  Onlinelandregistry<span className="text-accent">.uk</span>
                </span>
              </Link>
              <p className="text-sm leading-relaxed text-primary-foreground/60">
                A premium, self-service digital document retrieval portal for official UK property records. We simplify the process of obtaining HM Land Registry documents — whether you need ownership confirmation, boundary maps, or title deeds.
              </p>
              <p className="text-xs leading-relaxed text-primary-foreground/45 pt-1">
                Operated by <span className="text-primary-foreground/60 font-medium">Swift Task Services Ltd</span> — an independent intermediary service. Not affiliated with HM Land Registry or the UK Government.
              </p>

              {/* Turnaround badges */}
              <div className="pt-2 space-y-2">
                <p className="text-xs font-semibold text-primary-foreground/50 uppercase tracking-wider">Turnaround</p>
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 shrink-0"></span>
                    <span className="text-primary-foreground/60">Standard — next working day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent shrink-0"></span>
                    <span className="text-primary-foreground/60">Fast Track — within 4 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0"></span>
                    <span className="text-primary-foreground/60">Super-Fast Track — within 1 hour</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2 — Document Shop */}
            <div>
              <h4 className="font-heading font-bold text-primary-foreground text-sm mb-5 uppercase tracking-wider">
                Document Shop
              </h4>
              <ul className="space-y-3">
                {services.map(({ icon: Icon, label, price, slug }) => (
                  <li key={slug}>
                    <Link
                      href={`/order?service=${slug}`}
                      className="flex items-center justify-between gap-2 group text-sm"
                    >
                      <span className="flex items-center gap-2 text-primary-foreground/60 group-hover:text-accent transition-colors">
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        {label}
                      </span>
                      <span className="font-mono text-xs text-primary-foreground/40 group-hover:text-accent/70 transition-colors whitespace-nowrap">
                        {price}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 — Company / Legal */}
            <div>
              <h4 className="font-heading font-bold text-primary-foreground text-sm mb-5 uppercase tracking-wider">
                Company
              </h4>
              <ul className="space-y-3 text-sm">
                {[
                  { label: "About Us", href: "/about" },
                  { label: "FAQs", href: "/faqs" },
                  { label: "Contact Support", href: "/contact" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms & Conditions", href: "/terms" },
                  { label: "Cookie Policy", href: "/cookies" },
                ].map(({ label, href }) => (
                  <li key={href}>
                    <a href={href} className="text-primary-foreground/60 hover:text-accent transition-colors">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 — Contact & Support */}
            <div>
              <h4 className="font-heading font-bold text-primary-foreground text-sm mb-5 uppercase tracking-wider">
                Get in Touch
              </h4>
              <ul className="space-y-4 text-sm">
                <li>
                  <p className="text-xs text-primary-foreground/45 uppercase tracking-wide mb-1 font-semibold">Customer Support</p>
                  <a
                    href="mailto:support@onlinelandregistry.uk"
                    className="flex items-center gap-2 text-primary-foreground/60 hover:text-accent transition-colors break-all"
                    data-testid="link-support-email"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    support@onlinelandregistry.uk
                  </a>
                </li>
                <li>
                  <p className="text-xs text-primary-foreground/45 uppercase tracking-wide mb-1 font-semibold">Sales & Trade Enquiries</p>
                  <a
                    href="mailto:sales@onlinelandregistry.uk"
                    className="flex items-center gap-2 text-primary-foreground/60 hover:text-accent transition-colors break-all"
                    data-testid="link-sales-email"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    sales@onlinelandregistry.uk
                  </a>
                </li>
                <li className="pt-2 border-t border-primary-foreground/10">
                  <p className="text-xs text-primary-foreground/45 uppercase tracking-wide mb-1 font-semibold">Registered Office</p>
                  <address className="not-italic text-xs text-primary-foreground/50 leading-relaxed">
                    Swift Task Services Ltd<br />
                    1 Limbrick<br />
                    Blackburn, Lancashire<br />
                    BB1 8AB
                  </address>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Compliance disclaimer box ── */}
        <div className="border-t border-primary-foreground/10">
          <div className="container mx-auto px-4 py-8">
            <div className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-lg p-5 flex gap-4">
              <ShieldAlert className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div className="space-y-2 text-xs text-primary-foreground/55 leading-relaxed">
                <p className="font-semibold text-primary-foreground/70 text-sm">
                  Important — Independent Service Disclosure
                </p>
                <p>
                  <strong className="text-primary-foreground/65">Onlinelandregistry.uk is operated by Swift Task Services Ltd</strong>, an independent intermediary document retrieval service. We are <strong className="text-primary-foreground/65">not affiliated with, endorsed by, or part of HM Land Registry or the UK Government</strong>.
                </p>
                <p>
                  The public records we obtain are available directly from the official government portal at{" "}
                  <a
                    href="https://www.gov.uk/search-property-information-land-registry"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent/80 hover:text-accent underline inline-flex items-center gap-0.5"
                  >
                    gov.uk <ExternalLink className="w-3 h-3" />
                  </a>{" "}
                  for a base fee of <strong className="text-primary-foreground/65">£7.00 per document</strong>.
                </p>
                <p>
                  Our total price includes: the official HM Land Registry document fee (£7.00, passed through at cost) + our intermediary service fee covering postcode &amp; address validation, GIS coordinate mapping, document compilation, priority dispatch, and PDF delivery + <strong className="text-primary-foreground/65">20% VAT applied to the service fee portion only</strong> (not the government document fee).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-primary-foreground/10">
          <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-primary-foreground/40">
            <p>
              &copy; {new Date().getFullYear()} Swift Task Services Ltd. All rights reserved.
              <span className="mx-2 text-primary-foreground/20">|</span>
              Company No. <span className="font-mono">SC123456</span>
            </p>
            <p className="text-center sm:text-right">
              Registered address: 1 Limbrick, Blackburn, Lancashire, BB1 8AB
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
