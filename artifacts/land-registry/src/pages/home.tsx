import { useEffect, useRef } from "react";
import { useListServices } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  FileText, ArrowRight, Building2, Globe, Lock,
  Search, FileCheck, BadgeCheck, ChevronRight,
  Users, Award, Zap, Clock, Star, Sparkles, Check, PhoneCall,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";
import BookingSteps from "@/components/BookingSteps";

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

const REVIEWS = [
  {
    name: "John Kinghorn",
    title: "Fast & Professional",
    rating: 5,
    text: "Ordered standard HMLR documents and they arrived in my inbox in under 2 hours. Extremely happy with the speed and accuracy of the service. Highly recommended!",
    date: "1 day ago"
  },
  {
    name: "Alastair M.",
    title: "Super-Fast delivery",
    rating: 5,
    text: "Had a tight conveyancing deadline and selected Super-Fast Track. The documents arrived within 40 minutes. Worth every penny to keep the process moving.",
    date: "3 days ago"
  },
  {
    name: "Firebladeboy",
    title: "Outstanding support",
    rating: 5,
    text: "This is an excellent service! Clear, logical website, but what impressed me most was the support. Had a query and a real person got back to me in minutes.",
    date: "1 week ago"
  },
  {
    name: "Maureen C.",
    title: "DJP Transfer made simple",
    rating: 5,
    text: "I was quite daunted by the procedure of removing my deceased husband from the registry. The DJP application service took all the stress away. Fantastic job.",
    date: "2 weeks ago"
  },
  {
    name: "Carol Fennell",
    title: "Simple & stress-free",
    rating: 5,
    text: "I wish I had found this sooner! Saved me the struggle of figuring out the government forms on my own. Excellent interface, clean and extremely simple.",
    date: "3 weeks ago"
  }
];


const CONVEYANCING_SERVICES = [
  {
    id: "transfer-of-equity",
    title: "Transfer of Equity",
    desc: "Add or remove a partner, spouse, or family member from your property title deeds.",
    gif: "/gifs/add_name.gif",
    bullets: [
      "Drafting the TR1 Transfer Deed",
      "Mortgage lender consent handled",
      "HM Land Registry electronic filing",
    ],
  },
  {
    id: "death-of-joint-proprietor",
    title: "Death of a Joint Proprietor",
    desc: "Remove a deceased joint owner from the land registry title with care and precision.",
    gif: "/gifs/death.gif",
    bullets: [
      "Death certificate registration",
      "Survivorship application (DJP)",
      "Title register updated in your name",
    ],
  },
  {
    id: "name-change",
    title: "Name Change on Deeds",
    desc: "Update your legal name on property records due to marriage, divorce, or deed poll.",
    gif: "/gifs/namechange.gif",
    bullets: [
      "Deed poll or marriage cert accepted",
      "Official title register update",
      "Confirmation letter provided",
    ],
  },
  {
    id: "removal-of-restriction",
    title: "Removal of a Restriction",
    desc: "Clear outdated charges, restrictions, or cautions from your property title.",
    gif: "/gifs/tennant.gif",
    bullets: [
      "Restriction assessment included",
      "RX3 / RX4 form preparation",
      "Outdated charge or caveat cleared",
    ],
  },
  {
    id: "transfer-of-equity-wills-probate",
    title: "Transfer of Equity (Wills / Probate)",
    desc: "Transfer property ownership following probate, inheritance, or estate administration.",
    gif: "/gifs/add_name.gif",
    bullets: [
      "Probate grant review",
      "Assent or transfer deed drafted",
      "Estate administration support",
    ],
  },
  {
    id: "applying-for-restriction",
    title: "Applying for a Restriction",
    desc: "Protect your interest or trust ownership to prevent unauthorized property sale.",
    gif: "/gifs/tennant.gif",
    bullets: [
      "RX1 restriction application",
      "Protects trust / joint ownership",
      "Prevents unauthorised sale",
    ],
  },
  {
    id: "first-registration",
    title: "First Registration",
    desc: "Register unregistered historic deeds with HM Land Registry for modern legal security.",
    gif: "/gifs/first_registration.gif",
    bullets: [
      "Historic deeds reviewed & verified",
      "Form FR1 filed electronically",
      "Official title register created",
    ],
  },
];


function LiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);
    
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    
    window.addEventListener("resize", handleResize, { passive: true });
    
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];
    
    // Create particles
    const particleCount = Math.min(30, Math.floor((width * height) / 30000));
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15, // very slow drift
        vy: (Math.random() - 0.5) * 0.15,
        radius: Math.random() * 1.5 + 0.5,
      });
    }
    
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw particles and lines (dark slate for light background)
      ctx.fillStyle = "rgba(15, 23, 42, 0.08)";
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        
        // Wrap around boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 150) {
            // Alpha based on distance
            const alpha = (1 - dist / 150) * 0.06;
            ctx.strokeStyle = `rgba(15, 23, 42, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-50 z-0"
    />
  );
}

export default function Home() {
  const { data: apiServices, isLoading } = useListServices();
  const services = Array.isArray(apiServices) ? apiServices : [];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">

      {/* ══════════════════════════════════════
          HERO SECTION (SPLIT LAYOUT - YOU CAN DO PROBATE STYLE)
      ══════════════════════════════════════ */}
      <section className="relative min-h-[580px] lg:min-h-[660px] flex items-center overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/20 py-16 lg:py-24 text-slate-900 border-b border-slate-100">
        
        {/* Sleek, professional UK residential housing backdrop related to our platform */}
        <div className="absolute inset-0 bg-cover bg-center opacity-[0.15] pointer-events-none"
          style={{ backgroundImage: "url('/assets/due-diligence-for-land-purchase.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent pointer-events-none" />

        {/* Dynamic slow particle/node live background */}
        <LiveBackground />

        {/* Soft background grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)", backgroundSize: "32px 32px" }} />

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column - Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              

              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold font-heading leading-[1.1] tracking-tight text-slate-900">
                The easy and affordable way to get <span className="text-[#121f35]">Property Records.</span>
              </h1>

              <p className="text-[1.0625rem] text-slate-650 leading-[1.7] max-w-[620px]">
                <strong className="text-slate-900 font-bold">Onlinelandregistry</strong> empowers you to quickly and confidently obtain Title Registers, Plans, Deeds &amp; more -sourced directly from HM Land Registry
              </p>

              {/* Action Buttons (Pill shape) */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/order">
                  <Button
                    size="lg"
                    className="bg-[#121f35] hover:bg-slate-800 text-white font-bold text-[0.9375rem] px-8 h-12 shadow-md transition-all hover:-translate-y-0.5 rounded-full flex items-center gap-1.5"
                  >
                    ORDER DOCUMENTS &rarr;
                  </Button>
                </Link>
                <a href="#services">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-350 h-12 px-8 text-[0.9375rem] font-bold rounded-full"
                  >
                    Browse Services
                  </Button>
                </a>
              </div>

              {/* Calendly Booking Button */}
              <div className="pt-2">
                <Button
                  onClick={() => {
                    const url = import.meta.env.VITE_CALENDLY_URL || "https://calendly.com/hari-siyantraaisolution/new-meeting";
                    if ((window as any).Calendly) {
                      (window as any).Calendly.initPopupWidget({ url });
                    } else {
                      window.open(url, "_blank");
                    }
                  }}
                  size="lg"
                  className="w-full sm:w-auto bg-[#121f35] hover:bg-[#1a2c4b] text-white font-bold h-14 px-8 rounded-full shadow-md hover:shadow-lg transition-all text-[0.9375rem]"
                >
                  Need help with Conveyancing matters? Book a free call
                </Button>
              </div>

            </div>

            {/* Right Column - Collage Image (Land Registry Collage with transparent PNG) */}
            <div className="lg:col-span-5 relative py-8 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[490px] transition-transform hover:scale-[1.01] duration-300">
                <img
                  src="/assets/land-registry-hero-removebg-preview.png"
                  alt="UK Land Registry search and property documentation portal collage"
                  className="w-full h-auto"
                />
              </div>
            </div>

          </div>
        </div>
        {/* Smooth SVG Wave Transition to dark section */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20 pointer-events-none transform translate-y-[1px]">
          <svg className="block w-full h-[40px] md:h-[70px] lg:h-[90px]" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#060c18" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,202.7C384,192,480,160,576,149.3C672,139,768,149,864,176C960,203,1056,245,1152,245.3C1248,245,1344,203,1392,181.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Testimonials and marketing bars removed for clean corporate style */}

      {/* ══════════════════════════════════════
          SERVICES SECTION (Dark Blue BG & Gold Cards)
      ══════════════════════════════════════ */}
      <section className="pt-8 pb-24 relative overflow-hidden bg-slate-900" id="services">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: "url('/assets/modern-office-blurred-background.jpg')" }}
        />
        {/* Semi-transparent dark overlay for text readability */}
        <div className="absolute inset-0 bg-slate-900/60 pointer-events-none" />

        {/* Animated Background Mesh & Floating Lights */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "45px 45px" }} />
        
        {/* Breathing ambient dark blue / gold glows */}
        <div className="absolute top-20 left-1/3 w-[450px] h-[450px] bg-amber-500/[0.04] rounded-full blur-[110px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-20 right-1/3 w-[550px] h-[550px] bg-blue-600/[0.04] rounded-full blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-amber-500/[0.01] to-blue-500/[0.01] rounded-full blur-[140px] pointer-events-none" />

        <div className="container mx-auto px-6 lg:px-8 relative z-10">

          <div className="mb-16 text-center max-w-xl mx-auto space-y-5">
            <div>
              <span className="text-[0.6875rem] font-black tracking-[0.22em] uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full shadow-sm shadow-amber-500/5">
                Our Services
              </span>
            </div>
            <h2 className="text-3xl md:text-[2.75rem] font-extrabold font-heading text-white leading-tight tracking-tight pt-2">
              Choose Your Document
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full mx-auto shadow-[0_0_10px_rgba(245,158,11,0.4)]" />
            <p className="text-slate-400 text-sm sm:text-[0.9375rem] leading-relaxed max-w-lg mx-auto">
              Every document is retrieved directly from HM Land Registry — legally valid and accepted nationwide for mortgages, disputes, and sales.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white/5 rounded-2xl p-4 sm:p-7 space-y-3 sm:space-y-4 border border-white-8/40">
                  <Skeleton className="h-8 w-8 sm:h-11 sm:w-11 rounded-xl bg-white/10" />
                  <Skeleton className="h-3 sm:h-5 w-2/3 bg-white/10" />
                  <Skeleton className="hidden sm:block h-3 w-full bg-white/10" />
                  <Skeleton className="hidden sm:block h-3 w-4/5 bg-white/10" />
                  <Skeleton className="hidden sm:block h-10 w-full mt-2 bg-white/10" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {services?.map((service, idx) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: idx * 0.08 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="h-full flex"
                >
                  <Link
                    href={`/order?service=${service.slug}`}
                    className="group relative w-full h-full p-[1px] rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-200/50 to-transparent hover:from-amber-400 hover:via-yellow-300 hover:to-amber-500 transition-all duration-500 flex flex-col justify-between overflow-hidden shadow-lg shadow-black/30 hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.2)]"
                  >
                    {/* Inner White Box */}
                    <div className="bg-white/95 group-hover:bg-white rounded-[15px] p-3 sm:p-7 h-full w-full flex flex-col justify-between overflow-hidden relative transition-colors duration-500 backdrop-blur-sm">
                      
                      {/* Animated gold backdrop wash */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/[0.04] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[15px]" />

                      {/* ── Mobile compact view ── */}
                      <div className="flex flex-col items-center text-center gap-2 sm:hidden">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/15 to-yellow-400/5 border border-amber-500/30 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="text-[0.65rem] font-extrabold text-slate-900 leading-tight line-clamp-2">{service.name}</p>
                        {service.basePrice !== undefined && (
                          <span className="text-[0.6rem] font-bold text-amber-600">from £{service.basePrice}</span>
                        )}
                      </div>

                      {/* ── Desktop full view ── */}
                      <div className="hidden sm:block">
                        {/* Top line with Icon */}
                        <div className="flex items-start justify-between mb-6 relative z-10">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/15 to-yellow-400/5 border border-amber-500/30 group-hover:border-amber-400 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center justify-center transition-all duration-300">
                              <FileText className="w-5 h-5 text-amber-500 group-hover:text-amber-600 group-hover:scale-110 transition-all duration-300" />
                            </div>
                            <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 text-[10px] font-black tracking-wider shadow-md shadow-amber-500/40">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                          </div>
                        </div>

                        {/* Service metadata & desc */}
                        <h3 className="font-extrabold text-slate-900 font-heading text-[1.125rem] leading-snug mb-2.5 group-hover:text-amber-600 transition-colors duration-300">
                          {service.name}
                        </h3>
                        <p className="text-[0.875rem] text-slate-650 leading-relaxed line-clamp-2 mb-6 group-hover:text-slate-700 transition-colors duration-300">
                          {service.description}
                        </p>

                        {/* Deliverables tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {service.deliverables?.split(",").slice(0, 3).map((d: string) => (
                            <span
                              key={d}
                              className="inline-flex items-center text-[0.7rem] font-bold text-amber-700 bg-amber-500/5 group-hover:bg-amber-500/10 px-3 py-1 rounded-lg transition-all duration-300 border border-amber-500/20 group-hover:border-amber-400/30"
                            >
                              {d.trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer info — desktop only */}
                      <div className="hidden sm:flex items-center justify-between pt-4 border-t border-slate-100 group-hover:border-amber-500/20 transition-colors mt-auto relative z-10">
                        {service.turnaround ? (
                          <div className="flex items-center gap-1.5 text-[0.75rem] font-bold text-slate-500 group-hover:text-slate-700 transition-colors">
                            <Clock className="w-3.5 h-3.5 shrink-0 text-amber-500 group-hover:text-amber-600" />
                            {service.turnaround}
                          </div>
                        ) : <span />}
                        <span className="flex items-center gap-1 text-[0.875rem] font-bold text-amber-600 group-hover:text-amber-700 transition-all duration-300">
                          Order Now
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                        </span>
                      </div>

                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link href="/order">
              <Button
                size="lg"
                className="bg-[#121f35] hover:bg-[#1a2c4b] text-white font-bold px-10 h-13 shadow-md hover:shadow-lg transition-all hover:-translate-y-px rounded-lg"
              >
                Start Your Order
                <ArrowRight className="ml-2 w-4.5 h-4.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PROFESSIONAL CONVEYANCING SERVICES SECTION
      ══════════════════════════════════════ */}
      <section className="py-24 bg-transparent relative overflow-hidden" id="conveyancing">
        {/* Background Image (full, reduced overlays) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.95] pointer-events-none"
          style={{ backgroundImage: "url('/assets/conveyancing.jpeg')" }}
        />

        {/* Dark overlay to improve text contrast (increased per request) */}
        <div className="absolute inset-0 bg-black/[0.7] pointer-events-none" />

        {/* Subtle ambient glows (reduced intensity, no pulsing) */}
        <div className="absolute top-20 left-1/4 w-[450px] h-[450px] bg-amber-500/[0.01] rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-[550px] h-[550px] bg-blue-600/[0.01] rounded-full blur-[80px] pointer-events-none" style={{ animationDelay: '1s' }} />

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          
          <div className="text-center mb-16 max-w-2xl mx-auto space-y-4">
            <span className="text-[0.6875rem] font-black tracking-[0.22em] uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full shadow-sm shadow-amber-500/5">
              Expert Conveyancing
            </span>
            <h2 className="text-3xl md:text-[2.75rem] font-extrabold font-heading text-white leading-tight tracking-tight pt-2">
              Our Professional Conveyancers Are Ready to Assist You
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full mx-auto shadow-[0_0_10px_rgba(245,158,11,0.4)]" />
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Explore our comprehensive range of property services:
            </p>
          </div>

          {/* Responsive grid of simple, clean cards */}
          <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-16">
            {CONVEYANCING_SERVICES.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: idx * 0.05 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                onClick={() => {
                  const url = import.meta.env.VITE_CALENDLY_URL || "https://calendly.com/hari-siyantraaisolution/new-meeting";
                  if ((window as any).Calendly) {
                    (window as any).Calendly.initPopupWidget({ url });
                  } else {
                    window.open(url, "_blank");
                  }
                }}
                className="group relative cursor-pointer p-[1px] rounded-xl bg-gradient-to-br from-amber-500/20 via-slate-200/50 to-transparent hover:from-amber-400 hover:via-yellow-300 hover:to-amber-500 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-md shadow-black/25 hover:shadow-[0_15px_30px_-10px_rgba(245,158,11,0.15)]"
              >
                {/* Inner White Box */}
                <div className="bg-white/95 group-hover:bg-white rounded-[11px] p-3 sm:p-6 w-full h-full flex flex-col justify-between overflow-hidden relative transition-colors duration-300 backdrop-blur-sm">
                  {/* Animated gold backdrop wash */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/[0.03] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-[11px]" />

                  {/* ── Mobile compact view ── */}
                  <div className="flex flex-col items-center text-center gap-1.5 sm:hidden relative z-10">
                    <span className="text-[0.6rem] font-black text-amber-500 font-mono">{String(idx + 1).padStart(2, "0")}</span>
                    <p className="text-[0.65rem] font-extrabold text-slate-900 leading-tight line-clamp-3">{s.title}</p>
                    <span className="text-[0.6rem] font-bold text-amber-600">Book now →</span>
                  </div>

                  {/* ── Desktop full view ── */}
                  <div className="hidden sm:flex flex-col h-full space-y-2 text-left relative z-10">
                    <h3 className="font-extrabold text-slate-900 font-heading text-base leading-snug group-hover:text-amber-600 transition-colors duration-300">
                      {s.title}
                    </h3>
                    <p className="text-[0.8125rem] text-slate-500 leading-relaxed group-hover:text-slate-650 transition-colors duration-300">
                      {s.desc}
                    </p>
                  </div>
                  
                  <div className="hidden sm:flex items-center justify-between pt-4 mt-4 border-t border-slate-100 group-hover:border-amber-500/20 transition-colors relative z-10">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:text-amber-700 transition-all duration-300">
                      Book now
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Full-width Book a Free Call Button */}
          <div className="max-w-4xl mx-auto mt-12 relative z-10">
            <Button 
              onClick={() => {
                const url = import.meta.env.VITE_CALENDLY_URL || "https://calendly.com/hari-siyantraaisolution/new-meeting";
                if ((window as any).Calendly) {
                  (window as any).Calendly.initPopupWidget({ url });
                } else {
                  window.open(url, "_blank");
                }
              }}
              size="lg" 
              className="w-full bg-[#121f35] hover:bg-[#1a2c4b] text-white font-bold h-14 rounded-lg shadow-md hover:shadow-lg transition-all text-base uppercase tracking-wider cursor-pointer"
            >
              Book a Free Call
            </Button>
          </div>

        </div>
      </section>



      {/* Steps / Booking section */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900">Ready to Start?</h2>
            <p className="mt-2 text-slate-500">Retrieve official copies of registers, deed plans, and historic transfers. Simple, fast checkout via Stripe.</p>
          </div>

          <div className="max-w-6xl mx-auto">
            <BookingSteps />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SUPPORT AND GUARANTEE DOUBLE CARDS
      ══════════════════════════════════════ */}
      <section className="py-10 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Card 1 - Need Help (styled like reference banner) - now full width */}
            <div className="md:col-span-2 bg-[#121f35] text-white rounded-2xl p-8 sm:p-10 shadow-sm transition-shadow">
              <div className="max-w-6xl mx-auto text-left sm:text-left">
                <h3 className="text-2xl sm:text-3xl font-extrabold">Need help?</h3>
                <p className="mt-4 text-slate-300 text-base max-w-3xl leading-relaxed">
                  If you need support or are struggling to find the right documents, our dedicated team are here to help you with any queries you may have.
                </p>
                <div className="mt-6">
                  <Link href="/contact" className="inline-flex items-center gap-3 text-white font-bold text-lg border-b border-white/30 pb-1">
                    Get help
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

