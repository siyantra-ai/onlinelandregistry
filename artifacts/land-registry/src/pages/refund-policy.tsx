import SEO from "@/components/SEO";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function RefundPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <SEO
        title="Refund Policy | Online Land Registry"
        description="Review our Refund and Cancellation Policy for digital UK Land Registry document retrieval services."
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
            Refund Policy
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
              Thank you for choosing Online Land Registry. We aim to provide a transparent, fast, and high-quality document retrieval service. Because our products are digital documents sourced on-demand from HM Land Registry, we operate a strict policy regarding cancellations and refunds.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. HM Land Registry Official Fees</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              The official statutory fee of £7.00 per document is paid directly to HM Land Registry at the moment a search is initiated. 
              <strong> Once search coordinates are submitted to HM Land Registry, the £7.00 statutory fee is non-refundable.</strong>
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Administrative Fee Refunds</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Our administration and verification service fee is eligible for a refund under the following conditions:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-6">
              <li><strong>Prior to Processing:</strong> If you request a cancellation before we perform postcode verification or query the registry systems, you are entitled to a full 100% refund (inclusive of the statutory fee).</li>
              <li><strong>Document Mismatch/No-Record:</strong> If the official registry records do not contain a title file for the requested property address, we will verify the coordinates manually. If we are unable to retrieve a valid file, we will refund our administrative fee.</li>
              <li><strong>Duplicate Orders:</strong> If you accidentally place duplicate orders for the same property address within a 24-hour period, we will cancel the duplicate request and refund the fees.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Non-Refundable Cases</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              We cannot issue refunds in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-6">
              <li>The official documents were successfully retrieved but you no longer require them (e.g., a sale fell through or you changed conveyancers).</li>
              <li>You supplied incorrect postcode, address, or boundary details, resulting in the retrieval of the correct documents for the wrong address provided.</li>
              <li>The information on the official Title Register or Title Plan is outdated because a previous owner or conveyancer failed to register updates with HM Land Registry. (We provide the records exactly as they exist in the official HMLR database).</li>
              <li><strong>Completed Services &amp; Waiver of Cancellation Right:</strong> Under the Consumer Contracts Regulations, you explicitly request immediate processing of your order. Once the official documents are retrieved and delivered, the service is fully completed, and you waive your statutory 14-day right of cancellation or refund.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Requesting a Refund</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              To request a cancellation or refund, please email our support team at <a href="mailto:support@onlinelandregistry.uk" className="text-amber-600 hover:text-amber-700 underline font-semibold">support@onlinelandregistry.uk</a> with your order number, property address, and reason for the request. All refund requests are reviewed manually and processed within 2-3 working days. Approved refunds are returned via Stripe to your original payment method.
            </p>

          </div>
        </div>
      </section>
    </div>
  );
}
