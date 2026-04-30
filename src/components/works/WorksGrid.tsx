"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { Work, Client } from "@/lib/supabase/types";
import { Play, Building2, ArrowRight } from "lucide-react";

interface Props {
  works: Work[];
  categories: string[];
  clients: Client[];
}

export default function WorksGrid({ works, categories, clients }: Props) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeClientSlug, setActiveClientSlug] = useState("All");

  const clientsWithWorks = useMemo(() => {
    const activeClientIds = new Set(works.map(w => w.client_id).filter(Boolean));
    return clients.filter(c => activeClientIds.has(c.id));
  }, [works, clients]);

  const filtered = works.filter((w) => {
    const categoryMatch = activeCategory === "All" || w.category === activeCategory;
    const clientMatch = activeClientSlug === "All" || w.clients?.slug === activeClientSlug;
    return categoryMatch && clientMatch;
  });

  return (
    <>
      {/* ── FILTERS ───────────────────────────────────────────────── */}
      <div className="w-full flex flex-col items-center gap-5 mb-16">

        {/* Category pills */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`relative px-5 py-2 rounded-full text-xs md:text-sm tracking-[0.15em] font-semibold uppercase transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-yellow text-navy shadow-[0_0_20px_rgba(255,238,52,0.5)]"
                  : "bg-white/[0.05] text-white/50 border border-white/[0.08] hover:border-yellow/40 hover:text-yellow hover:bg-white/[0.08]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Client logo filter row */}
        {clientsWithWorks.length > 0 && (
          <div className="w-full max-w-5xl overflow-x-auto no-scrollbar flex gap-2 px-4 pb-1">
            <button
              onClick={() => setActiveClientSlug("All")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex-shrink-0 transition-all duration-300 border ${
                activeClientSlug === "All"
                  ? "bg-yellow/10 border-yellow/50 text-yellow"
                  : "bg-white/[0.04] border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              All Clients
            </button>

            {clientsWithWorks.map((client) => (
              <button
                key={client.id}
                onClick={() => setActiveClientSlug(client.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-300 border ${
                  activeClientSlug === client.slug
                    ? "bg-yellow/10 border-yellow/50 text-yellow"
                    : "bg-white/[0.04] border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                {client.logo_url && (
                  <Image
                    src={client.logo_url}
                    alt={client.name}
                    width={18}
                    height={18}
                    className="object-contain opacity-70"
                    unoptimized
                  />
                )}
                {client.name}
              </button>
            ))}
          </div>
        )}

        {/* Count indicator */}
        <p className="text-white/20 text-xs tracking-widest uppercase">
          {filtered.length} {filtered.length === 1 ? "project" : "projects"}
        </p>
      </div>

      {/* ── EMPTY STATE ────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 && (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-white/30 text-center py-32 tracking-widest uppercase text-sm"
          >
            No works match the current filters.
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── WORKS GRID ─────────────────────────────────────────────── */}
      <motion.div
        layout
        className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
      >
        <AnimatePresence>
          {filtered.map((work, i) => (
            <motion.div
              key={work.id}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.45, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={`/works/${work.id}`} className="group block">
                {/* Card */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/[0.06] hover:border-yellow/30 transition-colors duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">

                  {/* Thumbnail */}
                  <Image
                    src={work.image_url}
                    alt={work.title_en ?? work.title_ar}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    unoptimized
                  />

                  {/* Base gradient — always visible for legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Hover overlay — darkens + reveals centre play */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border-2 border-yellow/70 bg-yellow/10 backdrop-blur-sm flex items-center justify-center shadow-[0_0_30px_rgba(255,238,52,0.4)] group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-5 h-5 text-yellow fill-yellow translate-x-[2px]" />
                    </div>
                  </div>

                  {/* Video badge */}
                  {work.video_url && (
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-yellow text-navy text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                      <Play className="w-2.5 h-2.5 fill-navy" />
                      Video
                    </div>
                  )}

                  {/* Bottom info — always visible */}
                  <div className="absolute bottom-0 inset-x-0 p-4 z-10">
                    <span className="text-yellow/70 text-[10px] font-bold uppercase tracking-[0.2em] block mb-1">
                      {work.category}
                    </span>
                    <h3 className="text-white font-bold text-base md:text-lg leading-snug line-clamp-1 group-hover:text-yellow transition-colors duration-300">
                      {work.title_en ?? work.title_ar}
                    </h3>

                    <div className="flex items-center justify-between mt-2">
                      {work.year && (
                        <span className="text-white/30 text-xs font-mono">{work.year}</span>
                      )}
                      {work.clients && (
                        <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                          {work.clients.logo_url && (
                            <Image
                              src={work.clients.logo_url}
                              alt={work.clients.name}
                              width={14}
                              height={14}
                              className="object-contain opacity-80"
                              unoptimized
                            />
                          )}
                          <span className="text-[10px] text-white/70 font-semibold">
                            {work.clients.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Yellow glow on hover */}
                  <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,238,52,0)] group-hover:shadow-[inset_0_0_0_1px_rgba(255,238,52,0.25)] transition-all duration-500 rounded-xl pointer-events-none" />
                </div>

                {/* Card footer — shows below the card itself */}
                <div className="px-1 mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-yellow/60 text-xs uppercase tracking-widest font-semibold">View Case Study</span>
                  <ArrowRight className="w-4 h-4 text-yellow/60 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
