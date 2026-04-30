"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import BookingWizard from "@/components/booking/wizard/BookingWizard";
import type { BookingWizardData } from "@/components/booking/wizard/BookingWizard";
import CinemaTicket from "@/components/booking/CinemaTicket";
import ClientsMarquee from "@/components/home/ClientsMarquee";
import BookingSidebar from "@/components/booking/BookingSidebar";
import StarField from "@/components/booking/StarField";
import { ChevronLeft } from "lucide-react";
import type { Client, Service, Work, Review } from "@/lib/supabase/types";

type TicketData = BookingWizardData & {
  ref_code: string;
};

interface Props {
  clientLogos: Client[];
  services: Service[];
  featuredWorks: Work[];
  reviews: Review[];
}

export default function BookingPageClient({ clientLogos, services, featuredWorks, reviews }: Props) {
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [showTicket, setShowTicket] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-black overflow-hidden selection:bg-yellow selection:text-navy flex flex-col justify-between pt-24">

      {/* ── Background Visuals ─────────────────────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none">

        {/* Background Image (reduced opacity for star visibility) */}
        <div className="absolute inset-0 scale-110 opacity-25 mix-blend-lighten">
          <Image
            src="/img.png"
            alt="Cinematic background"
            fill
            priority
            className="object-cover object-center"
          />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-black/70 to-black z-0" />

        {/* ✨ Star Field — CSS-only, 180 stars, no Framer Motion */}
        <StarField count={180} />

        {/* Floating Moon */}
        <motion.div
          className="absolute top-32 left-10 md:top-40 md:left-24 z-0 opacity-35 w-32 h-32 md:w-56 md:h-56 filter blur-[1px]"
          animate={{ y: [-20, 20, -20], rotate: [0, 5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image src="/moon.png" alt="Moon" fill className="object-contain" />
        </motion.div>

        {/* Floating Astronaut (hidden on tablet/mobile to reduce clutter) */}
        <motion.div
          className="absolute bottom-20 right-4 md:bottom-40 md:right-16 z-0 opacity-15 w-40 h-40 md:w-72 md:h-72 blur-[2px] hidden xl:block"
          animate={{ y: [20, -20, 20], x: [10, -10, 10], rotate: [-10, 5, -10] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image src="/astronaut-cutout.png" alt="Astronaut" fill className="object-contain" />
        </motion.div>

        {/* Ambient glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      </div>

      {/* ── Main Content Area ──────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-10 flex-grow flex flex-col">

        {/* Back Button */}
        <Link
          href="/"
          className="self-start mb-8 text-white/50 hover:text-yellow transition-all flex items-center gap-2 uppercase tracking-widest text-xs font-bold"
        >
          <ChevronLeft size={16} />
          Back to Home
        </Link>

        {/* ── Two-Column Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">

          {/* ── LEFT: Booking Form ──────────────────────────────────── */}
          <div className="w-full bg-navy/60 backdrop-blur-xl border border-yellow/20 rounded-2xl shadow-[0_0_60px_rgba(255,238,52,0.08)] ring-1 ring-white/10 p-6 md:p-10 relative overflow-hidden">
            {/* Top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-yellow/10 blur-[70px] rounded-full pointer-events-none" />

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-yellow mb-4 text-center uppercase tracking-widest font-display drop-shadow-[0_0_15px_rgba(255,238,52,0.6)]">
              {t("booking.title") || "Book Your Slot"}
            </h1>
            <p className="text-white/70 text-center mb-10 max-w-xl mx-auto text-sm md:text-base">
              {t("booking.subtitle") || "Schedule a meeting with our team to innovate your vision into reality."}
            </p>

            <AnimatePresence mode="wait">
              {!ticketData ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                >
                  <BookingWizard onTicketGenerated={(data) => {
                    setTicketData(data);
                    setTimeout(() => setShowTicket(true), 3500);
                  }} />
                </motion.div>
              ) : !showTicket ? (
                <motion.div
                  key="transition"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center min-h-[400px] text-center px-4"
                >
                  <h3 className="text-2xl md:text-3xl font-bold text-white leading-relaxed mb-4">
                    Perfect — now we know who you are and what you’re aiming for.
                  </h3>
                  <p className="text-xl md:text-2xl text-yellow font-bold uppercase tracking-widest font-display">
                    Pick your time, and let’s build something that stands out.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="ticket"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center gap-6"
                >
                  <CinemaTicket ticketData={ticketData} onClose={() => {
                    setTicketData(null);
                    setShowTicket(false);
                  }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── RIGHT: Sidebar ──────────────────────────────────────── */}
          {/* On mobile: shows below the form as a horizontal section */}
          <div className="xl:sticky xl:top-28 w-full">
            <BookingSidebar
              clients={clientLogos}
              services={services}
              featuredWorks={featuredWorks}
              reviews={reviews}
            />
          </div>
        </div>
      </div>

      {/* ── Clients Marquee ───────────────────────────────────────────── */}
      <div className="relative z-10 w-full bg-black border-t border-white/5 mt-8">
        <ClientsMarquee logos={clientLogos} />
      </div>
    </div>
  );
}
