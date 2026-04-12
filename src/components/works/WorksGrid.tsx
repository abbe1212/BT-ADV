"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Work, Client } from "@/lib/supabase/types";
import { Building2 } from "lucide-react";

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
      {/* Filters Container */}
      <div className="w-full flex flex-col items-center gap-6 mb-12">
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full border transition-all duration-300 uppercase text-sm tracking-wider font-semibold
                ${activeCategory === cat
                  ? "bg-yellow text-navy border-yellow shadow-[0_0_15px_rgba(255,238,52,0.6)]"
                  : "bg-transparent text-white/70 border-white/20 hover:border-yellow hover:text-yellow"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Client Filter */}
        {clientsWithWorks.length > 0 && (
          <div className="w-full max-w-5xl overflow-x-auto scrollbar-none pb-2 flex gap-3 px-4">
            <button
              onClick={() => setActiveClientSlug("All")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 flex-shrink-0
                ${activeClientSlug === "All"
                  ? "bg-yellow/10 border-yellow text-yellow border"
                  : "bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:text-white border"
                }`}
            >
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">All Clients</span>
            </button>
            {clientsWithWorks.map((client) => (
              <button
                key={client.id}
                onClick={() => setActiveClientSlug(client.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 flex-shrink-0 border
                  ${activeClientSlug === client.slug
                    ? "bg-yellow/10 border-yellow text-white"
                    : "bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
              >
                {client.logo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={client.logo_url} alt={client.name} className="w-5 h-5 object-contain" />
                )}
                <span className="text-sm font-semibold whitespace-nowrap">{client.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <p className="text-white/40 text-center py-20 tracking-widest uppercase text-sm">
          No works found matching filters.
        </p>
      )}

      {/* Campaign Grid */}
      <motion.div layout className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((work) => (
          <Link href={`/works/${work.id}`} key={work.id}>
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer bg-black"
            >
              <img
                src={work.image_url}
                alt={work.title_en ?? work.title_ar}
                className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 group-hover:opacity-40 opacity-80 sm:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/40 to-transparent flex flex-col justify-end p-6 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-yellow text-xs font-bold uppercase tracking-widest mb-1 flex items-center justify-between">
                  <span>{work.category}</span>
                </span>
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                  {work.title_en ?? work.title_ar}
                </h3>
                
                <div className="flex justify-between items-end mt-auto">
                  {work.year && (
                     <span className="text-white/50 text-xs font-mono">{work.year}</span>
                  )}
                  {work.clients && (
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 z-20">
                      {work.clients.logo_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={work.clients.logo_url} alt={work.clients.name} className="w-4 h-4 object-contain" />
                      )}
                      <span className="text-[10px] text-white/90 font-semibold">{work.clients.name}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Video badge */}
              {work.video_url && (
                <div className="absolute top-3 right-3 bg-yellow text-navy text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full z-10">
                  Video
                </div>
              )}
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </>
  );
}
