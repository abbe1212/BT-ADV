"use client";

import { useFormContext } from "react-hook-form";
import type { BookingWizardData } from "./BookingWizard";
import { HelpCircle, Target, Clock, MessageSquare, Briefcase, Rocket, Star, Hash } from "lucide-react";

export default function Step3ProjectDetails() {
  const { register, watch, formState: { errors } } = useFormContext<BookingWizardData>();
  
  const selectedType = watch("project_type");
  const selectedGoal = watch("project_goal");

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-white uppercase tracking-widest font-[fantasy]">Project Details</h2>
        <p className="text-white/50 text-sm mt-1">What are we building together?</p>
      </div>

      {/* Q4. What type of project are you looking for? */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
          <Briefcase size={16} /> 4. What type of project are you looking for? *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { id: "tv_digital", label: "Creative Advertisement (TVC / Digital Ad)" },
            { id: "song_jingle", label: "Ad Song / Jingle" },
            { id: "social_reels", label: "Social Media Reels" },
            { id: "other", label: "Other" }
          ].map(type => (
            <label key={type.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all outline-none focus-within:ring-1 focus-within:ring-yellow border-white/10 bg-black/30 hover:border-yellow hover:bg-yellow/5 has-[:checked]:border-yellow has-[:checked]:bg-yellow/20">
              <input type="radio" value={type.label} {...register("project_type")} className="accent-yellow text-yellow w-4 h-4 cursor-pointer" />
              <span className="text-sm font-semibold">{type.label}</span>
            </label>
          ))}
        </div>
        {errors.project_type && <p className="text-red-400 text-xs">{errors.project_type.message}</p>}
        
        {/* Conditional 'Other' input for Project Type */}
        {selectedType === "Other" && (
          <div className="mt-2 animate-in slide-in-from-top-2">
            <input
              {...register("project_type_other")}
              placeholder="Please specify your project type..."
              className="bg-black/50 border border-white/10 p-3 rounded-lg focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors w-full text-white"
            />
            {errors.project_type_other && <p className="text-red-400 text-xs">{errors.project_type_other.message}</p>}
          </div>
        )}
      </div>

      {/* Q5. What's your main goal from this project? */}
      <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
        <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
          <Target size={16} /> 5. What’s your main goal from this project? *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { id: "sales", label: "Increase sales" },
            { id: "awareness", label: "Build brand awareness" },
            { id: "launch", label: "Launch a new product" },
            { id: "rebrand", label: "Rebrand / reposition" },
            { id: "other", label: "Other" }
          ].map(goal => (
            <label key={goal.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all outline-none focus-within:ring-1 focus-within:ring-yellow border-white/10 bg-black/30 hover:border-yellow hover:bg-yellow/5 has-[:checked]:border-yellow has-[:checked]:bg-yellow/20">
              <input type="radio" value={goal.label} {...register("project_goal")} className="accent-yellow text-yellow w-4 h-4 cursor-pointer" />
              <span className="text-sm font-semibold">{goal.label}</span>
            </label>
          ))}
        </div>
        {errors.project_goal && <p className="text-red-400 text-xs">{errors.project_goal.message}</p>}

        {/* Conditional 'Other' input for Project Goal */}
        {selectedGoal === "Other" && (
          <div className="mt-2 animate-in slide-in-from-top-2">
            <input
              {...register("project_goal_other")}
              placeholder="Please specify your main goal..."
              className="bg-black/50 border border-white/10 p-3 rounded-lg focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors w-full text-white"
            />
            {errors.project_goal_other && <p className="text-red-400 text-xs">{errors.project_goal_other.message}</p>}
          </div>
        )}
      </div>

      {/* Q6. When are you planning to start? */}
      <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
        <label className="text-sm font-semibold uppercase tracking-widest text-white/80 flex items-center gap-2">
          <Clock size={16} /> 6. When are you planning to start? *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            "ASAP",
            "Within 2 weeks",
            "Within a month",
            "Just exploring"
          ].map(timeline => (
            <label key={timeline} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all outline-none focus-within:ring-1 focus-within:ring-yellow border-white/10 bg-black/30 hover:border-yellow hover:bg-yellow/5 has-[:checked]:border-yellow has-[:checked]:bg-yellow/20">
              <input type="radio" value={timeline} {...register("planning_start")} className="accent-yellow text-yellow w-4 h-4 cursor-pointer" />
              <span className="text-sm font-semibold">{timeline}</span>
            </label>
          ))}
        </div>
        {errors.planning_start && <p className="text-red-400 text-xs">{errors.planning_start.message}</p>}
      </div>

    </div>
  );
}
