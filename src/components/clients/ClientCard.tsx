"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Building2, Film, ArrowRight } from "lucide-react";
import type { Client } from "@/lib/supabase/types";

interface Props {
  client: Client;
  worksCount: number;
  index?: number;
}

export default function ClientCard({ client, worksCount, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/clients/${client.slug}`} className="group block h-full">
        <div className="relative h-full flex flex-col rounded-2xl overflow-hidden border border-white/[0.07] hover:border-yellow/30 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(255,238,52,0.08)]">

          {/* Top accent line — always invisible, animates to yellow on hover */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow/0 to-transparent group-hover:via-yellow/60 transition-all duration-500" />

          {/* ── LOGO AREA ──────────────────────────────────────── */}
          <div className="relative h-44 flex items-center justify-center p-3 overflow-hidden bg-black/30">
            {/* Subtle inner glow on hover */}
            <div className="absolute inset-0 bg-yellow/0 group-hover:bg-yellow/[0.03] transition-colors duration-500" />

            {client.logo_url ? (
              <div className="relative w-full h-full">
                {/* White backing for dark logos */}
                <div className="absolute inset-[5%] rounded-lg bg-white/[0.06] group-hover:bg-white/[0.10] transition-colors duration-500" />
                <Image
                  src={client.logo_url}
                  alt={client.name}
                  fill
                  className="object-contain p-[2%] transition-all duration-600 group-hover:scale-110 drop-shadow-[0_2px_16px_rgba(255,255,255,0.12)]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  unoptimized
                />
              </div>
            ) : (
              <Building2 className="w-14 h-14 text-white/15 group-hover:text-yellow/30 transition-colors duration-500" />
            )}

            {/* Works count badge — top right */}
            {worksCount > 0 && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-white/10 group-hover:border-yellow/30 px-2.5 py-1 rounded-full transition-colors duration-300">
                <Film className="w-3 h-3 text-yellow/70" />
                <span className="text-[10px] font-bold text-yellow/70 font-mono">{worksCount}</span>
              </div>
            )}
          </div>

          {/* ── INFO AREA ──────────────────────────────────────── */}
          <div className="flex flex-col flex-1 p-5 border-t border-white/[0.06] gap-3">
            <div className="flex-1">
              <h3 className="text-base font-bold text-white group-hover:text-yellow transition-colors duration-300 tracking-wide">
                {client.name}
              </h3>
              {client.industry && (
                <p className="text-xs text-white/30 uppercase tracking-widest mt-1">
                  {client.industry}
                </p>
              )}
            </div>

            {/* Footer CTA */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
              <span className="text-[10px] text-white/25 uppercase tracking-widest group-hover:text-yellow/50 transition-colors duration-300">
                View Work
              </span>
              <div className="w-6 h-6 rounded-full border border-white/10 group-hover:border-yellow/50 group-hover:bg-yellow/10 flex items-center justify-center transition-all duration-300">
                <ArrowRight className="w-3 h-3 text-white/30 group-hover:text-yellow group-hover:translate-x-0.5 transition-all duration-300" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
