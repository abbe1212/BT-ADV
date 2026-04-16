"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Clapperboard, Megaphone, Camera, Film, Palette,
  Globe, Video, Tv, Star, Zap, Monitor, Music,
  Sparkles, TrendingUp, BookOpen, Layers, Quote,
} from "lucide-react";
import type { Service, Work, Client, Review } from "@/lib/supabase/types";
import BookingAdPill from "./BookingAdPill";

// ─── Lucide icon mapping for services ───────────────────────────────────────
// Matches against title_en (case-insensitive). Falls back to Sparkles.
const SERVICE_ICON_MAP: Record<string, React.ReactNode> = {
  "video":        <Video className="w-4 h-4" />,
  "film":         <Film className="w-4 h-4" />,
  "photography":  <Camera className="w-4 h-4" />,
  "photo":        <Camera className="w-4 h-4" />,
  "tv":           <Tv className="w-4 h-4" />,
  "broadcast":    <Tv className="w-4 h-4" />,
  "ad":           <Megaphone className="w-4 h-4" />,
  "ads":          <Megaphone className="w-4 h-4" />,
  "production":   <Clapperboard className="w-4 h-4" />,
  "design":       <Palette className="w-4 h-4" />,
  "branding":     <Star className="w-4 h-4" />,
  "digital":      <Globe className="w-4 h-4" />,
  "social":       <TrendingUp className="w-4 h-4" />,
  "motion":       <Zap className="w-4 h-4" />,
  "web":          <Monitor className="w-4 h-4" />,
  "music":        <Music className="w-4 h-4" />,
  "content":      <BookOpen className="w-4 h-4" />,
  "media":        <Layers className="w-4 h-4" />,
};

