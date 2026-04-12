"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { BtsItem } from "@/lib/supabase/types";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
};
const lightboxVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

interface Props { media: BtsItem[] }

export default function BTSGallery({ media }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);

  const prev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + media.length) % media.length));
  }, [media.length]);

  const next = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % media.length));
  }, [media.length]);

  const current = lightboxIndex !== null ? media[lightboxIndex] : null;

  return (
    <>
      <section className="w-full max-w-7xl mx-auto px-4 pb-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
          className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4"
        >
          {media.map((item, index) => (
            <motion.div
              key={item.id}
              variants={cardVariants}
              onClick={() => openLightbox(index)}
              className="break-inside-avoid relative group overflow-hidden rounded-xl cursor-pointer border border-white/[0.06] hover:border-yellow/40 transition-colors duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
            >
              {item.media_type === "image" ? (
                <div className="relative w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.media_url}
                    alt={item.title_en ?? item.title_ar ?? `BTS ${index + 1}`}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="relative w-full aspect-video bg-black">
                  <video
                    src={item.media_url}
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
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

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
              <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[10px] text-yellow/80 font-mono tracking-widest bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
                  #{String(index + 1).padStart(2, "0")}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button onClick={closeLightbox} className="absolute top-5 right-5 z-10 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200">
              <X size={28} />
            </button>
            <div className="absolute top-5 left-5 z-10 text-white/40 text-sm font-mono tracking-widest">
              {String(lightboxIndex + 1).padStart(2, "0")} / {String(media.length).padStart(2, "0")}
            </div>
            <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 md:left-8 z-10 p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200">
              <ChevronLeft size={32} />
            </button>

            <motion.div
              key={lightboxIndex}
              variants={lightboxVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="relative max-w-5xl w-full max-h-[85vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {current.media_type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={current.media_url}
                  alt={current.title_en ?? current.title_ar ?? `BTS ${lightboxIndex + 1}`}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-[0_0_80px_rgba(0,0,0,0.8)]"
                />
              ) : (
                <video
                  src={current.media_url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[85vh] rounded-lg shadow-[0_0_80px_rgba(0,0,0,0.8)]"
                />
              )}
              <div className="absolute -bottom-6 inset-x-[20%] h-8 bg-yellow/10 blur-2xl rounded-full pointer-events-none" />
            </motion.div>

            <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 md:right-8 z-10 p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200">
              <ChevronRight size={32} />
            </button>

            {/* Thumbnail strip */}
            <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1 px-4 overflow-x-auto">
              {media.map((item, i) => (
                <button
                  key={item.id}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`flex-shrink-0 w-10 h-10 rounded overflow-hidden border-2 transition-all duration-200 ${i === lightboxIndex ? "border-yellow scale-110" : "border-transparent opacity-40 hover:opacity-70"}`}
                >
                  {item.media_type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.media_url} alt="" className="w-full h-full object-cover" />
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
    </>
  );
}
