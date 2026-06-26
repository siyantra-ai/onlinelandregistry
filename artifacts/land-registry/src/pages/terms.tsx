import SEO from "@/components/SEO";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function TermsPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <SEO
        title="Terms & Conditions | Online Land Registry"
        description="Read our Terms and Conditions of service for retrieving UK Land Registry documents."
      />

      {/* Premium Header Banner */}
      <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading">
            Terms &amp; Conditions
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Last Updated: June 2026
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-white rounded-2xl p-6 sm:p-12 shadow-sm border border-slate-100 prose prose-slate max-w-none">
            
            <p className="text-slate-600 leading-relaxed mb-6">
              Welcome to Online Land Registry. By using our website and placing orders through our portal, you agree to comply with and be bound by the following Terms &amp; Conditions.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Scope of Service</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Online Land Registry provides a managed retrieval and verification service for official property documents held by HM Land Registry (HMLR). 
            </p>
            <p className="text-slate-600 leading-relaxed mb-6 font-semibold text-amber-700 bg-amber-500/5 p-4 rounded-lg border border-amber-500/10">
              Disclaimer: We are an independent commercial entity. We are not owned by, affiliated with, or endorsed by HM Land Registry or the UK Government.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Ordering and Deliveries</h2>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-6">
              <li><strong>Accuracy of Search Parameters:</strong> It is your responsibility to provide the correct postcode, address, or title number. If incorrect details are supplied, a new search may require an additional charge.</li>
              <li><strong>Delivery Estimates:</strong> Our standard processing time is within one working day. Expedited options (Fast Track within 4 hours; Super-Fast Track within 1 hour) are subject to HM Land Registry systems availability and our business hours (Monday to Friday, 9:00 AM to 5:30 PM UK time).</li>
              <li><strong>Method of Delivery:</strong> All documents are delivered in PDF format to the email address provided during checkout.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Fees and Charges</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Our fees are structured as follows:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-6">
              <li>The official statutory fee charged by HM Land Registry is £7.00 per document.</li>
              <li>We charge an administration/service fee separately to cover postcode validation, official title matching, document verification, and expedited digital delivery.</li>
              <li>All prices shown are inclusive of VAT where applicable.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Refunds and Cancellations</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Due to the digital and automated nature of the search requests, official fees cannot be refunded once a search query has been submitted to HMLR.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong>Consent to Immediate Performance &amp; Waiver:</strong> When placing an order for documents through our service, you request and explicitly consent to the immediate performance of the contract. You agree and acknowledge that once the official documents are successfully retrieved and delivered, the service is fully performed. Consequently, you explicitly agree that you waive your statutory 14-day right of cancellation or refund under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013.
            </p>
            <p className="text-slate-600 leading-relaxed mb-6">
              Please review our complete <Link href="/refund-policy" className="text-amber-600 hover:text-amber-700 underline font-semibold">Refund Policy</Link> for exceptions and details on administrative fee refunds.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Limitation of Liability</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              We obtain official documents directly from the HM Land Registry database. We are not responsible for any inaccuracies, omissions, or errors contained within the official registry files themselves. Our liability is strictly limited to the amount of the administration fee paid to us for the specific transaction.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">6. Governing Law</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              These Terms &amp; Conditions are governed by and construed in accordance with the laws of England and Wales. Any disputes arising shall be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>

          </div>
        </div>
      </section>
    </div>
  );
}