function getServiceIcon(service: Service): React.ReactNode {
  // Always match by title keyword — DB icon field often contains raw text, not an emoji
  const text = (service.title_en ?? service.title_ar ?? "").toLowerCase();
  for (const [keyword, icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (text.includes(keyword)) return icon;
  }
  // Final fallback: use icon field only if it looks like an emoji (≤ 2 chars)
  if (service.icon && [...service.icon].length <= 2) {
    return <span className="text-sm leading-none">{service.icon}</span>;
  }
  return <Sparkles className="w-4 h-4" />;
}

// ─── Props ──────────────────────────────────────────────────────────────────
interface Props {
  clients: Client[];
  services: Service[];
  featuredWorks: Work[];
  reviews: Review[];
}

export default function BookingSidebar({ clients, services, featuredWorks, reviews }: Props) {

  return (
    <aside className="flex flex-col gap-5 w-full">

      {/* ── 1. Our Ads ──────────────────────────────────────────────────── */}
      <BookingAdPill clients={clients} />

      {/* ── 2. Our Services ─────────────────────────────────────────────── */}
      {services.length > 0 && (
        <div className="rounded-xl border border-yellow/20 bg-white/5 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-yellow text-xs font-bold uppercase tracking-widest">
              Our Services
            </h3>
            <Link
              href="/pricing"
              className="text-white/40 hover:text-yellow text-[10px] uppercase tracking-widest transition-colors"
            >
              View All →
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {services.slice(0, 8).map((svc) => (
              <div
                key={svc.id}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-yellow/40 hover:bg-yellow/5 transition-all duration-200 cursor-default group"
              >
                <span className="text-yellow/70 group-hover:text-yellow transition-colors">
                  {getServiceIcon(svc)}
                </span>
                <span className="text-white/70 text-[11px] font-medium group-hover:text-white transition-colors whitespace-nowrap">
                  {svc.title_en ?? svc.title_ar}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. Featured Works ───────────────────────────────────────────── */}
      {featuredWorks.length > 0 && (
        <div className="rounded-xl border border-yellow/20 bg-white/5 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-yellow text-xs font-bold uppercase tracking-widest">
              أخر اعمالنا
            </h3>
            <Link
              href="/works"
              className="text-white/40 hover:text-yellow text-[10px] uppercase tracking-widest transition-colors"
            >
              View All →
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            {featuredWorks.map((work) => (
              <Link
                key={work.id}
                href={`/works/${work.id}`}
                className="flex items-center gap-3 rounded-lg overflow-hidden bg-black/30 border border-white/10 hover:border-yellow/40 hover:bg-white/5 transition-all duration-300 group"
              >
                {/* Thumbnail */}
                <div className="relative w-14 h-14 flex-shrink-0 overflow-hidden">
                  <Image
                    src={work.image_url}
                    alt={work.title_en ?? work.title_ar}
                    fill
                    sizes="56px"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    unoptimized
                  />
                  {/* Video badge */}
                  {work.video_url && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Film className="w-4 h-4 text-yellow" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-1 pr-2">
                  <p className="text-white text-xs font-semibold line-clamp-1 group-hover:text-yellow transition-colors">
                    {work.title_en ?? work.title_ar}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-yellow/60 text-[10px] uppercase tracking-wider">
                      {work.category}
                    </span>
                    {work.year && (
                      <span className="text-white/30 text-[10px]">
                        · {work.year}
                      </span>
                    )}
                  </div>
                  {/* Client logo if available */}
                  {work.clients?.logo_url && (
                    <div className="flex items-center gap-1 mt-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={work.clients.logo_url}
                        alt={work.clients.name}
                        className="w-3 h-3 object-contain opacity-60"
                      />
                      <span className="text-white/30 text-[9px]">{work.clients.name}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* View All Button */}
          <Link
            href="/works"
            className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-yellow/30 text-yellow text-xs font-bold uppercase tracking-widest hover:bg-yellow hover:text-navy hover:border-yellow hover:shadow-[0_0_20px_rgba(255,238,52,0.3)] transition-all duration-300 group"
          >
            View All Our Works
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      {/* ── 4. Our Clients ──────────────────────────────────────────────── */}
      {clients.length > 0 && (
        <div className="rounded-xl border border-yellow/20 bg-white/5 backdrop-blur-sm p-4">
          <h3 className="text-yellow text-xs font-bold uppercase tracking-widest mb-3">
            Our Clients
          </h3>

          <div className="grid grid-cols-4 gap-2">
            {clients.slice(0, 8).map((client) => (
              client.logo_url ? (
                client.youtube_url ? (
                  <a
                    key={client.id}
                    href={client.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={client.name}
                    className="relative aspect-square rounded-lg bg-white/5 border border-white/10 hover:border-yellow/50 hover:shadow-[0_0_12px_rgba(255,238,52,0.2)] transition-all duration-300 overflow-hidden group flex items-center justify-center"
                  >
                    <Image
                      src={client.logo_url}
                      alt={client.name}
                      fill
                      sizes="60px"
                      className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-110"
                      unoptimized
                    />
                  </a>
                ) : (
                  <div
                    key={client.id}
                    title={client.name}
                    className="relative aspect-square rounded-lg bg-white/5 border border-white/10 hover:border-yellow/30 hover:shadow-[0_0_12px_rgba(255,238,52,0.15)] transition-all duration-300 overflow-hidden group flex items-center justify-center"
                  >
                    <Image
                      src={client.logo_url}
                      alt={client.name}
                      fill
                      sizes="60px"
                      className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-110"
                      unoptimized
                    />
                  </div>
                )
              ) : null
            ))}
          </div>
        </div>
      )}

      {/* ── 5. Client Reviews Marquee ───────────────────────────────────── */}
      {reviews.length > 0 && (
        <div className="rounded-xl border border-yellow/20 bg-white/5 backdrop-blur-sm p-4 overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <Quote className="w-4 h-4 text-yellow flex-shrink-0" />
            <h3 className="text-yellow text-xs font-bold uppercase tracking-widest">
              Client Reviews
            </h3>
          </div>

          {/* Horizontal auto-scroll — duplicated for seamless loop */}
          <div className="relative overflow-hidden">
            {/* Fade edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#0a0a0f] to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#0a0a0f] to-transparent z-10" />

            <div
              className="flex gap-3 w-max"
              style={{
                animation: "reviewsScroll 30s linear infinite",
                willChange: "transform",
              }}
            >
              {[...reviews, ...reviews].map((review, idx) => (
                <div
                  key={`${review.id}-${idx}`}
                  className="flex-shrink-0 w-52 rounded-lg bg-black/30 border border-white/10 p-3 flex flex-col gap-2"
                >
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star
                        key={si}
                        className={`w-3 h-3 ${
                          si < review.rating
                            ? "text-yellow fill-yellow"
                            : "text-white/20"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-white/70 text-[10px] leading-relaxed line-clamp-3">
                    {review.content_ar}
                  </p>

                  {/* Reviewer */}
                  <div className="flex items-center gap-2 mt-auto pt-1 border-t border-white/5">
                    {review.clients?.logo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={review.clients.logo_url}
                        alt={review.clients.name}
                        className="w-4 h-4 object-contain opacity-60 flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-white text-[9px] font-semibold truncate">
                        {review.reviewer_name}
                      </p>
                      {review.reviewer_role && (
                        <p className="text-white/40 text-[8px] truncate">
                          {review.reviewer_role}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
