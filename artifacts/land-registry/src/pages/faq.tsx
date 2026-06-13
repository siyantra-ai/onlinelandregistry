import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PhoneCall, Mail, ArrowLeft, Clock } from "lucide-react";

const FAQS = [
  {
    q: "What is HM Land Registry and why do I need their documents?",
    a: "HM Land Registry (HMLR) is the non-ministerial government department that registers the ownership of land and property in England and Wales. Their documents — Title Registers, Title Plans, and Deeds — are the legal proof of ownership, boundary, and encumbrances for any registered property. You may need them for conveyancing, mortgage applications, boundary disputes, remortgages, probate, or simply to confirm who owns a neighbouring plot.",
  },
  {
    q: "What is a Title Register and what information does it contain?",
    a: "A Title Register (also called the register of title) is the definitive legal record for a registered property. It contains: the registered owner's name and address, the price paid (for purchases since April 2000), any mortgages or charges secured against the property, rights of way, covenants, restrictions, and the property's unique title number. It is split into three parts: Property Register (location), Proprietorship Register (owner), and Charges Register (mortgages and other interests).",
  },
  {
    q: "What is the difference between a Title Register and a Title Plan?",
    a: "The Title Register is a text-based document confirming legal ownership and any associated rights and charges. The Title Plan is an OS-based map showing the general boundary of the property, drawn to a stated scale with the property outlined in red. Both documents use the same title number and are typically ordered together — which is why our Ownership Bundle combines both for a saving compared to ordering separately.",
  },
  {
    q: "How much does it cost to get Land Registry documents?",
    a: "The official government fee charged by HM Land Registry is £7.00 per document (Title Register or Title Plan). Our service price covers this official fee plus our intermediary processing charge — which includes postcode validation, address mapping, document retrieval, quality checking, and priority PDF delivery. Our total prices start from £36 for a Title Register or Title Plan, up to £65 for a Deceased Joint Proprietor (DJP) application. All prices include 20% VAT on our service portion.",
  },
  {
    q: "Can I get Land Registry documents directly from the government?",
    a: "Yes. You can purchase official documents directly from gov.uk/search-property-information-land-registry for the base £7.00 HMLR fee. Our premium service is designed for those who need faster processing, expert validation of the correct title number, professional PDF formatting, priority dispatch, and the peace of mind of a dedicated support team — particularly useful for time-sensitive conveyancing and legal work.",
  },
  {
    q: "How quickly will I receive my documents?",
    a: "Standard orders are typically fulfilled the next working day. With Fast Track, you receive your documents within 4 working hours. Super-Fast Track guarantees delivery within 1 working hour — ideal for urgent completions or same-day exchange. Turnaround times run from order confirmation during business hours (Mon–Fri, 9am–5:30pm).",
  },
  {
    q: "Are Land Registry documents legally valid?",
    a: "Yes. Official copies obtained from HM Land Registry are legally admissible and accepted by solicitors, banks, mortgage lenders, courts, and HMRC as proof of ownership, title, and registered interests. The documents we retrieve carry the official HMLR office copy stamp.",
  },
  {
    q: "What is a Deed Search and when do I need one?",
    a: "A Deed Search retrieves historic title deeds and pre-registration documents stored with the Land Registry but not shown in the standard Title Register. These include original TR1 transfer forms, historical conveyances, old leasehold contracts, and lease copies. Deed Searches are commonly required during conveyancing when a solicitor needs to investigate the full title history.",
  },
  {
    q: "Do you cover properties in Scotland and Wales?",
    a: "Yes. We cover registered properties across England, Wales, and Scotland. Properties in England and Wales are registered with HM Land Registry. Scottish properties are registered with Registers of Scotland (RoS), which operates a separate but equivalent system. A small Scotland service fee premium applies due to the additional RoS processing requirements.",
  },
  {
    q: "What is a Deceased Joint Proprietor (DJP) application?",
    a: "When a property is owned jointly and one proprietor has died, the title must be updated via a DJP form to remove the deceased owner and confirm sole ownership. Our DJP Application service at £65 covers full form preparation, HMLR filing, and title transfer to the surviving proprietor — helping bereaved families navigate this process without the complexity of doing it alone.",
  },
];

export default function FAQPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      
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
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-100 shrink-0 shadow-inner">
                    <img 
                      src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80" 
                      alt="Helpline representative advisor"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[0.625rem] font-bold text-accent uppercase tracking-wider block">Customer Helpline</span>
                    <h3 className="font-extrabold text-slate-900 text-base font-heading">We are here to help</h3>
                  </div>
                </div>
                
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Have an enquiry or need help verifying your search? Speak to our friendly advisors.
                </p>

                <div className="space-y-2.5 pt-2">
                  <a href="tel:08006891447" className="flex items-center justify-center gap-2 w-full text-sm font-bold text-white bg-accent hover:bg-accent/90 px-4 py-3 rounded-lg transition-colors">
                    <PhoneCall className="w-4 h-4" /> 0800 689 1447
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
