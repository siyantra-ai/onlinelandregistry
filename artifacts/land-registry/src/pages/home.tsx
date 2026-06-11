import { useState } from "react";
import { useListServices } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "wouter";
import {
  FileText, CheckCircle2, ShieldCheck, Clock, FileSearch,
  Zap, Star, ArrowRight, Building2, Globe, Lock,
  Search, FileCheck, BadgeCheck, ChevronRight, Users, Award
} from "lucide-react";

/* ─── Static data ─── */

const STATS = [
  { value: "47,000+", label: "Documents Delivered" },
  { value: "< 2hrs",  label: "Average Turnaround" },
  { value: "99.8%",   label: "Accuracy Rate" },
  { value: "4.9 ★",   label: "Customer Rating" },
];

const FEATURES = [
  {
    icon: BadgeCheck,
    title: "Official HMLR Source",
    desc: "Every document is sourced directly from HM Land Registry — the authoritative UK government record.",
  },
  {
    icon: Zap,
    title: "Express Processing",
    desc: "Fast Track delivery within 4 hours. Super-Fast Track within 1 hour for urgent conveyancing needs.",
  },
  {
    icon: Lock,
    title: "Bank-Grade Security",
    desc: "TLS 1.3 encryption, PCI-compliant payments, and zero storage of card data — ever.",
  },
  {
    icon: Globe,
    title: "England, Wales & Scotland",
    desc: "Full coverage across all three jurisdictions. Scotland orders are handled by Registers of Scotland.",
  },
  {
    icon: Users,
    title: "Built for Professionals",
    desc: "Trusted by conveyancers, solicitors, estate agents, and property investors nationwide.",
  },
  {
    icon: Award,
    title: "Transparent Pricing",
    desc: "No hidden fees. The official £7 HMLR document fee is itemised separately from our service charge.",
  },
];

const STEPS = [
  {
    num: "01",
    icon: Search,
    title: "Choose Your Document",
    desc: "Select from 7 official document types — from Title Registers to DJP applications.",
  },
  {
    num: "02",
    icon: Building2,
    title: "Enter Property Details",
    desc: "Provide the full address or HMLR title number. We validate it against the official index.",
  },
  {
    num: "03",
    icon: FileCheck,
    title: "Secure Checkout",
    desc: "Pay safely via Stripe. Your price is calculated server-side — never manipulated in the browser.",
  },
  {
    num: "04",
    icon: FileText,
    title: "Receive Your Documents",
    desc: "Official PDFs land in your inbox, typically within hours of your order being placed.",
  },
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
    a: "The Title Register is a text-based document confirming legal ownership and any associated rights and charges. The Title Plan is an OS-based map showing the general boundary of the property, drawn to a stated scale with the property outlined in red. Both documents use the same title number and are typically ordered together — which is why our Ownership Bundle combines both for a saving of £12 compared to ordering separately.",
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
    a: "Standard orders are typically fulfilled the next working day. With Fast Track, you receive your documents within 4 working hours. Super-Fast Track guarantees delivery within 1 working hour and is ideal for urgent completions or same-day exchange. Turnaround times are calculated from order confirmation during business hours (Mon–Fri, 9am–5:30pm).",
  },
  {
    q: "Are Land Registry documents legally valid?",
    a: "Yes. Official copies (often called 'office copies') obtained from HM Land Registry are legally admissible and accepted by solicitors, banks, mortgage lenders, courts, and HMRC as proof of ownership, title, and registered interests. The documents we retrieve carry the official HMLR office copy stamp.",
  },
  {
    q: "What is a Deed Search and when do I need one?",
    a: "A Deed Search retrieves historic title deeds and pre-registration documents that are stored with the Land Registry but not shown in the standard Title Register. These include original TR1 transfer forms, historical conveyances, old leasehold contracts, and lease copies. Deed Searches are commonly required during conveyancing, when a solicitor needs to investigate the full history of a title, or when historic covenants and rights need to be verified.",
  },
  {
    q: "Do you cover properties in Scotland and Wales?",
    a: "Yes. We cover registered properties across England, Wales, and Scotland. Properties in England and Wales are registered with HM Land Registry. Scottish properties are registered with Registers of Scotland (RoS), which operates a separate but equivalent system. Please note that a small Scotland service fee premium applies due to the additional processing requirements of the RoS system.",
  },
  {
    q: "What is a Deceased Joint Proprietor (DJP) application?",
    a: "When a property is owned jointly and one of the registered proprietors has died, the title must be updated via a Deceased Joint Proprietor (DJP) form (form DJP). This removes the deceased owner from the register and confirms sole ownership in the surviving proprietor's name. Our DJP Application service at £65 covers full form preparation, HMLR filing, and title transfer to the sole owner — helping bereaved families avoid the complexity of doing this themselves.",
  },
  {
    q: "Is this website affiliated with HM Land Registry or the UK Government?",
    a: "No. Onlinelandregistry.uk is operated by Swift Task Services Ltd, an independent private company. We are not affiliated with, endorsed by, or part of HM Land Registry or any other UK Government body. We are an intermediary retrieval service that obtains official documents on your behalf and adds value through our processing, validation, and priority delivery services.",
  },
  {
    q: "What payment methods do you accept, and is my payment secure?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, Amex) via Stripe — one of the world's most trusted payment processors. All transactions use TLS 1.3 encryption. We never store your card details; payment is processed entirely within Stripe's PCI DSS Level 1 certified infrastructure. Your order total is always calculated server-side, ensuring no price manipulation is possible.",
  },
];

