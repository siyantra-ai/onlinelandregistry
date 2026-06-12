import { useListServices } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "wouter";
import {
  FileText, ArrowRight, Building2, Globe, Lock,
  Search, FileCheck, BadgeCheck, ChevronRight,
  Users, Award, Zap, Clock, ShieldCheck,
} from "lucide-react";

const STATS = [
  { value: "47,000+", label: "Documents Delivered" },
  { value: "< 2 hrs", label: "Avg. Turnaround" },
  { value: "99.8%",   label: "Accuracy Rate" },
  { value: "4.9 / 5", label: "Customer Rating" },
];

const FEATURES = [
  { icon: BadgeCheck, title: "Official HMLR Source",        desc: "Every document sourced directly from HM Land Registry — the authoritative UK government record." },
  { icon: Zap,        title: "Express Processing",          desc: "Fast Track within 4 hours. Super-Fast Track within 1 hour for urgent conveyancing deadlines." },
  { icon: Lock,       title: "Bank-Grade Security",         desc: "TLS 1.3 encryption and PCI DSS Level 1 payments via Stripe. Zero card data stored." },
  { icon: Globe,      title: "England, Wales & Scotland",   desc: "Full coverage across all three jurisdictions, including Registers of Scotland titles." },
  { icon: Users,      title: "Built for Professionals",     desc: "Trusted by conveyancers, solicitors, estate agents, and property investors nationwide." },
  { icon: Award,      title: "Transparent Pricing",         desc: "The official £7 HMLR fee is always itemised separately from our service charge." },
];

const STEPS = [
  { icon: Search,    title: "Choose a Document",    desc: "Select from 7 official document types — Title Registers, Plans, Deeds and more." },
  { icon: Building2, title: "Enter Property Details", desc: "Provide the address or HMLR title number. We validate it against the official index." },
  { icon: FileCheck, title: "Secure Checkout",       desc: "Pay via Stripe. Your total is always calculated server-side — never browser-manipulated." },
  { icon: FileText,  title: "Receive Documents",     desc: "Official PDFs delivered to your inbox, typically within hours of your order." },
];

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
  {
    q: "Is this website affiliated with HM Land Registry or the UK Government?",
    a: "No. Onlinelandregistry.uk is operated by Swift Task Services Ltd, an independent private company. We are not affiliated with, endorsed by, or part of HM Land Registry or any other UK Government body. We are an intermediary retrieval service that obtains official documents on your behalf.",
  },
  {
    q: "What payment methods do you accept, and is my payment secure?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, Amex) via Stripe. All transactions use TLS 1.3 encryption. We never store your card details; payment is processed entirely within Stripe's PCI DSS Level 1 certified infrastructure. Your order total is always calculated server-side.",
  },
];

const MOCK_SERVICES = [
  {
    id: 1,
    name: "HM Land Registry Title Register",
    slug: "title-register",
    basePrice: 36,
    description: "Official record confirming the registered owners, tenure type (Freehold/Leasehold), purchase price, mortgages, and charges.",
    deliverables: "Official Copy, Register Details, Owner Info",
    turnaround: "From 1 hour",
    popular: true,
  },
  {
    id: 2,
    name: "HM Land Registry Title Plan",
    slug: "title-plan",
    basePrice: 36,
    description: "Scale boundary map illustrating the property outline in red, adjacent access roads, and shared easement zones.",
    deliverables: "Official Copy, Boundary Map, Scale Details",
    turnaround: "From 1 hour",
    popular: false,
  },
  {
    id: 3,
    name: "Property Ownership Bundle",
    slug: "ownership-bundle",
    basePrice: 60,
    description: "Both the Title Register and Title Plan compiled into a single PDF package. Saves money compared to separate orders.",
    deliverables: "Title Register, Title Plan, Combined PDF",
    turnaround: "From 1 hour",
    popular: true,
  },
  {
    id: 4,
    name: "Official Deed Search",
    slug: "deed-search",
    basePrice: 41,
    description: "Historical transfers (TR1 forms), original leasehold contracts, and historic boundary plans.",
    deliverables: "Historic Deeds, Original TR1, Covenants",
    turnaround: "4 hours Fast-Track",
    popular: false,
  },
  {
    id: 5,
    name: "Map / Land Search",
    slug: "map-land-search",
    basePrice: 53,
    description: "GIS coordinate-based lookup for plots, fields, verges, or forests lacking a standard postal address.",
    deliverables: "GIS Coordinate Map, Parcel Boundary",
    turnaround: "4 hours Fast-Track",
    popular: false,
  },
  {
    id: 6,
    name: "Property Alert Service",
    slug: "property-alert",
    basePrice: 36,
    description: "Fraud monitoring for up to 3 titles. Notifies you instantly if third parties attempt to alter deeds.",
    deliverables: "Fraud Alert, Real-time Monitoring",
    turnaround: "Instant Setup",
    popular: false,
  },
  {
    id: 7,
    name: "Deceased Joint Proprietor (DJP)",
    slug: "deceased-joint-proprietor",
    basePrice: 65,
    description: "Form preparation and filing service to remove a deceased joint owner's name and establish sole absolute title.",
    deliverables: "Form DJP, Registration Update",
    turnaround: "1-2 days Dispatch",
    popular: false,
  }
];

