"use client";

import { useFormContext } from "react-hook-form";
import { PhoneCall, Clock, DollarSign, CalendarCheck } from "lucide-react";
import type { BookingWizardData } from "./BookingWizard";

const TIME_SLOTS = [
  { id: "10am-12pm", label: "10:00 AM - 11:59 AM" },
  { id: "12pm-2pm", label: "12:00 PM - 1:59 PM" },
  { id: "2pm-4pm", label: "2:00 PM - 3:59 PM" },
  { id: "4pm-6pm", label: "4:00 PM - 5:59 PM" },
  { id: "6pm-8pm", label: "6:00 PM - 7:59 PM" },
  { id: "8pm-10pm", label: "8:00 PM - 9:59 PM" },
  { id: "10pm-12am", label: "10:00 PM - 11:59 PM" },
];

export default function Step4Meeting() {
  const { register, watch, formState: { errors } } = useFormContext<BookingWizardData>();
  
  const planningStart = watch("planning_start");

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-white uppercase tracking-widest font-[fantasy]">Meeting Details</h2>
        <p className="text-white/50 text-sm mt-1">Schedule your consultation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meeting Type - Phone Call Only Info Card */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold uppercase tracking-widest text-white/80">Meeting Type</label>
          <div className="p-4 border border-yellow/30 bg-yellow/5 rounded-lg flex items-center gap-3">
            <PhoneCall size={20} className="text-yellow" />
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-wider">Phone Call</p>
              <p className="text-xs text-white/60">Our team will reach out to you</p>
            </div>
            {/* Hidden input to ensure value is passed */}
            <input type="hidden" value="phone" {...register("type")} />
          </div>
        </div>

        {/* Start Timeline Confirmation (Read-only) */}
        {planningStart && (
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold uppercase tracking-widest text-white/80">Planned Start</label>
            <div className="p-4 border border-white/10 bg-black/30 rounded-lg flex items-center gap-3">
              <CalendarCheck size={20} className="text-yellow" />
              <div>
                <p className="text-sm font-bold text-white uppercase tracking-wider">{planningStart}</p>
                <p className="text-xs text-white/60">From Project Details</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 pt-4 border-t border-white/10">
        {/* Budget */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
            <DollarSign size={16} /> Estimated Budget *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-semibold">EGP</span>
            <input
              {...register("estimated_budget")}
              type="number"
              placeholder="e.g. 50000"
              className="bg-black/50 border border-white/10 p-3 pl-14 rounded-lg focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors w-full text-white"
            />
          </div>
          {errors.estimated_budget && <p className="text-red-400 text-xs">{errors.estimated_budget.message}</p>}
        </div>
      </div>

      {/* Time Slot (Range) */}
      <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
        <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
          <Clock size={16} /> Preferred Time *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {TIME_SLOTS.map(slot => (
            <label
              key={slot.id}
              className="relative flex items-center justify-center p-3 border rounded-lg text-xs md:text-sm font-mono font-bold transition-all cursor-pointer border-white/10 bg-black/30 hover:border-yellow hover:bg-yellow/5 has-[:checked]:border-yellow has-[:checked]:bg-yellow/20"
            >
              <input type="radio" value={slot.id} {...register("time_slot")} className="sr-only peer" />
              <span className="peer-checked:text-yellow peer-checked:drop-shadow-[0_0_6px_rgba(255,238,52,0.8)]">{slot.label}</span>
            </label>
          ))}
        </div>
        {errors.time_slot && <p className="text-red-400 text-xs">{errors.time_slot.message}</p>}
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
        <label className="text-sm font-semibold uppercase tracking-widest text-white/80">Additional Notes <span className="text-xs text-white/30 lowercase">(optional)</span></label>
        <textarea
          {...register("notes")}
          rows={2}
          placeholder="Any specific questions or topics you'd like to cover?"
          className="bg-black/50 border border-white/10 p-3 rounded-lg focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors w-full text-white resize-none"
        />
      </div>

    </div>
  );
}