/* ─── Component ─── */

export default function Home() {
  const { data: services, isLoading } = useListServices();

  return (
    <div className="flex flex-col min-h-screen">

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-primary">

        {/* Background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1920&q=80')",
          }}
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#16243B]/95 via-[#16243B]/80 to-[#16243B]/40" />
        {/* Subtle amber vignette bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#16243B] to-transparent" />

        <div className="container mx-auto px-4 py-28 relative z-10">
          <div className="max-w-2xl space-y-7">

            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent text-xs font-semibold px-4 py-1.5 rounded-full backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Official UK Land Registry Documents
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading leading-[1.08] tracking-tight text-white">
              Property Records.{" "}
              <span className="text-accent">Delivered</span>{" "}
              in Hours.
            </h1>

            <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-xl">
              Instant access to Title Registers, Plans, Deeds &amp; more — sourced directly from HM Land Registry. Trusted by solicitors, conveyancers and homeowners across England, Wales &amp; Scotland.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/order">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-white font-bold text-base px-8 h-13 shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] group"
                >
                  Order Documents Now
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#services">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm h-13 px-8 text-base font-semibold"
                >
                  Browse Services
                </Button>
              </a>
            </div>

            {/* Trust micro-signals */}
            <div className="flex flex-wrap gap-5 pt-2">
              {[
                "No hidden fees",
                "Secure Stripe checkout",
                "HMLR official copies",
              ].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-sm text-white/60 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-accent/80" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative right-side glow */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* ══════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════ */}
      <section className="bg-white border-b border-border/60">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/60">
            {STATS.map(({ value, label }) => (
              <div key={label} className="py-8 px-6 text-center">
                <div className="text-3xl font-bold font-heading text-primary mb-1">{value}</div>
                <div className="text-sm text-muted-foreground font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SERVICES
      ══════════════════════════════════════════ */}
      <section className="py-24 bg-gray-50/80" id="services">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-2xl mx-auto space-y-4">
            <Badge variant="outline" className="border-accent/40 text-accent font-semibold px-4 py-1">
              Our Services
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-primary leading-tight">
              Select Your Document
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Every document is an official copy from HM Land Registry. Not sure what you need? Our{" "}
              <Link href="/order?service=ownership-bundle" className="text-accent underline underline-offset-2 hover:text-accent/80">
                Ownership Bundle
              </Link>{" "}
              is our most requested service.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="h-[280px]">
                  <CardHeader>
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                  <CardContent><Skeleton className="h-16 w-full" /></CardContent>
                  <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services?.map((service) => (
                <Card
                  key={service.id}
                  className={`group flex flex-col relative overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10
                    ${service.popular
                      ? "border-accent/40 shadow-lg shadow-accent/10 bg-white"
                      : "border-border/50 shadow-sm bg-white hover:border-primary/20"
                    }`}
                >
                  {service.popular && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent via-accent/80 to-accent/20" />
                  )}
                  {service.popular && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px] font-bold uppercase tracking-wider">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-3">
                      <div className={`p-2.5 rounded-xl ${service.popular ? "bg-accent/10 text-accent" : "bg-primary/5 text-primary"} transition-colors group-hover:bg-accent/10 group-hover:text-accent`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">From</div>
                        <div className="text-2xl font-bold font-heading text-primary">
                          £{service.basePrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-lg font-heading text-primary leading-snug">{service.name}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed line-clamp-2">{service.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 pt-0">
                    <div className="border-l-2 border-accent/40 pl-3 py-1">
                      <span className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-1">Includes</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">{service.deliverables}</p>
                    </div>
                    {service.turnaround && (
                      <div className="flex items-center gap-1.5 mt-3 text-xs font-medium text-primary/70">
                        <Clock className="w-3.5 h-3.5" />
                        {service.turnaround}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-2">
                    <Link href={`/order?service=${service.slug}`} className="w-full">
                      <Button
                        className={`w-full font-semibold group/btn transition-all ${service.popular
                          ? "bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/20"
                          : "bg-primary hover:bg-primary/90 text-white"
                        }`}
                      >
                        Order Now
                        <ChevronRight className="ml-1 w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-2xl mx-auto space-y-4">
            <Badge variant="outline" className="border-accent/40 text-accent font-semibold px-4 py-1">
              Why Choose Us
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-primary leading-tight">
              Professional Document Retrieval, Done Right
            </h2>
            <p className="text-muted-foreground text-lg">
              We combine the reliability of official HMLR records with a streamlined, professional service built for property practitioners and private buyers alike.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group p-6 rounded-2xl border border-border/50 bg-gray-50/50 hover:bg-white hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/5 group-hover:bg-accent/10 text-primary group-hover:text-accent flex items-center justify-center mb-4 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-primary font-heading mb-2 text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section className="py-24 bg-primary relative overflow-hidden" id="how-it-works">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/3 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 max-w-2xl mx-auto space-y-4">
            <Badge variant="outline" className="border-accent/40 text-accent font-semibold px-4 py-1">
              The Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-white leading-tight">
              From Order to Inbox in 4 Steps
            </h2>
            <p className="text-white/60 text-lg">
              A streamlined process designed for speed, accuracy, and complete peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ num, icon: Icon, title, desc }, i) => (
              <div key={num} className="relative">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] right-[-50%] h-px bg-white/10 z-0" />
                )}
                <div className="relative z-10 flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/20 transition-all">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-accent/15 border border-accent/25 text-accent flex items-center justify-center">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-accent text-white text-[10px] font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold font-heading text-white mb-2">{title}</h3>
                    <p className="text-sm text-white/55 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/order">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white font-bold px-10 h-13 shadow-lg shadow-accent/25 transition-all hover:scale-[1.02] group"
              >
                Start Your Order
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════ */}
      <section className="py-24 bg-gray-50/80" id="faqs">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-2xl mx-auto space-y-4">
            <Badge variant="outline" className="border-accent/40 text-accent font-semibold px-4 py-1">
              FAQ
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-primary leading-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about obtaining official UK Land Registry documents.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              {FAQS.map(({ q, a }, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="bg-white border border-border/60 rounded-xl px-6 shadow-sm data-[state=open]:border-accent/30 data-[state=open]:shadow-md data-[state=open]:shadow-accent/5 transition-all"
                >
                  <AccordionTrigger className="text-left font-semibold text-primary font-heading hover:text-accent hover:no-underline py-5 text-base leading-snug">
                    {q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5 text-sm">
                    {a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="text-center mt-10">
              <p className="text-muted-foreground text-sm mb-3">
                Still have questions? Our support team is here to help.
              </p>
              <a href="mailto:support@onlinelandregistry.uk">
                <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary hover:text-white font-semibold">
                  Contact Support
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-white border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6 bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-12 md:p-16 relative overflow-hidden shadow-2xl shadow-primary/20">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

            <div className="relative z-10 space-y-6">
              <Badge className="bg-accent/20 text-accent border-accent/30 font-semibold px-4 py-1">
                Ready to Get Started?
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold font-heading text-white leading-tight">
                Get Your Land Registry Documents Today
              </h2>
              <p className="text-white/65 text-lg max-w-xl mx-auto leading-relaxed">
                Join over 47,000 customers who trust us for fast, accurate, and official UK property document retrieval.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link href="/order">
                  <Button
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-white font-bold px-10 h-13 shadow-lg shadow-accent/30 transition-all hover:scale-[1.02] group"
                  >
                    Order Documents Now
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <a href="#faqs">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/25 text-white bg-white/8 hover:bg-white/15 backdrop-blur-sm h-13 px-8 font-semibold"
                  >
                    Read FAQs
                  </Button>
                </a>
              </div>
              <div className="flex flex-wrap justify-center gap-6 pt-2">
                {["HMLR Official Copies", "Stripe Secure Payments", "Swift Task Services Ltd"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-xs text-white/50 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent/70" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
