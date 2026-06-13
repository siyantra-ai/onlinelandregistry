import React from "react";
import { CheckSquare, FileText, Send, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BookingSteps() {
  return (
    <section className="bg-white rounded-2xl p-8 shadow-md">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <img src="/steps.png" alt="Booking steps" className="w-full h-auto object-cover rounded-md border border-slate-100 shadow-sm" />
        </div>
      </div>
    </section>
  );
}
