"use client";

import { useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, Clock, PhoneCall, MapPin, Video, Loader2 } from "lucide-react";
import type { BookingWizardData } from "./BookingWizard";

const ALL_TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

export default function Step3Meeting() {
  const { register, control, watch, setValue, formState: { errors } } = useFormContext<BookingWizardData>();
  
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const selectedDate = watch("date");

  useEffect(() => {
    if (!selectedDate) return;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const iso = selectedDate.toISOString().split("T")[0];
        const res = await fetch(`/api/booking/slots?date=${iso}`);
        const json = await res.json();
        setBookedSlots(json.bookedSlots ?? []);
      } catch {
        setBookedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDate]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-white uppercase tracking-widest font-display">Meeting Details</h2>
        <p className="text-white/50 text-sm mt-1">Schedule your consultation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meeting Type */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold uppercase tracking-widest text-white/80">Meeting Type *</label>
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: "phone", icon: PhoneCall, label: "Phone Call" },
              { id: "onsite", icon: MapPin, label: "On-Site" },
              { id: "zoom", icon: Video, label: "Zoom" }
            ].map(type => (
              <label key={type.id} className="flex items-center gap-3 p-3 border border-white/10 rounded-lg cursor-pointer hover:border-yellow hover:bg-yellow/5 transition-all outline-none focus-within:ring-1 focus-within:ring-yellow bg-black/30">
                <input type="radio" value={type.id} {...register("type")} className="accent-yellow text-yellow w-4 h-4" />
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <type.icon size={16} className="text-yellow" /> {type.label}
                </span>
              </label>
            ))}
          </div>
          {errors.type && <p className="text-red-400 text-xs">{errors.type.message}</p>}
        </div>

        {/* Budget */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold uppercase tracking-widest text-white/80">Budget Range *</label>
          <div className="grid grid-cols-1 gap-3">
            {(["300k", "500k", "600k", "1m"] as const).map(b => (
              <label key={b} className="flex items-center gap-3 p-3 border border-white/10 rounded-lg cursor-pointer hover:border-yellow hover:bg-yellow/5 transition-all outline-none focus-within:ring-1 focus-within:ring-yellow bg-black/30">
                <input type="radio" value={b} {...register("estimated_budget")} className="accent-yellow text-yellow w-4 h-4" />
                <span className="text-sm uppercase font-bold tracking-wider">{b}</span>
              </label>
            ))}
          </div>
          {errors.estimated_budget && <p className="text-red-400 text-xs">{errors.estimated_budget.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
        {/* Date */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
            <Calendar size={16} /> Select Date *
          </label>
          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <DatePicker
                selected={field.value}
                onChange={(date: Date | null) => { field.onChange(date); setValue("time_slot", ""); }}
                dateFormat="MMMM d, yyyy"
                placeholderText="Choose a date"
                minDate={new Date()}
                wrapperClassName="w-full"
                className="bg-black/50 border border-white/10 p-3 rounded-lg focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors w-full text-white"
              />
            )}
          />
          {errors.date && <p className="text-red-400 text-xs">{errors.date.message}</p>}
        </div>
      </div>

      {/* Time Slot */}
      {selectedDate && (
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-4">
          <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
            <Clock size={16} /> Select Time Slot *
            {loadingSlots && <Loader2 size={14} className="animate-spin text-yellow" />}
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {ALL_TIME_SLOTS.map(slot => {
              const isBooked = bookedSlots.includes(slot);
              return (
                <label
                  key={slot}
                  className={`relative flex items-center justify-center p-3 border rounded-lg text-sm font-mono font-bold transition-all
                    ${isBooked
                      ? "border-white/5 bg-white/5 text-white/20 cursor-not-allowed line-through"
                      : "border-white/10 bg-black/30 cursor-pointer hover:border-yellow hover:bg-yellow/5"
                    }`}
                >
                  <input type="radio" value={slot} {...register("time_slot")} disabled={isBooked} className="sr-only peer" />
                  <span className="peer-checked:text-yellow peer-checked:drop-shadow-[0_0_6px_rgba(255,238,52,0.8)]">{slot}</span>
                  <span className="absolute inset-0 rounded-lg peer-checked:border-2 peer-checked:border-yellow pointer-events-none" />
                </label>
              );
            })}
          </div>
          {errors.time_slot && <p className="text-red-400 text-xs">{errors.time_slot.message}</p>}
        </div>
      )}

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
