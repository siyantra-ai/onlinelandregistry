import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="bg-primary text-primary-foreground border-b border-primary/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-accent text-accent-foreground p-1.5 rounded-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="font-heading font-bold text-lg tracking-tight">Onlinelandregistry<span className="text-accent/90">.uk</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-primary-foreground/80 hover:text-white transition-colors">Services</Link>
            <a href="#how-it-works" className="text-primary-foreground/80 hover:text-white transition-colors">How it Works</a>
            <Link href="/admin" className="text-primary-foreground/80 hover:text-white transition-colors">Admin</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/order">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground border-0 font-semibold shadow-sm hover-elevate">
                Order Documents
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-primary text-primary-foreground/60 py-12 border-t border-primary/20">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 text-primary-foreground">
              <div className="bg-accent text-accent-foreground p-1 rounded-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="font-heading font-bold">Onlinelandregistry.uk</span>
            </Link>
            <p className="text-sm max-w-sm">
              We provide a fast, secure, and user-friendly portal for obtaining official UK Land Registry documents.
            </p>
            <p className="text-xs pt-4 border-t border-primary-foreground/10 max-w-sm">
              Note: We are an independent document retrieval service and are not affiliated with the UK Government or HM Land Registry.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-primary-foreground mb-4 font-heading">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/order?service=title-register" className="hover:text-accent transition-colors">Title Register</Link></li>
              <li><Link href="/order?service=title-plan" className="hover:text-accent transition-colors">Title Plan</Link></li>
              <li><Link href="/order?service=deeds" className="hover:text-accent transition-colors">Title Deeds</Link></li>
              <li><Link href="/order?service=lease" className="hover:text-accent transition-colors">Lease Copy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-primary-foreground mb-4 font-heading">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-accent transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
