"use client";

import { useState } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const clientLogos = [
  { src: "/our_clients/00.png",        alt: "Client" },
  { src: "/our_clients/1.png",         alt: "Client" },
  { src: "/our_clients/2.png",         alt: "Client" },
  { src: "/our_clients/3.png",         alt: "Client" },
  { src: "/our_clients/4.png",         alt: "Client" },
  { src: "/our_clients/5.png",         alt: "Client" },
  { src: "/our_clients/6.png",         alt: "Client" },
  { src: "/our_clients/7.png",         alt: "Client" },
  { src: "/our_clients/8.png",         alt: "Client" },
  { src: "/our_clients/9.png",         alt: "Client" },
  { src: "/our_clients/10.png",        alt: "Client" },
  { src: "/our_clients/11.png",        alt: "Client" },
  { src: "/our_clients/12.png",        alt: "Client" },
  { src: "/our_clients/13.png",        alt: "Client" },
  { src: "/our_clients/14.png",        alt: "Client" },
  { src: "/our_clients/15.png",        alt: "Client" },
  { src: "/our_clients/16.png",        alt: "Client" },
  { src: "/our_clients/17.png",        alt: "Client" },
  { src: "/our_clients/18.png",        alt: "Client" },
  { src: "/our_clients/20.png",        alt: "Client" },
  { src: "/our_clients/33.png",        alt: "Client" },
  { src: "/our_clients/arabian 1.png", alt: "Client" },
  { src: "/our_clients/arabian 2.png", alt: "Client" },
  { src: "/our_clients/arabian 3.png", alt: "Client" },
];

const campaigns = [
  { id: 1, title: "Tasty Spice", category: "TV", imgSrc: "/Ads images/Tasty Spice.png" },
  { id: 2, title: "Qasr El-Mandy", category: "TV", imgSrc: "/Ads images/Qasr El-Mandy.png" },
  { id: 3, title: "Rhythm & Flow", category: "Music Video", imgSrc: "https://www.w3schools.com/w3images/lights.jpg" },
  { id: 4, title: "Fast Forward", category: "Reels", imgSrc: "https://www.w3schools.com/w3images/mountains.jpg" },
  { id: 5, title: "Epic Journey", category: "TV", imgSrc: "https://www.w3schools.com/html/img_girl.jpg" },
  { id: 6, title: "Midnight Snack", category: "Digital", imgSrc: "https://www.w3schools.com/w3images/forest.jpg" },
];

export default function WorksPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const categories = ["All", "TV", "Digital", "Music Video", "Reels"];

  const filteredCampaigns = activeFilter === "All" 
    ? campaigns 
    : campaigns.filter(c => c.category === activeFilter);

  return (
    <main className="min-h-screen bg-navy text-white flex flex-col items-center">
      <Navbar />
      
      {/* Works Hero Video Reel */}
      <section className="relative w-full h-[60vh] mt-24 bg-black flex items-center justify-center overflow-hidden">
        {/* Placeholder video reel */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          src="https://www.w3schools.com/html/mov_bbb.mp4" 
        />
        <div className="relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold text-yellow uppercase tracking-widest font-[fantasy] drop-shadow-lg"
          >
            Showreel
          </motion.h1>
        </div>
      </section>

      <SectionWrapper>
        {/* Filter Bar */}
        <div className="w-full flex flex-wrap justify-center gap-4 mb-12">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-6 py-2 rounded-full border transition-all duration-300 uppercase text-sm tracking-wider font-semibold 
                ${activeFilter === category 
                  ? "bg-yellow text-navy border-yellow shadow-[0_0_15px_rgba(255,238,52,0.6)]" 
                  : "bg-transparent text-white/70 border-white/20 hover:border-yellow hover:text-yellow"
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Campaign Grid */}
        <motion.div 
          layout
          className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredCampaigns.map((campaign) => (
            <Link 
              href={`/works/${campaign.id}`}
              key={campaign.id}
            >
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer"
              >
                <img 
                  src={campaign.imgSrc} 
                  alt={campaign.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 group-hover:brightness-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-yellow text-xs font-bold uppercase tracking-widest mb-1">{campaign.category}</span>
                  <h3 className="text-xl font-bold">{campaign.title}</h3>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </SectionWrapper>

      {/* ── Our Clients Grid ─────────────────────────────────────────────── */}
      <section className="w-full bg-[#09090f] py-20 mt-8">
        {/* Top border glow */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-yellow/40 to-transparent mb-16" />

        {/* Heading */}
        <div className="text-center mb-12 px-4">
          <p className="text-yellow/60 text-xs uppercase tracking-[0.4em] font-semibold mb-2">
            Their trust drives us
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-wide font-[fantasy]">
            Our Clients
          </h2>
          <div className="mx-auto mt-3 w-20 h-0.5 bg-gradient-to-r from-yellow/0 via-yellow to-yellow/0 rounded-full" />
        </div>

        {/* Logo Grid — 6 cols on lg, 4 on md, 3 on sm */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-0">
            {clientLogos.map((logo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: (index % 6) * 0.06 }}
                className="
                  group relative flex items-center justify-center
                  aspect-[4/3] p-5
                  border border-white/[0.08]
                  bg-white/[0.03]
                  overflow-hidden
                  transition-all duration-400 ease-out
                  hover:bg-white/[0.10] hover:border-yellow/40
                  hover:z-10
                  hover:shadow-[inset_0_0_30px_rgba(255,238,52,0.07),0_0_30px_rgba(255,238,52,0.15)]
                  cursor-pointer
                "
              >
                <div className="relative w-full h-full transition-transform duration-400 group-hover:scale-125">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 17vw"
                    unoptimized
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom border glow */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-yellow/40 to-transparent mt-16" />
      </section>
    </main>
  );
}
