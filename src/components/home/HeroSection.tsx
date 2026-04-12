"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { X, Play } from "lucide-react";
import type { Client } from "@/lib/supabase/types";

interface Props {
  logos?: Client[];
}

export default function HeroSection({ logos = [] }: Props) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-start overflow-hidden bg-black selection:bg-yellow selection:text-navy">
      {/* Background Layer (Shifted up on portrait/folds/tablets) */}
      <div className="absolute inset-0 z-0 transform xl:translate-y-0 -translate-y-[12%] scale-150 sm:scale-125 xl:scale-100 transition-transform duration-1000 pointer-events-none">
        <Image 
          src="/img.png" 
          alt="Cinematic background for BT-ADV" 
          fill
          priority
          className="object-cover object-center"
        />
        {/* Subtle dark overlay */}
        <div className="absolute inset-0 bg-black/10 xl:bg-black/20"></div>
      </div>

      {/* Top Gradient for Navbar blending */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-navy/80 to-transparent z-10 pointer-events-none" />

      {/* Floating Interactive Moon */}
      <motion.div
        className="absolute top-20 right-6 md:top-24 md:right-12 z-40 cursor-pointer w-24 h-24 md:w-36 md:h-36"
        initial={{ y: -50, opacity: 0 }}
        animate={{ 
          y: [-10, 10, -10], 
          opacity: 0.8 
        }}
        transition={{ 
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 1, delay: 0.5 } 
        }}
        whileHover={{
          scale: 1.15,
          opacity: 1,
          rotate: 15,
          filter: "drop-shadow(0 0 35px rgba(255,238,52,0.8))",
          transition: { duration: 0.4, ease: "easeOut" }
        }}
      >
        <Image 
          src="/moon.png" 
          alt="Floating Moon" 
          fill
          sizes="(max-width: 768px) 96px, 144px"
          className="object-contain"
        />
      </motion.div>

      {/* The Cinema Screen positioned to fit the blank wall */}
      <div 
        className="absolute z-10 -translate-y-1/2 xl:top-[23%] xl:translate-y-0 inset-x-0 mx-auto w-full sm:w-[95%] xl:w-[60%] xl:aspect-[21/10] aspect-video flex flex-col items-center justify-center rounded-sm overflow-hidden shadow-[0_0_80px_rgba(255,238,52,0.2)] ring-1 ring-white/10 bg-black/80 transition-all duration-700"
        style={{ perspective: "1000px", top: 'calc(20% + 20px)' }}
      >
        
        {/* Background YouTube Video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none rounded-sm opacity-80 mix-blend-screen bg-black/60">
          <iframe
            className="absolute top-1/2 left-1/2 w-[300%] h-[300%] sm:w-[200%] sm:h-[200%] xl:w-[150%] xl:h-[150%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            src="https://www.youtube.com/embed/YOUR_YOUTUBE_VIDEO_ID?autoplay=1&mute=1&controls=0&loop=1&playlist=YOUR_YOUTUBE_VIDEO_ID&showinfo=0&rel=0&modestbranding=1"
            title="YouTube background video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
        
        {/* Screen Text Overlay */}
        <div className="group absolute inset-0 flex flex-col items-center justify-center overflow-hidden p-4 md:p-8 text-center bg-gradient-to-t from-black/80 via-black/40 to-black/80 hover:from-transparent hover:via-transparent hover:to-transparent z-20 transition-all duration-700 cursor-pointer">
          
          {/* Title - OUR WORK */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120%] group-hover:top-4 group-hover:left-4 group-hover:-translate-x-0 group-hover:-translate-y-0 group-hover:scale-[0.4] transition-all duration-700 origin-top-left ease-in-out pointer-events-none flex gap-1 sm:gap-2">
            {"OUR WORK".split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 100, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.1 + 0.2,
                  type: "spring",
                  bounce: 0.4
                }}
                className={`text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold uppercase tracking-widest font-[fantasy] whitespace-nowrap drop-shadow-[0_0_20px_rgba(255,238,52,0.8)]
                  ${char.trim() === '' ? 'w-4 sm:w-8' : 'text-transparent bg-clip-text bg-gradient-to-b from-yellow to-yellow/60'}`}
              >
                {char}
              </motion.span>
            ))}
          </div>

          {/* Subtitle - We innovate your vision */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[20%] group-hover:top-auto group-hover:bottom-4 group-hover:right-4 group-hover:left-auto group-hover:translate-x-0 group-hover:translate-y-0 group-hover:scale-[0.6] transition-all duration-700 origin-bottom-right ease-in-out pointer-events-none mt-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, filter: "blur(5px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.2, delay: 1 }}
              className="relative"
            >
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 1.5, ease: "easeInOut" }}
                className="absolute -top-4 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-yellow/50 to-transparent"
              />
              <h2 className="text-base sm:text-lg md:text-xl lg:text-3xl text-white font-light tracking-[0.2em] drop-shadow-xl whitespace-nowrap">
                We <span className="font-semibold text-yellow">innovate</span> your vision
              </h2>
            </motion.div>
          </div>
          
          {/* Decorative floating particles inside the screen */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             {[
               { x: "10%", duration: 4, delay: 0 },
               { x: "30%", duration: 5, delay: 1 },
               { x: "50%", duration: 6, delay: 0.5 },
               { x: "70%", duration: 4.5, delay: 1.5 },
               { x: "90%", duration: 5.5, delay: 0.8 },
             ].map((particle, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-yellow/60 rounded-full shadow-[0_0_8px_rgba(255,238,52,0.8)]"
                  initial={{
                    left: particle.x,
                    y: "110%",
                    opacity: 0
                  }}
                  animate={{
                    y: "-20%",
                    opacity: [0, 1, 0],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: particle.duration,
                    repeat: Infinity,
                    delay: particle.delay,
                    ease: "linear"
                  }}
                />
             ))}
          </div>

          {/* Hover Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-30">
            <button 
              onClick={() => setIsVideoModalOpen(true)}
              className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-yellow/50 text-yellow shadow-[0_0_30px_rgba(255,238,52,0.2)] hover:scale-110 hover:shadow-[0_0_50px_rgba(255,238,52,0.8)] hover:bg-yellow hover:text-navy transition-all duration-300 relative group/btn"
            >
               <span className="absolute inset-0 rounded-full bg-yellow opacity-0 group-hover/btn:animate-ping group-hover/btn:opacity-20"></span>
               <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8 md:w-10 md:h-10 translate-x-[2px] relative z-10"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3l14 9-14 9V3z"></path></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Astronaut Cutout Layer for 3D Depth (Must perfectly match the background sizing/transform) */}
      <div className="absolute inset-0 z-20 transform xl:translate-y-0 -translate-y-[12%] scale-150 sm:scale-125 xl:scale-100 transition-transform duration-1000 pointer-events-none">
          <Image 
            src="/astronaut-cutout.png" 
            alt="Astronaut cutout" 
            fill
            className="object-cover object-center"
          />
      </div>

      {/* Floating CTA Button & Client Logos (Mobile & Tablet) */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-4 sm:bottom-12 md:bottom-16 inset-x-0 mx-auto w-full flex flex-col items-center gap-6 z-30"      >
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4 sm:px-0">
          <Link 
            href="/booking"
            className="flex items-center justify-center w-full sm:w-auto bg-yellow text-navy px-6 py-3 sm:px-8 sm:py-4 rounded-md font-bold text-sm sm:text-base md:text-lg shadow-[0_0_30px_rgba(255,238,52,0.4)] hover:shadow-[0_0_50px_rgba(255,238,52,0.8)] hover:scale-105 transition-all duration-300 uppercase tracking-widest"
          >
            {t("hero.book_button")}
          </Link>
          <Link 
            href="/works"
            className="w-full sm:w-auto text-center bg-transparent border-2 border-yellow text-yellow px-6 py-3 sm:px-8 sm:py-4 rounded-md font-bold text-sm sm:text-base md:text-lg hover:bg-yellow hover:text-navy hover:shadow-[0_0_50px_rgba(255,238,52,0.8)] hover:scale-105 transition-all duration-300 uppercase tracking-widest"
          >
            Discover our Works
          </Link>
        </div>

        {/* Minimal Logos Row for Mobile & Tablet Viewports */}
        {logos.length > 0 && (
          <div className="w-full xl:hidden py-3 bg-black/40 backdrop-blur-md border-y border-white/10 overflow-hidden">
             <div className="flex gap-10 animate-marquee whitespace-nowrap px-4">
                {logos.slice(0, 11).map((logo) => {
                  const content = (
                    <>
                      {logo.logo_url && <Image src={logo.logo_url} alt={logo.name} fill sizes="80px" className="object-contain" />}
                      {logo.youtube_url && (
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity rounded">
                          <Play className="w-5 h-5 text-yellow fill-yellow mb-0.5" />
                          <span className="text-[10px] text-yellow font-bold text-center leading-tight">شوف<br/>الإعلان</span>
                        </div>
                      )}
                    </>
                  );
                  return logo.youtube_url ? (
                    <a key={logo.id} href={logo.youtube_url} target="_blank" rel="noopener noreferrer" className="relative w-24 h-16 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all flex-shrink-0 group block cursor-pointer">
                      {content}
                    </a>
                  ) : (
                    <div key={logo.id} className="relative w-24 h-16 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all flex-shrink-0 group">
                      {content}
                    </div>
                  );
                })}
                {/* Duplicate for infinite marquee */}
                {logos.slice(0, 11).map((logo) => {
                  const content = (
                    <>
                      {logo.logo_url && <Image src={logo.logo_url} alt={logo.name} fill sizes="80px" className="object-contain" />}
                      {logo.youtube_url && (
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity rounded">
                          <Play className="w-5 h-5 text-yellow fill-yellow mb-0.5" />
                          <span className="text-[10px] text-yellow font-bold text-center leading-tight">شوف<br/>الإعلان</span>
                        </div>
                      )}
                    </>
                  );
                  return logo.youtube_url ? (
                    <a key={`dup-${logo.id}`} href={logo.youtube_url} target="_blank" rel="noopener noreferrer" className="relative w-24 h-16 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all flex-shrink-0 group block cursor-pointer">
                      {content}
                    </a>
                  ) : (
                    <div key={`dup-${logo.id}`} className="relative w-24 h-16 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all flex-shrink-0 group">
                      {content}
                    </div>
                  );
                })}
             </div>
          </div>
        )}
      </motion.div>


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
              <iframe 
                src="https://www.youtube.com/embed/YOUR_YOUTUBE_VIDEO_ID?autoplay=1"
                className="absolute inset-0 w-full h-full"
                title="YouTube Video Modal"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
