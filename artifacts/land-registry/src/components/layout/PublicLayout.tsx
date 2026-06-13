import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Menu, X, Mail
} from "lucide-react";


const FOOTER_COMPANY = [
  { label: "About Us",           href: "/about" },
  { label: "Contact Support",    href: "/contact" },
  { label: "FAQs",               href: "/faqs" },
  { label: "Privacy Policy",     href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Cookie Policy",      href: "/cookies" },
];

const NAV_LINKS = [
  { label: "SERVICES",     href: "/#services" },
  { label: "FAQS",         href: "/faqs" },
  { label: "CONTACT",      href: "mailto:support@onlinelandregistry.uk" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">

      {/* ─── Navigation ─── */}
      <header className="bg-white text-slate-900 sticky top-0 z-50 border-b border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMenuOpen(false)}>
              <div className="bg-[#121f35] p-1.5 rounded-md">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="font-heading font-bold text-[1.0625rem] tracking-tight text-slate-900">
                Onlinelandregistry
              </span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-[0.8125rem] font-bold tracking-wider">
            {NAV_LINKS.map(({ label, href }) =>
              href.startsWith("/") && !href.includes("#") ? (
                <Link key={label} href={href} className="text-slate-650 hover:text-slate-900 transition-colors">{label}</Link>
              ) : (
                <a key={label} href={href} className="text-slate-650 hover:text-slate-900 transition-colors">{label}</a>
              )
            )}
          </nav>

          <div className="flex items-center gap-3">
            {/* Buy now style order button */}
            <Link href="/order" className="hidden sm:block">
              <Button className="bg-[#00b67a] hover:bg-[#009e6a] text-white font-bold text-xs tracking-wider h-9 px-5 shadow-sm rounded-full transition-all hover:-translate-y-0.5 flex items-center gap-1">
                ORDER NOW &rarr;
              </Button>
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-slate-700 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 pb-5 pt-3 space-y-1">
            {NAV_LINKS.map(({ label, href }) =>
              href.startsWith("/") && !href.includes("#") ? (
                <Link
                  key={label} href={href}
                  className="block py-2.5 px-3 text-[0.875rem] font-bold text-slate-705 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ) : (
                <a
                  key={label} href={href}
                  className="block py-2.5 px-3 text-[0.875rem] font-bold text-slate-705 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </a>
              )
            )}
            <div className="pt-3">
              <Link href="/order" onClick={() => setMenuOpen(false)}>
                <Button className="w-full bg-[#00b67a] hover:bg-[#009e6a] text-white font-bold h-11 rounded-full flex items-center justify-center gap-1">
                  ORDER NOW &rarr;
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* ─── Footer ─── */}
      <footer className="bg-white border-t border-slate-200 font-sans">

        {/* Main grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10">
          <div className="grid gap-10 sm:grid-cols-3">

            {/* Col 1 — Brand */}
            <div className="sm:col-span-1 space-y-5">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="bg-[#121f35] p-2 rounded-lg shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="font-heading font-bold text-[1rem] tracking-tight text-slate-900">Online Land Registry</span>
              </Link>
              <p className="text-sm text-slate-500 leading-relaxed">
                Fast, reliable access to official HM Land Registry documents — delivered online in minutes.
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Mail className="w-4 h-4 shrink-0 text-slate-400" />
                <a href="mailto:support@onlinelandregistry.uk" className="hover:text-slate-900 transition-colors">
                  support@onlinelandregistry.uk
                </a>
              </div>
            </div>

            {/* Col 2 — Company */}
            <div className="space-y-4">
              <h3 className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-400">Company</h3>
              <ul className="space-y-2.5">
                {FOOTER_COMPANY.map(({ label, href }) => (
                  <li key={label}>
                    {href.startsWith("/") ? (
                      <Link href={href} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                        {label}
                      </Link>
                    ) : (
                      <a href={href} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Get Started */}
            <div className="space-y-4">
              <h3 className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-400">Get Started</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Order an official land registry document in under 2 minutes.
              </p>
              <Link href="/order">
                <Button className="bg-[#00b67a] hover:bg-[#009e6a] text-white font-bold text-xs tracking-wider h-10 px-5 rounded-full transition-all hover:-translate-y-0.5 shadow-md shadow-[#00b67a]/25">
                  ORDER NOW →
                </Button>
              </Link>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-400 text-center sm:text-left">
              © {new Date().getFullYear()} Online Land Registry. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-slate-400">
              <a href="/terms" className="hover:text-slate-700 transition-colors">Terms of Service</a>
              <a href="/privacy" className="hover:text-slate-700 transition-colors">Privacy Policy</a>
              <a href="/cookies" className="hover:text-slate-700 transition-colors">Cookie Policy</a>
              <a href="/refund-policy" className="hover:text-slate-700 transition-colors">Refund Policy</a>
            </div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-6">
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              We are a commercial company neither owned by nor affiliated with HM Land Registry or the Government. Documents provided are as held by HM Land Registry. We charge an administration fee for our online services.
            </p>
          </div>
        </div>

      </footer>
    </div>
  );
}
