"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import BookingModal from "@/components/booking/BookingModal";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { X } from "lucide-react";

export default function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-start overflow-hidden bg-black selection:bg-yellow selection:text-navy">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image 
          src="/img.png" 
          alt="Cinematic background for BT Agency" 
          fill
          priority
          className="object-cover object-center"
        />
        {/* Subtle dark overlay for better text contrast if needed */}
        <div className="absolute inset-0 bg-black/10 md:bg-black/20"></div>
      </div>

      {/* Top Gradient for Navbar blending */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-navy/80 to-transparent z-10 pointer-events-none" />

      {/* The Cinema Screen positioned to fit the blank wall */}
      <div 
        className="absolute z-10 top-[28%] sm:top-[26%] md:top-[22%] inset-x-0 mx-auto w-[95%] sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[63%] aspect-[21/9] flex flex-col items-center justify-center rounded-sm overflow-hidden shadow-[0_0_60px_rgba(255,238,52,0.15)] ring-1 ring-white/10 bg-black/80 transition-all duration-500"
        style={{ perspective: "1000px" }}
      >
        
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-screen pointer-events-none"
          src="/Ads images/BT_Website V04 (NFull).mp4"
        />
        
        {/* Screen Text Overlay */}
        <div className="group absolute inset-0 flex flex-col items-center justify-center overflow-hidden p-4 md:p-8 text-center bg-gradient-to-t from-black/80 via-black/40 to-black/80 hover:from-transparent hover:via-transparent hover:to-transparent z-20 transition-all duration-700 cursor-pointer">
          
          {/* Title - Moves to Top Left */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120%] group-hover:top-4 group-hover:left-4 group-hover:-translate-x-0 group-hover:-translate-y-0 group-hover:scale-[0.4] transition-all duration-700 origin-top-left ease-in-out pointer-events-none">
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-yellow uppercase tracking-widest font-[fantasy] drop-shadow-[0_0_15px_rgba(255,238,52,0.6)] whitespace-nowrap"
            >
              {t("hero.title")}
            </motion.h1>
          </div>

          {/* Subtitle - Moves to Bottom Right (Actually right just below center or bottom corner) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[20%] group-hover:top-auto group-hover:bottom-4 group-hover:right-4 group-hover:left-auto group-hover:translate-x-0 group-hover:translate-y-0 group-hover:scale-[0.6] transition-all duration-700 origin-bottom-right ease-in-out pointer-events-none">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
              className="text-sm border-t border-white/20 pt-2 sm:text-base md:text-lg lg:text-xl text-white font-light tracking-wide drop-shadow-lg whitespace-nowrap"
            >
              {t("hero.subtitle")}
            </motion.h2>
          </div>

          {/* Hover Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-30">
            <button 
              onClick={() => setIsVideoModalOpen(true)}
              className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-yellow/50 text-yellow shadow-[0_0_30px_rgba(255,238,52,0.2)] hover:scale-110 hover:shadow-[0_0_50px_rgba(255,238,52,0.8)] hover:bg-yellow hover:text-navy transition-all duration-300"
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8 md:w-10 md:h-10 translate-x-[2px]"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3l14 9-14 9V3z"></path></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Astronaut Cutout Layer for 3D Depth (Must perfectly match the background sizing) */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <Image 
          src="/astronaut-cutout.png" 
          alt="Astronaut cutout" 
          fill
          className="object-cover object-center"
        />
      </div>

      {/* Floating CTA Button */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-6 sm:bottom-12 md:bottom-16 inset-x-0 mx-auto w-fit z-30"
      >
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-yellow text-navy px-6 py-3 sm:px-8 sm:py-4 rounded-md font-bold text-sm sm:text-base md:text-lg shadow-[0_0_30px_rgba(255,238,52,0.4)] hover:shadow-[0_0_50px_rgba(255,238,52,0.8)] hover:scale-105 transition-all duration-300 uppercase tracking-widest"
        >
          {t("hero.book_button")}
        </button>
      </motion.div>

      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Video Overlay Modal */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-12 pointer-events-auto"
          >
            <button 
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-6 right-6 md:top-10 md:right-10 text-white/50 hover:text-white transition-colors p-2 z-10"
            >
              <X size={32} />
            </button>
            
            <div className="w-full max-w-6xl aspect-video bg-black rounded-lg overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] relative">
              <video 
                src="/Ads images/BT_Website V04 (NFull).mp4"
                className="w-full h-full object-contain"
                autoPlay
                controls
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
