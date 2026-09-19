import React from "react";
import { CheckSquare, FileText, Send, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BookingSteps() {
  return (
    <section className="bg-white rounded-2xl p-4 shadow-md">
      <div className="max-w-2xl mx-auto">
        <div className="mb-3">
          <img src="/steps.png" alt="Booking steps" className="w-full max-w-[300px] h-auto object-cover rounded-md border border-slate-100 shadow-sm mx-auto" />
        </div>
      </div>
    </section>
  );
}
