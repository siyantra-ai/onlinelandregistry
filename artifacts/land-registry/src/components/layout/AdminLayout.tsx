import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  FileText, 
  Settings, 
  LogOut,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLinks = () => (
    <>
      <div className="px-3 py-4 mb-4">
        <Link href="/" className="flex items-center gap-2 text-primary-foreground">
          <div className="bg-accent text-accent-foreground p-1.5 rounded-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <span className="font-heading font-bold text-lg tracking-tight">Admin<span className="text-accent">Portal</span></span>
        </Link>
      </div>
      <div className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <span className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-accent text-accent-foreground shadow-sm" 
                  : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              }`}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-primary-foreground/10">
        <Link href="/">
          <span className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" />
            Exit Admin
          </span>
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-primary text-primary-foreground border-r border-primary/20 shrink-0 sticky top-0 h-screen overflow-y-auto">
        <NavLinks />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden h-14 bg-primary text-primary-foreground flex items-center justify-between px-4 sticky top-0 z-30">
          <Link href="/admin" className="font-heading font-bold">Admin Portal</Link>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-primary text-primary-foreground border-r-primary-foreground/10">
              <div className="flex flex-col h-full">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
