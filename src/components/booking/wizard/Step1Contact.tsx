"use client";

import { useFormContext } from "react-hook-form";
import { User, Mail, Phone, MapPin } from "lucide-react";
import type { BookingWizardData } from "./BookingWizard";

export default function Step1Contact() {
  const { register, formState: { errors } } = useFormContext<BookingWizardData>();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-white uppercase tracking-widest font-display">Contact Info</h2>
        <p className="text-white/50 text-sm mt-1">Let's get to know each other</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
          <User size={16} /> Full Name *
        </label>
        <input
          {...register("name")}
          placeholder="e.g. Ahmed Hassan"
          className="bg-black/50 border border-white/10 p-3 rounded-lg focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors w-full text-white"
        />
        {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
          <Mail size={16} /> Email Address *
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="ahmed@example.com"
          className="bg-black/50 border border-white/10 p-3 rounded-lg focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors w-full text-white"
        />
        {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
          <Phone size={16} /> Phone Number *
        </label>
        <input
          {...register("phone")}
          type="tel"
          placeholder="+20 100 000 0000"
          className="bg-black/50 border border-white/10 p-3 rounded-lg focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors w-full text-white"
        />
        {errors.phone && <p className="text-red-400 text-xs">{errors.phone.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
          <MapPin size={16} /> Location / Address <span className="text-white/30 text-xs lowercase">(optional)</span>
        </label>
        <input
          {...register("address")}
          placeholder="e.g. Cairo, Egypt"
          className="bg-black/50 border border-white/10 p-3 rounded-lg focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors w-full text-white"
        />
      </div>
    </div>
  );
}
