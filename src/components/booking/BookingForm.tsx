"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, User, Mail, Phone, Video, MapPin, PhoneCall, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// The validation schema
const bookingSchema = z.object({
  fullName: z.string().min(3, { message: "Name must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  mobile: z.string().min(10, { message: "Invalid mobile number" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  date: z.date({ message: "Please select a preferred date" }),
  meetingType: z.enum(["phone_call", "on_site", "zoom"], {
    message: "Please select a meeting type",
  }),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingForm({
  onTicketGenerated,
}: {
  onTicketGenerated: (data: BookingFormData) => void;
}) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      // 1. Send data to our API route which uses Sender.com
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        console.error("Failed to send confirmation email.");
        // We can either throw here or let the user proceed to the ticket anyway.
      }
      
      // 2. Generate the ticket visually
      onTicketGenerated(data);
    } catch (error) {
      console.error("Booking submission error:", error);
      // Fallback: still show ticket even if email fails during dev
      onTicketGenerated(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 text-white w-full">
      {/* Full Name */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
          <User size={16} /> {t("booking.fullname")}
        </label>
        <input
          {...register("fullName")}
          placeholder="Johh Doe"
          className="bg-navy-light/50 border border-white/20 p-3 rounded-md focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors w-full"
        />
        {errors.fullName && <p className="text-red-400 text-xs">{errors.fullName.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
            <Mail size={16} /> {t("booking.email")}
          </label>
          <input
            {...register("email")}
            placeholder="johndoe@email.com"
            className="bg-navy-light/50 border border-white/20 p-3 rounded-md focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors w-full"
          />
          {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
        </div>

        {/* Mobile */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
            <Phone size={16} /> {t("booking.mobile")}
          </label>
          <input
            {...register("mobile")}
            placeholder="+20 100 000 0000"
            className="bg-navy-light/50 border border-white/20 p-3 rounded-md focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors w-full"
          />
          {errors.mobile && <p className="text-red-400 text-xs">{errors.mobile.message}</p>}
        </div>
      </div>

      {/* Address */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
          <MapPin size={16} /> Address
        </label>
        <input
          {...register("address")}
          placeholder="123 Space Street, Galaxy City"
          className="bg-navy-light/50 border border-white/20 p-3 rounded-md focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors w-full"
        />
        {errors.address && <p className="text-red-400 text-xs">{errors.address.message}</p>}
      </div>

      {/* Date Picker */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
          <Calendar size={16} /> {t("booking.date")}
        </label>
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <DatePicker
              selected={field.value}
              onChange={(date: Date | null) => field.onChange(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={30}
              dateFormat="MMMM d, yyyy h:mm aa"
              placeholderText="Select date and time"
              minDate={new Date()}
              wrapperClassName="w-full"
              className="bg-navy-light/50 border border-white/20 p-3 rounded-md focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors w-full text-white appearance-none"
            />
          )}
        />
        {errors.date && <p className="text-red-400 text-xs">{errors.date.message}</p>}
      </div>

      {/* Meeting Type */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold uppercase tracking-widest text-white/80">
          {t("booking.meeting_type")}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex items-center gap-3 p-4 border border-white/20 rounded-md cursor-pointer hover:border-yellow hover:bg-yellow/5 transition-all outline-none focus-within:ring-1 focus-within:ring-yellow">
            <input
              type="radio"
              value="phone_call"
              {...register("meetingType")}
              className="accent-yellow text-yellow w-4 h-4"
            />
            <span className="flex items-center gap-2 text-sm">
              <PhoneCall size={16} className="text-yellow" /> {t("booking.phone")}
            </span>
          </label>

          <label className="flex items-center gap-3 p-4 border border-white/20 rounded-md cursor-pointer hover:border-yellow hover:bg-yellow/5 transition-all outline-none focus-within:ring-1 focus-within:ring-yellow">
            <input
              type="radio"
              value="on_site"
              {...register("meetingType")}
              className="accent-yellow text-yellow w-4 h-4"
            />
            <span className="flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-yellow" /> {t("booking.onsite")}
            </span>
          </label>

          <label className="flex items-center gap-3 p-4 border border-white/20 rounded-md cursor-pointer hover:border-yellow hover:bg-yellow/5 transition-all outline-none focus-within:ring-1 focus-within:ring-yellow">
            <input
              type="radio"
              value="zoom"
              {...register("meetingType")}
              className="accent-yellow text-yellow w-4 h-4"
            />
            <span className="flex items-center gap-2 text-sm">
              <Video size={16} className="text-yellow" /> {t("booking.zoom")}
            </span>
          </label>
        </div>
        {errors.meetingType && <p className="text-red-400 text-xs">{errors.meetingType.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 bg-yellow text-navy font-bold py-4 rounded-md uppercase tracking-widest hover:shadow-[0_0_20px_rgba(255,238,52,0.8)] transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      >
        {isSubmitting && <Loader2 size={18} className="animate-spin" />}
        {isSubmitting ? "Processing..." : t("booking.confirm")}
      </button>
    </form>
  );
}
