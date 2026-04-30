"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import type { Client } from "@/lib/supabase/types";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  /** Pass logos from the server (DB). If empty, shows empty state. */
  logos?: Client[];
}

export default function ClientsMarquee({ logos = [] }: Props) {
  const { t } = useLanguage();
  
  // If no logos provided, don't render anything
  if (logos.length === 0) {
    return null;
  }

  // Duplicate for seamless loop
  const marqueeItems = [...logos, ...logos];

  return (
    <section className="relative w-full bg-pitch py-8 md:py-16 overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow/40 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow/40 to-transparent" />

      <div className="text-center mb-10 px-4">
        <p className="text-yellow/60 text-xs uppercase tracking-[0.4em] font-semibold mb-2">Trusted By</p>
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide uppercase font-display">Our Clients</h2>
        <div className="mx-auto mt-3 w-16 h-0.5 bg-gradient-to-r from-yellow/0 via-yellow to-yellow/0 rounded-full" />
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-pitch to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-pitch to-transparent z-10" />

      <div className="overflow-hidden py-3">
        <div
          className="flex gap-6 w-max animate-marquee"
          style={{ willChange: "transform" }}
        >
          {marqueeItems.map((logo, index) => {
            const content = (
              <div className="relative w-full h-full">
                {/* White backing layer — gives dark logos contrast on the dark card */}
                <div className="absolute inset-[8%] rounded-lg bg-white/[0.08] group-hover:bg-white/[0.12] transition-colors duration-300" />
                {logo.logo_url && (
                  <Image
                    src={logo.logo_url}
                    alt={logo.name}
                    fill
                    className="object-contain p-[2%] transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]"
                    sizes="(max-width: 768px) 224px, 288px"
                  />
                )}
                {logo.youtube_url && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 rounded-xl border border-yellow/50">
                    <Play className="w-8 h-8 text-yellow fill-yellow mb-2" />
                    <span className="text-sm text-yellow font-bold uppercase tracking-widest block text-center">Watch Ad</span>
                  </div>
                )}
              </div>
            );

            const containerClasses = "flex-shrink-0 flex items-center justify-center w-56 h-36 md:w-72 md:h-48 rounded-xl bg-white/[0.08] border border-white/[0.12] transition-all duration-400 ease-out overflow-hidden hover:bg-white/[0.14] hover:border-yellow/50 hover:shadow-[0_0_30px_rgba(255,238,52,0.3)] hover:scale-105 group block relative shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]";

            return logo.youtube_url ? (
              <a
                key={`${logo.id}-${index}`}
                href={logo.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${containerClasses} cursor-pointer`}
              >
                {content}
              </a>
            ) : (
              <div
                key={`${logo.id}-${index}`}
                className={containerClasses}
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
