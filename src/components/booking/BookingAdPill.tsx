"use client";

import Image from "next/image";
import { Play, Megaphone } from "lucide-react";
import type { Client } from "@/lib/supabase/types";

interface Props {
  clients: Client[];
}

export default function BookingAdPill({ clients }: Props) {
  const adsClients = clients.filter((c) => c.youtube_url);

  if (adsClients.length === 0) return null;

  // Duplicate for seamless infinite loop (same as ClientsMarquee / Reviews)
  const items = [...adsClients, ...adsClients];

  return (
    <div className="rounded-xl border border-yellow/20 bg-white/5 backdrop-blur-sm overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        <Megaphone className="w-4 h-4 text-yellow flex-shrink-0" />
        <span className="text-yellow text-xs font-bold uppercase tracking-widest">
          Our Ads
        </span>
      </div>

      {/* Scrolling strip */}
      <div className="relative overflow-hidden pb-4">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[#0a0a14] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#0a0a14] to-transparent z-10" />

        <div
          className="flex gap-3 w-max px-4"
          style={{
            animation: "reviewsScroll 18s linear infinite",
            willChange: "transform",
          }}
        >
          {items.map((client, idx) => (
            <a
              key={`${client.id}-${idx}`}
              href={client.youtube_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-44 rounded-xl overflow-hidden bg-black/40 border border-white/10 hover:border-yellow/50 transition-all duration-300 group relative"
            >
              {/* Thumbnail */}
              <div className="relative w-full aspect-video overflow-hidden">
                {client.logo_url ? (
                  <Image
                    src={client.logo_url}
                    alt={client.name}
                    fill
                    sizes="176px"
                    className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-navy/60 flex items-center justify-center">
                    <Megaphone className="w-8 h-8 text-yellow/30" />
                  </div>
                )}
                {/* Dark gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Play icon overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="w-8 h-8 rounded-full bg-yellow flex items-center justify-center shadow-[0_0_20px_rgba(255,238,52,0.6)]">
                    <Play className="w-3.5 h-3.5 fill-navy text-navy translate-x-px" />
                  </span>
                </div>
              </div>

              {/* Client info */}
              <div className="px-2.5 py-2">
                <p className="text-white text-[11px] font-semibold truncate group-hover:text-yellow transition-colors">
                  {client.name}
                </p>
                {client.industry && (
                  <p className="text-white/40 text-[9px] truncate mt-0.5">
                    {client.industry}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
