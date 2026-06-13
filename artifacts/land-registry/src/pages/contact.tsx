import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PhoneCall, Mail, Clock, ArrowLeft } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-accent">Contact</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading leading-tight">
            Need help? Get in touch
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            If you need support or are struggling to find the right documents, our dedicated team are here to help you with any queries you may have.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-extrabold text-slate-900 text-lg mb-3">Send us a message</h2>
              <form className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Full name</label>
                  <input className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2" placeholder="Your name" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Email address</label>
                  <input className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Message</label>
                  <textarea className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 h-32" placeholder="How can we help?" />
                </div>
                <div>
                  <Button className="bg-accent text-white">Send message</Button>
                </div>
              </form>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-900">Customer Helpline</h3>
                <p className="text-slate-500 text-sm">Have an enquiry or need help verifying your search? Speak to our friendly advisors.</p>
                <div className="space-y-2.5 pt-2">
                  <a href="tel:08006891447" className="flex items-center gap-2 w-full text-sm font-bold text-white bg-accent hover:bg-accent/90 px-4 py-3 rounded-lg transition-colors">
                    <PhoneCall className="w-4 h-4" /> 0800 689 1447
                  </a>
                  <a href="mailto:support@onlinelandregistry.uk" className="flex items-center gap-2 w-full text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-4 py-3 rounded-lg transition-colors">
                    <Mail className="w-4 h-4" /> support@onlinelandregistry.uk
                  </a>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium pt-1 border-t border-slate-100">
                  <Clock className="w-3.5 h-3.5" /> <span>Mon–Fri: 9am–5pm</span>
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm">
                <h4 className="font-extrabold text-sm uppercase text-accent tracking-wider">Official Stamp</h4>
                <h3 className="font-extrabold text-base">Legally Valid Copies</h3>
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
