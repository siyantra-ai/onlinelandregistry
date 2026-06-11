import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileText, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function OrderSuccess() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const orderNumber = searchParams.get("order_number") || "OLR-PENDING";

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-border p-8 text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
        
        <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-heading font-bold text-primary">Payment Successful</h1>
          <p className="text-muted-foreground">Thank you for your order. We are now processing your request.</p>
        </div>

        <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 my-6">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Order Reference</p>
          <p className="text-2xl font-mono font-bold text-primary">{orderNumber}</p>
        </div>

        <div className="space-y-4 text-left">
          <h3 className="font-heading font-bold text-primary">What happens next?</h3>
          <ul className="space-y-3">
            <li className="flex gap-3 text-sm text-muted-foreground">
              <div className="mt-0.5 text-accent"><CheckCircle2 className="w-4 h-4" /></div>
              <span>You will receive an email confirmation shortly containing your receipt and order details.</span>
            </li>
            <li className="flex gap-3 text-sm text-muted-foreground">
              <div className="mt-0.5 text-accent"><CheckCircle2 className="w-4 h-4" /></div>
              <span>Our team is retrieving your official documents from HM Land Registry.</span>
            </li>
            <li className="flex gap-3 text-sm text-muted-foreground">
              <div className="mt-0.5 text-accent"><CheckCircle2 className="w-4 h-4" /></div>
              <span>Once completed, your documents will be delivered securely via email based on your chosen tracking speed.</span>
            </li>
          </ul>
        </div>

        <div className="pt-6">
          <Link href="/">
            <Button variant="outline" className="w-full h-12 font-medium">
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
