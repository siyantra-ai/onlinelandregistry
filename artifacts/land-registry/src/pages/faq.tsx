import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PhoneCall, Mail, ArrowLeft, Clock } from "lucide-react";
import SEO from "@/components/SEO";

const FAQS = [
  {
    q: "What is the function of HM Land Registry?",
    a: "HM Land Registry (HMLR) is the official government department responsible for registering land and property ownership in England and Wales. It maintains the definitive database of property ownership, title boundaries, legal charges, and covenants. Sourced documents (Title Registers, Title Plans, and Deeds) serve as legally recognized proof of ownership and encumbrances.",
  },
  {
    q: "What key information is contained within a Title Register?",
    a: "A Title Register is divided into three main sections: the Property Register (describing the land, property type, and associated easements or rights of way); the Proprietorship Register (identifying the legal owners, contact addresses, and restrictions affecting disposal powers); and the Charges Register (detailing mortgages, financial burdens, covenants, and legal restrictions registered against the title).",
  },
  {
    q: "What is the distinction between a Title Register and a Title Plan?",
    a: "The Title Register is the primary text document detailing ownership and legal status. The Title Plan is the official map illustrating the general boundaries of the property, outlined in red, based on Ordnance Survey mapping. These documents share the same title number and are typically required together to form a complete legal view of the property.",
  },
  {
    q: "What are the standard and expedited delivery times?",
    a: "Standard orders are processed and delivered within one working day. We offer priority processing options: Fast Track orders are delivered within 4 working hours, and Super-Fast Track orders are delivered within 1 working hour. Processing hours are Monday to Friday, 9:00 AM to 5:30 PM (excluding UK Bank Holidays).",
  },
  {
    q: "Are the retrieved documents legally admissible?",
    a: "Yes. All Title Registers, Title Plans, and Deeds retrieved through our portal are official copies sourced directly from HM Land Registry. They carry the official copy stamp and are legally admissible in courts, for mortgage applications, by HM Revenue & Customs (HMRC), and during conveyancing transactions.",
  },
  {
    q: "What is a Deed Search and when is it required?",
    a: "A Deed Search retrieves historical deeds, transfer documents (e.g., TR1 forms), or leases filed with HM Land Registry that are not included in the standard register. This is typically required during conveyancing to investigate historic covenants, check rights of way, or verify old lease clauses.",
  },
  {
    q: "Do your retrieval services cover all jurisdictions within the United Kingdom?",
    a: "We cover registered properties in England and Wales via HM Land Registry, and Scotland via the Registers of Scotland (RoS) database. Scottish property searches are processed through the equivalent RoS system, which may incur minor price variations due to regional administrative structures.",
  }
];

export default function FAQPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map(({ q, a }) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": a,
      },
    })),
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <SEO
        title="Frequently Asked Questions (FAQs) | Online Land Registry"
        description="Find professional answers to frequently asked questions about official UK Land Registry documents, title registers, plans, deeds, and conveyancing services."
        schemaData={faqSchema}
      />

      {/* Premium Header Banner */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-slate-500/5 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-accent">Help Center</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Everything you need to know about obtaining official UK Land Registry documents.
          </p>
        </div>
      </section>

      {/* Main FAQ Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            {/* FAQ Accordion list (Left column) */}
            <div className="lg:col-span-2">
              <Accordion type="single" collapsible className="space-y-4">
                {FAQS.map(({ q, a }, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="border border-slate-200 rounded-xl px-5 bg-white shadow-sm transition-all hover:border-slate-300"
                  >
                    <AccordionTrigger className="text-left font-bold text-slate-900 font-heading hover:text-accent hover:no-underline py-5 text-[0.9375rem] sm:text-base leading-snug">
                      {q}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-650 leading-[1.7] pb-5 text-sm">
                      {a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Helpline & Support Panel (Right column) */}
            <div className="space-y-6 lg:sticky lg:top-28">
              
              {/* Call Center Support Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
                    <PhoneCall className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <span className="text-[0.625rem] font-bold text-accent uppercase tracking-wider block">Direct Assistance</span>
                    <h3 className="font-extrabold text-slate-900 text-base font-heading">Professional Support Desk</h3>
                  </div>
                </div>
                
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  For order inquiries or guidance with property search verification, contact our dedicated processing specialists.
                </p>

                <div className="space-y-2.5 pt-2">
                  <a href="tel:03335770077" className="flex items-center justify-center gap-2 w-full text-sm font-bold text-white bg-accent hover:bg-accent/90 px-4 py-3 rounded-lg transition-colors">
                    <PhoneCall className="w-4 h-4" /> 0333 577 0077
                  </a>
                  <a href="mailto:support@onlinelandregistry.uk" className="flex items-center justify-center gap-2 w-full text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-4 py-3 rounded-lg transition-colors">
                    <Mail className="w-4 h-4" /> support@onlinelandregistry.uk
                  </a>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium pt-1 border-t border-slate-100">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Mon–Fri: 9am–5pm</span>
                </div>
              </div>

              {/* Legal Admissibility Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                <h4 className="font-extrabold text-sm uppercase text-accent tracking-wider">Official Stamp</h4>
                <h3 className="font-extrabold text-base font-heading">Legally Valid Copies</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  All downloaded registers, deed plans, and certificates carry the official Land Registry copy stamp, rendering them fully admissible for conveyancing, remortgages, and court disputes.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

