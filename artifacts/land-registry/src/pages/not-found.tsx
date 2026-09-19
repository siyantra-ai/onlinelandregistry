import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-160px)] w-full flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-8 text-center space-y-6 relative overflow-hidden">
        
        {/* Top red accent strip */}
        <div className="absolute top-0 left-0 w-full h-2.5 bg-rose-500"></div>

        <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-600">
          <AlertCircle className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold font-heading text-slate-900 leading-tight">Page Not Found</h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <div className="pt-4">
          <Link href="/">
            <Button className="w-full h-12 font-bold bg-[#1e293b] hover:bg-slate-800 text-white flex items-center justify-center gap-2 rounded-xl">
              <ArrowLeft className="w-4 h-4" /> Back to Homepage
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
