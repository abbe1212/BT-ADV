"use client";

import { useFormContext, Controller } from "react-hook-form";
import type { BookingWizardData } from "./BookingWizard";
import { Building, Target, CheckSquare } from "lucide-react";

const PLATFORMS = ["Facebook", "Instagram", "TikTok", "YouTube", "LinkedIn", "TV", "Other"];
const INDUSTRIES = ["Real Estate", "F&B", "Tech", "Healthcare", "E-commerce", "Education", "Fashion", "Other"];

export default function Step2Company() {
  const { register, control, watch, setValue, formState: { errors } } = useFormContext<BookingWizardData>();


  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-white uppercase tracking-widest font-display">Company Brief</h2>
        <p className="text-white/50 text-sm mt-1">Tell us about your brand</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
          <Building size={16} /> Company Name *
        </label>
        <input
          {...register("company_name")}
          placeholder="e.g. BT Agency"
          className="bg-black/50 border border-white/10 p-3 rounded-lg focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors w-full text-white"
        />
        {errors.company_name && <p className="text-red-400 text-xs">{errors.company_name.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
          <Building size={16} /> Company/Project Brief
        </label>
        <textarea
          {...register("company_brief")}
          rows={3}
          placeholder="Briefly describe your company or project..."
          className="bg-black/50 border border-white/10 p-3 rounded-lg focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors w-full text-white resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold uppercase tracking-widest text-white/80">Industry</label>
          <select
            {...register("industry")}
            className="bg-black/50 border border-white/10 p-3 rounded-lg focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors w-full text-white appearance-none cursor-pointer"
          >
            <option value="">Select Industry...</option>
            {INDUSTRIES.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
            <Target size={16} /> Target Audience
          </label>
          <select
            {...register("target_audience")}
            className="bg-black/50 border border-white/10 p-3 rounded-lg focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors w-full text-white appearance-none cursor-pointer"
          >
            <option value="">Select Audience...</option>
            <option value="B2B">B2B</option>
            <option value="B2C">B2C</option>
            <option value="General">General</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold uppercase tracking-widest text-white/80">Target Platforms</label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(platform => (
            <label
              key={platform}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all border cursor-pointer border-white/10 bg-black/30 hover:border-yellow hover:bg-yellow/5 hover:text-white text-white/50 has-[:checked]:border-yellow has-[:checked]:bg-yellow/20 has-[:checked]:text-yellow leading-none select-none"
            >
              <input 
                type="checkbox" 
                value={platform} 
                {...register("platforms")} 
                className="sr-only peer" 
              />
              <span className="transition-all peer-checked:drop-shadow-[0_0_6px_rgba(255,238,52,0.8)]">
                {platform}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              {...register("has_brand_guide")}
              className="peer sr-only"
            />
            <div className="w-5 h-5 border-2 border-white/30 rounded focus:ring-0 transition-colors peer-checked:bg-yellow peer-checked:border-yellow group-hover:border-yellow/50" />
            <CheckSquare className="w-3.5 h-3.5 text-navy absolute pointer-events-none opacity-0 peer-checked:opacity-100" />
          </div>
          <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">We have a defined Brand Guide</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              {...register("previous_ads")}
              className="peer sr-only"
            />
            <div className="w-5 h-5 border-2 border-white/30 rounded focus:ring-0 transition-colors peer-checked:bg-yellow peer-checked:border-yellow group-hover:border-yellow/50" />
            <CheckSquare className="w-3.5 h-3.5 text-navy absolute pointer-events-none opacity-0 peer-checked:opacity-100" />
          </div>
          <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">We've run ads previously</span>
        </label>
      </div>

    </div>
  );
}
