"use client";

import { useRef } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

const clientLogos = [
  { src: "/our_clients/00.png",        alt: "Client 00" },
  { src: "/our_clients/1.png",         alt: "Client 1" },
  { src: "/our_clients/2.png",         alt: "Client 2" },
  { src: "/our_clients/3.png",         alt: "Client 3" },
  { src: "/our_clients/4.png",         alt: "Client 4" },
  { src: "/our_clients/5.png",         alt: "Client 5" },
  { src: "/our_clients/6.png",         alt: "Client 6" },
  { src: "/our_clients/7.png",         alt: "Client 7" },
  { src: "/our_clients/8.png",         alt: "Client 8" },
  { src: "/our_clients/9.png",         alt: "Client 9" },
  { src: "/our_clients/10.png",        alt: "Client 10" },
  { src: "/our_clients/11.png",        alt: "Client 11" },
  { src: "/our_clients/12.png",        alt: "Client 12" },
  { src: "/our_clients/13.png",        alt: "Client 13" },
  { src: "/our_clients/14.png",        alt: "Client 14" },
  { src: "/our_clients/15.png",        alt: "Client 15" },
  { src: "/our_clients/16.png",        alt: "Client 16" },
  { src: "/our_clients/17.png",        alt: "Client 17" },
  { src: "/our_clients/18.png",        alt: "Client 18" },
  { src: "/our_clients/20.png",        alt: "Client 20" },
  { src: "/our_clients/33.png",        alt: "Client 33" },
  { src: "/our_clients/arabian 1.png", alt: "Arabian Client 1" },
  { src: "/our_clients/arabian 2.png", alt: "Arabian Client 2" },
  { src: "/our_clients/arabian 3.png", alt: "Arabian Client 3" },
];

// Duplicate for seamless infinite loop
const allLogos = [...clientLogos, ...clientLogos];

export default function ClientsMarquee() {
  const { t } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative w-full bg-[#09090f] py-16 overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow/40 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow/40 to-transparent" />

      {/* Section Title */}
      <div className="text-center mb-10 px-4">
        <p className="text-yellow/60 text-xs uppercase tracking-[0.4em] font-semibold mb-2">
          {/* Bilingual label — falls back gracefully if key not in translations */}
          Trusted By
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide uppercase font-[fantasy]">
          Our Clients
        </h2>
        <div className="mx-auto mt-3 w-16 h-0.5 bg-gradient-to-r from-yellow/0 via-yellow to-yellow/0 rounded-full" />
      </div>

      {/* Left / Right fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#09090f] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#09090f] to-transparent z-10" />

      {/* Marquee Track */}
      <div className="overflow-hidden py-3">
        <div
          ref={trackRef}
          className="flex gap-6 w-max animate-marquee"
          style={{ willChange: "transform" }}
        >
          {allLogos.map((logo, index) => (
            <div
              key={index}
              className="
                flex-shrink-0 flex items-center justify-center
                w-40 h-24 md:w-52 md:h-32
                rounded-xl px-4 py-3
                bg-white/[0.05] border border-white/[0.10]
                transition-all duration-400 ease-out
                overflow-hidden
                hover:bg-white/15 hover:border-yellow/50
                hover:shadow-[0_0_30px_rgba(255,238,52,0.25)]
                hover:scale-110
                cursor-pointer
                group
              "
            >
              <div className="relative w-full h-full">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  className="object-contain transition-transform duration-400 group-hover:scale-125"
                  sizes="(max-width: 768px) 160px, 208px"
                  unoptimized
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
