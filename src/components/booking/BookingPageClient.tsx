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
import { ChevronLeft } from "lucide-react";
import type { Client } from "@/lib/supabase/types";

type TicketData = BookingWizardData & {
  ref_code: string;
};

interface Props {
  clientLogos: Client[];
}

export default function BookingPageClient({ clientLogos }: Props) {
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-black overflow-hidden selection:bg-yellow selection:text-navy flex flex-col justify-between pt-24">
      {/* Background Visuals */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Background Image */}
        <div className="absolute inset-0 scale-110 opacity-40 mix-blend-lighten">
          <Image 
            src="/img.png" 
            alt="Cinematic background" 
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-navy/90 via-black/80 to-black z-0"></div>

        {/* Floating Moon */}
        <motion.div
          className="absolute top-32 left-10 md:top-40 md:left-24 z-0 opacity-40 w-32 h-32 md:w-64 md:h-64 filter blur-sm"
          animate={{ y: [-20, 20, -20], rotate: [0, 5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image src="/moon.png" alt="Moon" fill className="object-contain" />
        </motion.div>

        {/* Floating Astronaut */}
        <motion.div
          className="absolute bottom-20 right-10 md:bottom-40 md:right-32 z-0 opacity-20 w-48 h-48 md:w-96 md:h-96 blur-[2px]"
          animate={{ y: [20, -20, 20], x: [10, -10, 10], rotate: [-10, 5, -10] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image src="/astronaut-cutout.png" alt="Astronaut" fill className="object-contain" />
        </motion.div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 md:w-2 md:h-2 bg-yellow/40 rounded-full shadow-[0_0_8px_rgba(255,238,52,0.6)]"
              initial={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0,
                scale: 0
              }}
              animate={{
                y: [0, -100],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0]
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear"
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 md:px-8 py-10 flex-grow flex flex-col items-center justify-center">
        {/* Back Button */}
        <Link 
          href="/" 
          className="self-start mb-8 text-white/50 hover:text-yellow transition-all flex items-center gap-2 uppercase tracking-widest text-xs font-bold"
        >
          <ChevronLeft size={16} /> Back to Home
        </Link>

        {/* Main Content Container */}
        <div className="w-full bg-navy/60 backdrop-blur-xl border border-yellow/20 rounded-2xl shadow-[0_0_60px_rgba(255,238,52,0.1)] ring-1 ring-white/10 p-6 md:p-12 relative overflow-hidden">
          {/* Subtle Glow inside container */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-yellow/10 blur-[80px] rounded-full pointer-events-none"></div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-yellow mb-4 text-center uppercase tracking-widest font-[fantasy] drop-shadow-[0_0_15px_rgba(255,238,52,0.6)]">
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
                <BookingWizard onTicketGenerated={setTicketData} />
              </motion.div>
            ) : (
              <motion.div
                key="ticket"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                className="flex flex-col items-center gap-6"
              >
                <CinemaTicket ticketData={ticketData} onClose={() => setTicketData(null)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Clients Marquee Section */}
      <div className="relative z-10 w-full bg-black border-t border-white/5">
        <ClientsMarquee logos={clientLogos} />
      </div>
    </div>
  );
}
