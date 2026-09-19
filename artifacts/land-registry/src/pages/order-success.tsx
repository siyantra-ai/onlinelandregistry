import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileText, ArrowRight, ShieldCheck, Clock, Check, Inbox } from "lucide-react";
import { useLocation } from "wouter";
import SEO from "@/components/SEO";

export default function OrderSuccess() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const orderNumber = searchParams.get("order_number") || "OLR-PENDING";

  return (
    <div className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-emerald-500/[0.03] via-slate-50 to-slate-50 flex items-center justify-center py-16 px-4">
      <SEO
        title="Order Successful | Online Land Registry"
        description="Your land registry document retrieval order has been successfully placed."
        noindex={true}
      />
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 text-center space-y-8 relative overflow-hidden">
        
        {/* Top green accent strip */}
        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
        
        {/* Animated green success icon shield */}
        <div className="relative mx-auto w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center shadow-inner border border-emerald-100/50">
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping opacity-75" />
          <div className="absolute inset-2 rounded-full bg-emerald-500/5 animate-pulse-slow" />
          <CheckCircle2 className="w-12 h-12 text-emerald-600 relative z-10" />
        </div>
        
        <div className="space-y-2.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 leading-tight">Payment Completed</h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
            Your payment was securely verified. Our search agents are now retrieving your documents.
          </p>
        </div>

        {/* Invoice Summary Code Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 shadow-inner relative overflow-hidden">
          {/* Subtle receipt notch graphics */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-2 flex gap-1.5 select-none">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="w-2.5 h-2.5 bg-white rounded-full border border-slate-200/30" />
            ))}
          </div>
          
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 pt-1">Order Reference Number</span>
          <span className="text-xl sm:text-2xl font-mono font-extrabold text-primary select-all tracking-wider">{orderNumber}</span>
          <span className="text-[10px] text-slate-450 block mt-1">A copy of your receipt has been dispatched to your email.</span>
        </div>

        {/* Visual Fulfillment timeline */}
        <div className="space-y-5 text-left pt-2">
          <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Processing Timeline</h3>
          
          <div className="space-y-6 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
            
            {/* Step 1 */}
            <div className="relative flex gap-3.5">
              <div className="absolute -left-[23px] w-4.5 h-4.5 rounded-full bg-emerald-500 flex items-center justify-center text-white border-4 border-white shadow-sm">
                <Check className="w-2.5 h-2.5 stroke-[4px]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-slate-850 text-xs sm:text-sm leading-tight">Order Confirmed</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">Payment checked and order registered with our priority retrieval queue.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex gap-3.5">
              <div className="absolute -left-[23px] w-4.5 h-4.5 rounded-full bg-accent flex items-center justify-center text-white border-4 border-white shadow-sm animate-pulse-slow">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-slate-850 text-xs sm:text-sm leading-tight">Registry Retrieval In Progress</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">Our automated system is searching the official HM Land Registry indices to extract the matching plan and deed PDFs.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex gap-3.5">
              <div className="absolute -left-[23px] w-4.5 h-4.5 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 border-4 border-white shadow-sm">
                <Inbox className="w-2 h-2" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-slate-400 text-xs sm:text-sm leading-tight">Document Dispatch</h4>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">Quality control checks completed. Verified government copies dispatched to your inbox as official PDFs.</p>
              </div>
            </div>

          </div>
        </div>

        {/* Security / Help links */}
        <div className="pt-4 border-t border-slate-150 flex items-center justify-between text-xs text-slate-450">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Secure Order
          </span>
          <span>Need help? <Link href="/contact" className="text-accent hover:underline font-bold">Contact Support</Link></span>
        </div>

        <div className="pt-2">
          <Link href="/">
            <Button variant="outline" className="w-full h-12 font-bold text-slate-700 border-slate-350 hover:bg-slate-50 flex items-center justify-center gap-2 rounded-xl">
              Return to Homepage <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        
      </div>
    </div>
  );
}