export default function Home() {
  const { data: apiServices, isLoading } = useListServices();
  const services = Array.isArray(apiServices) ? apiServices : MOCK_SERVICES;

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="relative min-h-[620px] h-[88vh] max-h-[860px] flex items-center overflow-hidden">
        {/* Background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-[1.02]"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1920&q=85')",
          }}
        />
        {/* Lighter directional overlay — more photo visible on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#16243B]/90 via-[#16243B]/60 to-[#16243B]/20" />
        {/* Fade to white at very bottom for smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/8 to-transparent" />

        <div className="container mx-auto px-6 lg:px-8 py-32 relative z-10">
          <div className="max-w-[680px] space-y-8">

            {/* Eyebrow */}
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-accent/90">
              Official UK Land Registry Documents
            </p>

            <h1 className="text-5xl md:text-[3.75rem] lg:text-[4.5rem] font-bold font-heading leading-[1.06] tracking-tight text-white">
              Property Records,{" "}
              <em className="not-italic text-accent">Delivered Fast.</em>
            </h1>

            <p className="text-[1.125rem] text-white/65 leading-[1.75] max-w-[520px]">
              Obtain Title Registers, Plans, Deeds &amp; more — sourced
              directly from HM Land Registry. Built for homeowners,
              solicitors, and property professionals.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/order">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-white font-bold text-[0.9375rem] px-7 h-12 shadow-xl shadow-accent/25 transition-all hover:shadow-accent/40 hover:-translate-y-px group rounded-lg"
                >
                  Order Documents
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <a href="#services">
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-white/10 border border-white/15 h-12 px-7 text-[0.9375rem] font-semibold backdrop-blur-sm rounded-lg"
                >
                  Browse Services
                </Button>
              </a>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 border-t border-white/10 pt-6">
              {[
                { icon: ShieldCheck, text: "Stripe-secured checkout" },
                { icon: BadgeCheck,  text: "HMLR official copies" },
                { icon: Clock,       text: "Delivery from 1 hour" },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1.5 text-[0.8125rem] text-white/50 font-medium">
                  <Icon className="w-3.5 h-3.5 text-accent/70 shrink-0" />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SERVICES
      ══════════════════════════════════════ */}
      <section className="py-28 bg-[#f8f9fb]" id="services">
        <div className="container mx-auto px-6 lg:px-8">

          <div className="mb-14">
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-accent mb-4">Our Services</p>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <h2 className="text-4xl md:text-[2.75rem] font-bold font-heading text-primary leading-tight max-w-lg">
                Choose Your Document
              </h2>
              <p className="text-muted-foreground text-base max-w-xs leading-relaxed md:text-right">
                Every document is an official HMLR copy — legally valid and accepted nationwide.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-7 space-y-4 border border-border/50">
                  <Skeleton className="h-11 w-11 rounded-xl" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-10 w-full mt-2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {services?.map((service, idx) => (
                <Link
                  key={service.id}
                  href={`/order?service=${service.slug}`}
                  className="group relative bg-white rounded-2xl border border-border/60 p-7 flex flex-col overflow-hidden
                    hover:border-primary/25 hover:shadow-2xl hover:shadow-primary/8 hover:-translate-y-1
                    transition-all duration-300 cursor-pointer"
                >
                  {/* Subtle gradient wash on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-accent/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />

                  {/* Top row — icon + price */}
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    {/* Icon with gradient background */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-accent/15 group-hover:to-accent/5 flex items-center justify-center transition-all duration-300">
                        <FileText className="w-5 h-5 text-primary group-hover:text-accent transition-colors duration-300" />
                      </div>
                      {/* Step number watermark */}
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary/8 group-hover:bg-accent/15 text-primary/50 group-hover:text-accent text-[9px] font-black flex items-center justify-center transition-all duration-300">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Price badge */}
                    <div className="text-right">
                      <div className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-muted-foreground/50 mb-0.5">from</div>
                      <div className="text-[1.625rem] font-bold font-heading text-primary leading-none">
                        £{service.basePrice.toFixed(0)}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex-1 flex flex-col">
                    <h3 className="font-bold text-primary font-heading text-[1.0625rem] leading-snug mb-2.5 group-hover:text-primary transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-[0.8125rem] text-muted-foreground leading-relaxed line-clamp-2 mb-5 flex-1">
                      {service.description}
                    </p>

                    {/* Deliverables chip row */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {service.deliverables?.split(",").slice(0, 3).map((d: string) => (
                        <span
                          key={d}
                          className="inline-flex items-center text-[0.6875rem] font-medium text-primary/60 bg-primary/4 group-hover:bg-accent/8 group-hover:text-accent/80 px-2.5 py-1 rounded-full transition-colors duration-300"
                        >
                          {d.trim()}
                        </span>
                      ))}
                    </div>

                    {/* Footer row */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50 group-hover:border-primary/10 transition-colors">
                      {service.turnaround ? (
                        <div className="flex items-center gap-1.5 text-[0.75rem] font-medium text-muted-foreground/60">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          {service.turnaround}
                        </div>
                      ) : <span />}
                      <span className="flex items-center gap-1 text-[0.8125rem] font-bold text-primary group-hover:text-accent transition-colors duration-300">
                        Order Now
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES — split layout
      ══════════════════════════════════════ */}
      <section className="py-28 bg-[#f8f9fb] border-y border-border/40">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_1.6fr] gap-20 items-start">

            {/* Left — header */}
            <div className="lg:sticky lg:top-28 space-y-6">
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-accent">Why Choose Us</p>
              <h2 className="text-4xl md:text-[2.75rem] font-bold font-heading text-primary leading-tight">
                Professional Retrieval, Done Properly
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We combine the reliability of official HMLR records with a streamlined service built for property practitioners and private buyers.
              </p>
              <Link href="/order">
                <Button className="bg-primary hover:bg-primary/90 text-white font-semibold h-11 px-6 group mt-2">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Right — feature grid */}
            <div className="grid sm:grid-cols-2 gap-5">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="group bg-white rounded-2xl border border-border/60 p-6 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/4 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/5 group-hover:bg-accent/8 text-primary group-hover:text-accent flex items-center justify-center mb-4 transition-colors">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-bold text-primary font-heading mb-1.5 text-[0.9375rem]">{title}</h3>
                  <p className="text-[0.8125rem] text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════ */}
      <section className="py-28 bg-primary relative overflow-hidden" id="how-it-works">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/6 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 max-w-xl mx-auto space-y-5">
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-accent/80">The Process</p>
            <h2 className="text-4xl md:text-[2.75rem] font-bold font-heading text-white leading-tight">
              From Order to Inbox in 4 Steps
            </h2>
            <p className="text-white/50 leading-relaxed">
              A streamlined process designed for speed, accuracy, and complete peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="relative bg-white/5 border border-white/8 rounded-2xl p-7 hover:bg-white/8 hover:border-white/15 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/20 text-accent flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[2rem] font-black font-heading text-white/10 leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-bold font-heading text-white text-[0.9375rem] mb-2">{title}</h3>
                <p className="text-[0.8125rem] text-white/45 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link href="/order">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white font-bold px-9 h-12 shadow-xl shadow-accent/25 transition-all hover:-translate-y-px group rounded-lg"
              >
                Start Your Order
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FAQ
      ══════════════════════════════════════ */}
      <section className="py-28 bg-white" id="faqs">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-[340px_1fr] gap-20 items-start">

            {/* Left col */}
            <div className="lg:sticky lg:top-28 space-y-5">
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-accent">FAQ</p>
              <h2 className="text-4xl font-bold font-heading text-primary leading-tight">
                Common Questions
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Everything you need to know about obtaining official UK Land Registry documents.
              </p>
              <a href="mailto:support@onlinelandregistry.uk">
                <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary hover:text-white font-semibold h-11 mt-2">
                  Contact Support
                </Button>
              </a>
            </div>

            {/* Right col — accordion */}
            <Accordion type="single" collapsible className="space-y-2">
              {FAQS.map(({ q, a }, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border border-border/60 rounded-xl px-5 bg-[#fafbff] data-[state=open]:bg-white data-[state=open]:border-primary/20 data-[state=open]:shadow-sm transition-all"
                >
                  <AccordionTrigger className="text-left font-semibold text-primary font-heading hover:text-accent hover:no-underline py-5 text-[0.9375rem] leading-snug">
                    {q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-[1.75] pb-5 text-sm">
                    {a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA
      ══════════════════════════════════════ */}
      <section className="py-24 bg-[#f8f9fb] border-t border-border/50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="relative overflow-hidden bg-primary rounded-3xl px-8 md:px-16 py-16 text-center">
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/4 rounded-full blur-2xl" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-accent/80">Ready to Get Started?</p>
              <h2 className="text-4xl md:text-[2.75rem] font-bold font-heading text-white leading-tight">
                Get Your Land Registry Documents Today
              </h2>
              <p className="text-white/55 text-lg leading-relaxed">
                Join over 47,000 customers who trust us for fast, accurate, and official UK property document retrieval.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link href="/order">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold px-9 h-12 shadow-xl shadow-accent/30 transition-all hover:-translate-y-px group rounded-lg">
                    Order Documents Now
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
                <a href="#faqs">
                  <Button size="lg" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 border border-white/15 h-12 px-8 font-semibold rounded-lg">
                    Read FAQs
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
