"use client";

import { useState, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";

/* ─── Media Assets ────────────────────────────────────────────────────────── */
type MediaItem = { type: "image" | "video"; src: string; thumb?: string };

const btsMedia: MediaItem[] = [
  { type: "image", src: "/BTS/2.jpeg" },
  { type: "image", src: "/BTS/3.jpeg" },
  { type: "image", src: "/BTS/4.jpeg" },
  { type: "image", src: "/BTS/5.jpeg" },
  { type: "image", src: "/BTS/6.jpeg" },
  { type: "image", src: "/BTS/7.jpeg" },
  { type: "image", src: "/BTS/8.jpeg" },
  { type: "image", src: "/BTS/9.jpeg" },
  { type: "image", src: "/BTS/10.jpeg" },
  { type: "image", src: "/BTS/11.jpeg" },
  { type: "image", src: "/BTS/12.jpeg" },
  { type: "image", src: "/BTS/13.jpeg" },
  { type: "image", src: "/BTS/14.jpeg" },
  { type: "image", src: "/BTS/15.jpeg" },
  { type: "image", src: "/BTS/16.jpeg" },
  { type: "image", src: "/BTS/17.jpeg" },
  { type: "image", src: "/BTS/18.jpeg" },
  { type: "image", src: "/BTS/19.jpeg" },
  { type: "image", src: "/BTS/20.jpeg" },
  { type: "image", src: "/BTS/24.jpeg" },
  { type: "image", src: "/BTS/25.jpeg" },
  { type: "image", src: "/BTS/26.jpeg" },
  { type: "image", src: "/BTS/28.jpeg" },
  { type: "image", src: "/BTS/29.jpeg" },
  { type: "image", src: "/BTS/30.jpeg" },
  { type: "image", src: "/BTS/31.jpeg" },
  { type: "image", src: "/BTS/32.jpeg" },
  { type: "image", src: "/BTS/33.jpeg" },
  { type: "image", src: "/BTS/34.jpeg" },
  { type: "image", src: "/BTS/WhatsApp Image 2026-03-28 at 1.00.24 AM.jpeg" },
  { type: "image", src: "/BTS/WhatsApp Image 2026-03-28 at 1.00.30 AM.jpeg" },
  { type: "image", src: "/BTS/WhatsApp Image 2026-03-28 at 2.53.20 AM.jpeg" },
  { type: "video", src: "/BTS/21.mp4" },
  { type: "video", src: "/BTS/35.mp4" },
  { type: "video", src: "/BTS/36.mp4" },
  { type: "video", src: "/BTS/WhatsApp Video 2026-03-28 at 2.53.18 AM.mp4" },
  { type: "video", src: "/BTS/WhatsApp Video 2026-03-28 at 2.53.19 AM.mp4" },
];

/* ─── Animation Variants ──────────────────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show:  { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const lightboxVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  show:   { opacity: 1, scale: 1,   transition: { duration: 0.3, ease: "easeOut" as const } },
  exit:   { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function BTSPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox  = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);

  const prev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + btsMedia.length) % btsMedia.length));
  }, []);

  const next = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % btsMedia.length));
  }, []);

  const current = lightboxIndex !== null ? btsMedia[lightboxIndex] : null;

  return (
    <main className="min-h-screen bg-[#080812] flex flex-col items-center overflow-x-hidden">
      <Navbar />

      {/* ── Hero Header ───────────────────────────────────────────────────── */}
      <section className="relative w-full flex flex-col items-center justify-center pt-40 pb-16 overflow-hidden">
        {/* Animated background film-grain texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,238,52,0.06)_0%,_transparent_70%)] pointer-events-none" />

        {/* Animated horizontal scan lines */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, white 2px, white 3px)",
            backgroundSize: "100% 4px",
          }}
          animate={{ backgroundPositionY: ["0px", "40px"] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />

        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-yellow/60 text-xs uppercase tracking-[0.5em] font-semibold mb-4"
        >
          Exclusive Access
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white uppercase tracking-widest font-[fantasy] text-center"
        >
          Behind The{" "}
          <span className="text-yellow drop-shadow-[0_0_30px_rgba(255,238,52,0.6)]">
            Scenes
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-6 text-white/40 text-sm md:text-base tracking-widest uppercase max-w-xl text-center px-4"
        >
          Where the magic happens — on-set life, creative process & cinematic moments
        </motion.p>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-10 w-32 h-px bg-gradient-to-r from-transparent via-yellow to-transparent origin-center"
        />

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="flex gap-10 mt-10"
        >
          {[
            { label: "Photos", value: "32" },
            { label: "Videos", value: "5" },
            { label: "Projects", value: "6+" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold text-yellow font-[fantasy]">{value}</div>
              <div className="text-xs uppercase tracking-widest text-white/40 mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Gallery Grid ──────────────────────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-4 pb-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
          className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4"
        >
          {btsMedia.map((item, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              onClick={() => openLightbox(index)}
              className="
                break-inside-avoid relative group overflow-hidden rounded-xl
                cursor-pointer border border-white/[0.06]
                hover:border-yellow/40 transition-colors duration-300
                shadow-[0_4px_24px_rgba(0,0,0,0.5)]
              "
            >
              {item.type === "image" ? (
                <div className="relative w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={`BTS ${index + 1}`}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="relative w-full aspect-video bg-black">
                  <video
                    src={item.src}
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Video play indicator */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border-2 border-white/60 bg-black/40 backdrop-blur-sm flex items-center justify-center group-hover:border-yellow group-hover:bg-yellow/20 transition-all duration-300">
                      <Play size={22} className="text-white group-hover:text-yellow translate-x-0.5 transition-colors duration-300" />
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-yellow text-navy text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                    Video
                  </div>
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />

              {/* Frame number badge */}
              <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[10px] text-yellow/80 font-mono tracking-widest bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
                  #{String(index + 1).padStart(2, "0")}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <Footer />

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxIndex !== null && current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-5 right-5 z-10 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
            >
              <X size={28} />
            </button>

            {/* Counter */}
            <div className="absolute top-5 left-5 z-10 text-white/40 text-sm font-mono tracking-widest">
              {String(lightboxIndex + 1).padStart(2, "0")} / {String(btsMedia.length).padStart(2, "0")}
            </div>

            {/* Prev */}
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 md:left-8 z-10 p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
            >
              <ChevronLeft size={32} />
            </button>

            {/* Media */}
            <motion.div
              key={lightboxIndex}
              variants={lightboxVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="relative max-w-5xl w-full max-h-[85vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {current.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={current.src}
                  alt={`BTS ${lightboxIndex + 1}`}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-[0_0_80px_rgba(0,0,0,0.8)]"
                />
              ) : (
                <video
                  src={current.src}
                  controls
                  autoPlay
                  className="max-w-full max-h-[85vh] rounded-lg shadow-[0_0_80px_rgba(0,0,0,0.8)]"
                />
              )}

              {/* Yellow glow under active item */}
              <div className="absolute -bottom-6 inset-x-[20%] h-8 bg-yellow/10 blur-2xl rounded-full pointer-events-none" />
            </motion.div>

            {/* Next */}
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 md:right-8 z-10 p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
            >
              <ChevronRight size={32} />
            </button>

            {/* Thumbnail strip */}
            <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1 px-4 overflow-x-auto">
              {btsMedia.map((item, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`flex-shrink-0 w-10 h-10 rounded overflow-hidden border-2 transition-all duration-200 ${
                    i === lightboxIndex ? "border-yellow scale-110" : "border-transparent opacity-40 hover:opacity-70"
                  }`}
                >
                  {item.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.src} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                      <Play size={12} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
