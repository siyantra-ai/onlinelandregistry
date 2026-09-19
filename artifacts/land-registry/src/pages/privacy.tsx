import SEO from "@/components/SEO";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <SEO
        title="Privacy Policy | Online Land Registry"
        description="Learn how we collect, use, and protect your personal information when retrieving official UK Land Registry documents."
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
            Privacy Policy
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
              At Online Land Registry, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our document retrieval services.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              We collect information that you provide directly to us when placing an order, filling out forms, or contacting customer support:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-6">
              <li><strong>Contact Information:</strong> Your name, email address, phone number, and delivery preferences.</li>
              <li><strong>Order Search Criteria:</strong> Property addresses, postcodes, and title numbers required to locate your requested documents on the HM Land Registry database.</li>
              <li><strong>Payment Details:</strong> All payment transactions are securely processed via Stripe. We do not store or have direct access to your credit or debit card details.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              We use the collected information to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-6">
              <li>Process, verify, and fulfill your document retrieval requests.</li>
              <li>Deliver your ordered documents digitally (email/PDF).</li>
              <li>Send order confirmations, updates, and customer support communications.</li>
              <li>Comply with statutory verification checks and prevent fraudulent activity.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Data Sharing and Third Parties</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. We share data only with:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-6">
              <li><strong>HM Land Registry:</strong> Property search criteria are shared to retrieve the legal documents you order.</li>
              <li><strong>Stripe Payment Gateway:</strong> Transaction details are shared to process payments securely.</li>
              <li><strong>Service Providers:</strong> IT hosting and email delivery services necessary to operate our portal.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Security of Your Information</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              We employ strict technical and organizational security measures, including TLS 1.3 encryption, secure database architectures, and compliance with PCI DSS standards to protect your personal data from unauthorized access, disclosure, or alteration.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Cookies and Tracking</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              We use cookies to maintain your shopping basket state and ensure secure ordering sessions. For detailed information, please refer to our <Link href="/cookies" className="text-amber-600 hover:text-amber-700 underline font-semibold">Cookie Policy</Link>.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">6. Your Rights</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Under UK GDPR and the Data Protection Act 2018, you have the right to access, correct, delete, or limit the processing of your personal data. To exercise any of these rights, please contact our support team at <a href="mailto:support@onlinelandregistry.uk" className="text-amber-600 hover:text-amber-700 underline font-semibold">support@onlinelandregistry.uk</a>.
            </p>

          </div>
        </div>
      </section>
    </div>
  );
}
