import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Clock, Shield, Send, CheckCircle } from "lucide-react";
import SEO from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [department, setDepartment] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const departments = [
    { value: 'enquiry', label: 'Existing Customer Enquiry' },
    { value: 'sales', label: 'Sales Enquiry' },
    { value: 'update', label: 'Request Forms or Update/Change Your Details' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    setSuccess(false);

    const selectedDeptLabel = departments.find(d => d.value === department)?.label || 'General Enquiry';
    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email: email,
          subject: `${selectedDeptLabel} - ${subject.trim()}`,
          message: `Phone: ${phone}\n\n${message.trim()}`
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit");
      }
      
      setSuccess(true);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setDepartment('');
      setMessage('');
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "An error occurred while sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <SEO
        title="Contact Us - Property Detailer"
        description="Get in touch with us. Call 0333 577 0077, email support@onlinelandregistry.uk, or visit our office."
      />

      {/* Hero Section */}
      <section className="bg-slate-900 text-white pt-20 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 items-center">
            <div className="text-left">
              <span className="inline-block mb-4 px-3 py-1 bg-accent/20 text-accent text-xs font-bold uppercase tracking-wider rounded-full border border-accent/30">Support Center</span>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">Whenever you need</h1>
              <p className="max-w-xl text-slate-300 text-base leading-relaxed">
                We are here whenever you need us. Our technique distinguishes us from other service providers and ensures clients receive unrivalled assistance at all phases of their application and beyond.
              </p>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="w-64 h-64 bg-slate-800 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden border border-slate-700">
                {/* Fallback to simple icon since we might not have the gif */}
                <Phone className="w-24 h-24 text-slate-600 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
            
            {/* Left Column: Get in touch form */}
            <div className="bg-white rounded-2xl p-8 md:p-10 border border-slate-200 shadow-sm">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Get in <strong className="text-accent">touch</strong></h2>
              <p className="text-slate-500 mb-8">
                Please contact us using the form below. We will contact you within 48 hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="first_name">First name</label>
                    <input
                      id="first_name"
                      type="text"
                      required
                      className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="last_name">Last name</label>
                    <input
                      id="last_name"
                      type="text"
                      required
                      className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="email">Email address</label>
                    <input
                      id="email"
                      type="email"
                      required
                      className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="phone">Phone number</label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="subject">Subject</label>
                  <input
                    id="subject"
                    type="text"
                    required
                    className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                    placeholder="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="department">Select Department</label>
                  <select
                    id="department"
                    required
                    className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all bg-white"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="" disabled>Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.value} value={dept.value}>{dept.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="message">What do you require?</label>
                  <textarea
                    id="message"
                    required
                    className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all h-32 resize-y"
                    placeholder="What do you require?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full py-6 text-base font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-md flex items-center justify-center gap-2">
                  {isSubmitting ? 'Submitting...' : <><Send size={18} /> Submit</>}
                </Button>

                {success && (
                  <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-md border border-green-200 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Thank you!</strong> 
                      <span className="text-sm">Your message has been sent. We will contact you within 48 hours.</span>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Right Column: CTA sidebar / info */}
            <div className="space-y-6">
              <div className="bg-accent rounded-2xl p-8 text-white shadow-md">
                <h3 className="text-2xl font-extrabold mb-4 leading-snug">
                  Are you ready to request documents <strong className="text-slate-900">online?</strong>
                </h3>
                <p className="text-white/90 mb-6 text-sm leading-relaxed">
                  Our online services allow the general public and professionals to obtain authentic copies of Land Registry Title documents.
                </p>
                <Link href="/" className="inline-flex w-full items-center justify-center px-6 py-4 bg-white text-accent font-bold rounded-md hover:bg-slate-50 transition-colors shadow-sm">
                  Obtain Documents
                </Link>
              </div>

              {/* Address / info card */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <h3 className="text-xl font-extrabold text-slate-900 mb-6">Our Contact Details</h3>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                      <Phone size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">Phone Support</h4>
                      <p className="font-bold text-accent text-lg mt-0.5">0333 577 0077</p>
                      <p className="text-slate-500 text-xs mt-1">Speak directly to a property conveyancing expert.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                      <Mail size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">Email Enquiry</h4>
                      <div className="flex flex-col gap-1">
                        <a href="mailto:Support@onlinelandregistry.uk" className="font-semibold text-slate-700 hover:text-accent text-sm transition-colors">Support@onlinelandregistry.uk</a>
                        <a href="mailto:Sales@onlinelandregistry.uk" className="font-semibold text-slate-700 hover:text-accent text-sm transition-colors">Sales@onlinelandregistry.uk</a>
                      </div>
                      <p className="text-slate-500 text-xs mt-2">Send documents and scans for file audits.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                      <Clock size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">Opening Hours</h4>
                      <p className="font-semibold text-slate-700 text-sm mt-1">Mon - Fri: 9:00 AM - 5:00 PM</p>
                      <p className="text-slate-500 text-xs mt-1">Saturday & Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 border border-slate-200 rounded-xl flex items-start gap-4 bg-slate-50/50">
                <Shield size={24} className="text-accent flex-shrink-0" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  <strong className="text-slate-700">Secure Submission:</strong> We treat all personal details in strict confidence. Your data is protected by SSL encryption and processed in full compliance with the UK Data Protection Act / GDPR.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
