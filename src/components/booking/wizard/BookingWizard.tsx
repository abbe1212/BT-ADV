"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { getCsrfToken } from "@/lib/csrf-client";

import StepIndicator from "./StepIndicator";
import Step1Contact from "./Step1Contact";
import Step2Company from "./Step2Company";
import Step3ProjectDetails from "./Step3ProjectDetails";
import Step4Meeting from "./Step4Meeting";

const bookingSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Invalid phone number"),
  address: z.string().optional(),
  
  company_name: z.string().min(2, "Company name is required"),
  company_brief: z.string().optional(),
  industry: z.string().optional(),
  has_brand_guide: z.boolean().optional(),
  previous_ads: z.boolean().optional(),
  target_audience: z.enum(["B2B", "B2C", "General", "Other"]).optional(),
  platforms: z.array(z.string()).optional(),
  
  project_type: z.string().min(1, "Please select a project type"),
  project_type_other: z.string().optional(),
  project_goal: z.string().min(1, "Please select a goal"),
  project_goal_other: z.string().optional(),
  planning_start: z.string().min(1, "Please select a timeline"),
  
  date: z.date().optional(),
  time_slot: z.string().min(1, "Please select a preferred time"),
  type: z.string().default("phone"),
  estimated_budget: z.string().min(1, "Please enter your budget").refine(v => !isNaN(Number(v)) && Number(v) > 0, "Must be a valid positive number"),
  notes: z.string().optional(),
});

export type BookingWizardData = z.infer<typeof bookingSchema>;

interface Props {
  onTicketGenerated: (data: BookingWizardData & { ref_code: string }) => void;
}

export default function BookingWizard({ onTicketGenerated }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const methods = useForm<BookingWizardData>({
    resolver: zodResolver(bookingSchema),
    mode: "onBlur",
    defaultValues: {
      platforms: [],
      has_brand_guide: false,
      previous_ads: false,
    }
  });

  const { trigger, handleSubmit } = methods;

  const handleNext = async () => {
    let fieldsToValidate: Array<keyof BookingWizardData> = [];
    if (currentStep === 1) {
      fieldsToValidate = ["name", "email", "phone"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["company_name", "industry", "target_audience", "company_brief"];
    } else if (currentStep === 3) {
      fieldsToValidate = ["project_type", "project_goal", "planning_start"];
    }

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 100, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const onSubmit = async (data: BookingWizardData) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        ...data,
        date: data.date ? data.date.toISOString().split("T")[0] : undefined,
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
          setSubmitError("⚠️ This time slot was just taken. Please choose another slot.");
        } else {
          setSubmitError(json.error ?? "Something went wrong. Please try again.");
        }
        return;
      }

      onTicketGenerated({ ...data, ref_code: json.ref_code });
    } catch (error) {
      setSubmitError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <StepIndicator currentStep={currentStep} totalSteps={4} />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 text-white w-full">
          
          <div className="min-h-[400px]">
            {currentStep === 1 && <Step1Contact />}
            {currentStep === 2 && <Step2Company />}
            {currentStep === 3 && <Step3ProjectDetails />}
            {currentStep === 4 && <Step4Meeting />}
          </div>

          {submitError && (
            <div className="p-4 bg-red-500/10 border border-red-400/30 rounded-lg">
              <p className="text-red-400 text-sm font-semibold">{submitError}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all font-semibold tracking-wider text-sm disabled:opacity-50"
              >
                <ArrowLeft size={16} /> Back
              </button>
            ) : <div />}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 bg-yellow text-navy rounded-lg hover:shadow-[0_0_20px_rgba(255,238,52,0.6)] font-bold tracking-widest transition-all hover:scale-105"
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-yellow text-navy rounded-lg hover:shadow-[0_0_20px_rgba(255,238,52,0.8)] font-bold tracking-widest transition-all hover:scale-[1.03] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed uppercase"
              >
                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                {isSubmitting ? "Processing..." : "Confirm Booking"}
              </button>
            )}
          </div>

        </form>
      </FormProvider>
    </div>
  );
}
