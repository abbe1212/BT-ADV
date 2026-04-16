"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, User, Mail, Phone, Video, MapPin, PhoneCall, Loader2, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getCsrfToken } from "@/lib/csrf-client";

/* ─── Time slots available per day ─────────────────────────────────────────── */
const ALL_TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

/* ─── Zod Schema — matches bookings table exactly ───────────────────────────── */
const bookingSchema = z.object({
  name:             z.string().min(3, "Name must be at least 3 characters"),
  email:            z.string().email("Invalid email address"),
  phone:            z.string().min(10, "Invalid phone number"),
  address:          z.string().optional(),
  date:             z.date({ error: "Please select a date" }),
  time_slot:        z.string().min(1, "Please select a time slot"),
  // DB expects: phone | onsite | zoom
  type:             z.enum(["phone", "onsite", "zoom"] as const, { error: "Please select a meeting type" }),
  estimated_budget: z.enum(["300k", "500k", "600k", "1m"] as const, { error: "Please select a budget" }),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingForm({
  onTicketGenerated,
}: {
  onTicketGenerated: (data: BookingFormData & { ref_code: string }) => void;
}) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slotError, setSlotError] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const selectedDate = watch("date");

  /* Fetch already-booked slots whenever date changes */
  const onDateChange = async (date: Date | null, onChange: (d: Date | null) => void) => {
    onChange(date);
    setValue("time_slot", ""); // reset slot
    setSlotError("");
    if (!date) return;

    setLoadingSlots(true);
    try {
      const iso = date.toISOString().split("T")[0]; // YYYY-MM-DD
      const res = await fetch(`/api/booking/slots?date=${iso}`);
      const json = await res.json();
      setBookedSlots(json.bookedSlots ?? []);
    } catch {
      setBookedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    setSlotError("");

    try {
      const payload = {
        name:             data.name,
        email:            data.email,
        phone:            data.phone,
        address:          data.address ?? "",
        date:             data.date.toISOString().split("T")[0],
        time_slot:        data.time_slot,
        type:             data.type,
        estimated_budget: data.estimated_budget,
      };

      const res = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCsrfToken(),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.error === "SLOT_TAKEN") {
          setSlotError("⚠️ This time slot was just taken. Please choose another slot.");
        } else {
          setSlotError(json.error ?? "Something went wrong. Please try again.");
        }
        return;
      }

      onTicketGenerated({ ...data, ref_code: json.ref_code });
    } catch (error) {
      setSlotError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 text-white w-full">

      {/* Full Name → DB field: name */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
          <User size={16} /> {t("booking.fullname") || "Full Name"}
        </label>
        <input
          {...register("name")}
          placeholder="John Doe"
          className="bg-navy-light/50 border border-white/20 p-3 rounded-md focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors w-full"
        />
        {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
            <Mail size={16} /> {t("booking.email") || "Email"}
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="john@brand.com"
            className="bg-navy-light/50 border border-white/20 p-3 rounded-md focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors w-full"
          />
          {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
        </div>

        {/* Phone → DB field: phone */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
            <Phone size={16} /> {t("booking.mobile") || "Phone"}
          </label>
          <input
            {...register("phone")}
            type="tel"
            placeholder="+20 100 000 0000"
            className="bg-navy-light/50 border border-white/20 p-3 rounded-md focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors w-full"
          />
          {errors.phone && <p className="text-red-400 text-xs">{errors.phone.message}</p>}
        </div>
      </div>

      {/* Address (optional) */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
          <MapPin size={16} /> Address <span className="text-white/30 text-xs normal-case">(optional)</span>
        </label>
        <input
          {...register("address")}
          placeholder="123 Space Street, Cairo"
          className="bg-navy-light/50 border border-white/20 p-3 rounded-md focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors w-full"
        />
      </div>

      {/* Date picker — extracts date only, no time */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
          <Calendar size={16} /> {t("booking.date") || "Select Date"}
        </label>
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <DatePicker
              selected={field.value}
              onChange={(date: Date | null) => onDateChange(date, field.onChange)}
              dateFormat="MMMM d, yyyy"
              placeholderText="Choose a date"
              minDate={new Date()}
              wrapperClassName="w-full"
              className="bg-navy-light/50 border border-white/20 p-3 rounded-md focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors w-full text-white"
            />
          )}
        />
        {errors.date && <p className="text-red-400 text-xs">{errors.date.message}</p>}
      </div>

      {/* Time Slot → DB field: time_slot (UNIQUE with date) */}
      {selectedDate && (
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
            <Clock size={16} /> Select Time Slot
            {loadingSlots && <Loader2 size={14} className="animate-spin text-yellow" />}
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {ALL_TIME_SLOTS.map((slot) => {
              const isBooked = bookedSlots.includes(slot);
              return (
                <label
                  key={slot}
                  className={`relative flex items-center justify-center p-3 border rounded-md text-sm font-mono font-bold transition-all
                    ${isBooked
                      ? "border-white/10 bg-white/5 text-white/20 cursor-not-allowed line-through"
                      : "border-white/20 cursor-pointer hover:border-yellow hover:bg-yellow/5"
                    }`}
                >
                  <input
                    type="radio"
                    value={slot}
                    {...register("time_slot")}
                    disabled={isBooked}
                    className="sr-only peer"
                  />
                  <span className="peer-checked:text-yellow peer-checked:drop-shadow-[0_0_6px_rgba(255,238,52,0.8)]">
                    {slot}
                  </span>
                  {/* highlight ring for selected */}
                  <span className="absolute inset-0 rounded-md peer-checked:border peer-checked:border-yellow pointer-events-none" />
                </label>
              );
            })}
          </div>
          {errors.time_slot && <p className="text-red-400 text-xs">{errors.time_slot.message}</p>}
        </div>
      )}

      {/* Estimated Budget → DB field: estimated_budget */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold uppercase tracking-widest text-white/80">
          Estimated Budget
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(["300k", "500k", "600k", "1m"] as const).map((b) => (
            <label key={b} className="flex items-center gap-3 p-3 border border-white/20 rounded-md cursor-pointer hover:border-yellow hover:bg-yellow/5 transition-all outline-none focus-within:ring-1 focus-within:ring-yellow">
              <input
                type="radio"
                value={b}
                {...register("estimated_budget")}
                className="accent-yellow text-yellow w-4 h-4"
              />
              <span className="text-sm uppercase font-bold tracking-wider">{b}</span>
            </label>
          ))}
        </div>
        {errors.estimated_budget && <p className="text-red-400 text-xs">{errors.estimated_budget.message}</p>}
      </div>

      {/* Meeting Type → DB field: type — values: phone | onsite | zoom */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold uppercase tracking-widest text-white/80">
          {t("booking.meeting_type") || "Meeting Type"}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex items-center gap-3 p-4 border border-white/20 rounded-md cursor-pointer hover:border-yellow hover:bg-yellow/5 transition-all outline-none focus-within:ring-1 focus-within:ring-yellow">
            <input type="radio" value="phone" {...register("type")} className="accent-yellow text-yellow w-4 h-4" />
            <span className="flex items-center gap-2 text-sm">
              <PhoneCall size={16} className="text-yellow" /> {t("booking.phone") || "Phone Call"}
            </span>
          </label>
          <label className="flex items-center gap-3 p-4 border border-white/20 rounded-md cursor-pointer hover:border-yellow hover:bg-yellow/5 transition-all outline-none focus-within:ring-1 focus-within:ring-yellow">
            <input type="radio" value="onsite" {...register("type")} className="accent-yellow text-yellow w-4 h-4" />
            <span className="flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-yellow" /> {t("booking.onsite") || "On-Site"}
            </span>
          </label>
          <label className="flex items-center gap-3 p-4 border border-white/20 rounded-md cursor-pointer hover:border-yellow hover:bg-yellow/5 transition-all outline-none focus-within:ring-1 focus-within:ring-yellow">
            <input type="radio" value="zoom" {...register("type")} className="accent-yellow text-yellow w-4 h-4" />
            <span className="flex items-center gap-2 text-sm">
              <Video size={16} className="text-yellow" /> {t("booking.zoom") || "Zoom"}
            </span>
          </label>
        </div>
        {errors.type && <p className="text-red-400 text-xs">{errors.type.message}</p>}
      </div>

      {/* Slot conflict error */}
      {slotError && (
        <div className="p-3 bg-red-500/10 border border-red-400/30 rounded-md">
          <p className="text-red-400 text-sm">{slotError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 bg-yellow text-navy font-bold py-4 rounded-md uppercase tracking-widest hover:shadow-[0_0_20px_rgba(255,238,52,0.8)] transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      >
        {isSubmitting && <Loader2 size={18} className="animate-spin" />}
        {isSubmitting ? "Processing..." : t("booking.confirm") || "Confirm Booking"}
      </button>
    </form>
  );
}
