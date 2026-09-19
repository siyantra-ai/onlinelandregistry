import SEO from "@/components/SEO";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function CookiesPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <SEO
        title="Cookie Policy | Online Land Registry"
        description="Read our Cookie Policy to understand how we use cookies to provide a secure ordering session."
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
            Cookie Policy
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
              This Cookie Policy explains how Online Land Registry uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. What are Cookies?</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Why We Use Cookies</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              We use first-party and third-party cookies for several reasons:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-6">
              <li><strong>Essential Cookies:</strong> These cookies are strictly necessary to provide you with services available through our website (e.g., maintaining your checkout wizard state, securely managing your payment session).</li>
              <li><strong>Performance &amp; Analytics:</strong> These cookies help us analyze how our portal is used, allowing us to improve navigation and loading times.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Types of Cookies We Set</h2>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600 text-left">
                <thead>
                  <tr className="bg-slate-50 font-bold text-slate-900">
                    <th className="px-4 py-2 border-b">Cookie Name</th>
                    <th className="px-4 py-2 border-b">Provider</th>
                    <th className="px-4 py-2 border-b">Purpose</th>
                    <th className="px-4 py-2 border-b">Expiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-2 border-b font-mono">__stripe_mid</td>
                    <td className="px-4 py-2 border-b">Stripe</td>
                    <td className="px-4 py-2 border-b">Fraud prevention and payment processing security.</td>
                    <td className="px-4 py-2 border-b">1 year</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b font-mono">_ga</td>
                    <td className="px-4 py-2 border-b">Google Analytics</td>
                    <td className="px-4 py-2 border-b">Distinguishes unique users to analyze site traffic.</td>
                    <td className="px-4 py-2 border-b">2 years</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b font-mono">session_id</td>
                    <td className="px-4 py-2 border-b">Online Land Registry</td>
                    <td className="px-4 py-2 border-b">Stores details of your active order configuration.</td>
                    <td className="px-4 py-2 border-b">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Controlling Cookies</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website, though your access to some functionality and secure ordering components may be restricted.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Updates to this Policy</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons.
            </p>

          </div>
        </div>
      </section>
    </div>
  );
}
