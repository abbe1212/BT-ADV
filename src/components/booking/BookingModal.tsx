"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import BookingForm from "./BookingForm";
import CinemaTicket from "./CinemaTicket";
import { useLanguage } from "@/context/LanguageContext";

export default function BookingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [ticketData, setTicketData] = useState<any>(null); // Replace with precise type later
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-navy border border-yellow/20 rounded-xl shadow-[0_0_50px_rgba(255,238,52,0.15)] ring-1 ring-white/10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 text-white hover:text-yellow transition-colors bg-navy/50 p-2 rounded-full backdrop-blur-md"
            >
              <X size={24} />
            </button>

            <div className="p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-yellow mb-2 text-center uppercase tracking-wider font-display">
                {t("booking.title")}
              </h2>
              <p className="text-white/70 text-center mb-8">
                {t("booking.subtitle")}
              </p>

              {!ticketData ? (
                <BookingForm onTicketGenerated={setTicketData} />
              ) : (
                <CinemaTicket ticketData={ticketData} onClose={onClose} />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
