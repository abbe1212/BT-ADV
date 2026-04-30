"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import SectionWrapper from "@/components/ui/SectionWrapper";
import StarField from "@/components/booking/StarField";
import { Film, Lightbulb, Users, Sparkles, ArrowRight } from "lucide-react";

interface Props {
  heroImage: string;
}

const contentBlocks = [
  {
    icon: <Users className="w-6 h-6" />,
    title: "Who We Are",
    text: "We are a team of passionate storytellers, visionaries, and technophiles, dedicated to crafting high-tier visual narratives. From space-age concepts to heart-warming lifestyle ads, we handle everything screen-related."
  },
  {
    icon: <Film className="w-6 h-6" />,
    title: "What We Do",
    text: "Creating compelling TV commercials, high-performing digital campaigns, and immersive music videos. We handle pre-production ideation to post-production magic under one cinematic roof."
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Why Choose Us",
    text: "With over 30+ major campaigns executed flawlessly across the Middle East, our process is unyielding when it comes to quality. We don't just shoot ads; we create experiences that demand to be remembered."
  },
  {
    icon: <Lightbulb className="w-6 h-6" />,
    title: "Our Philosophy",
    text: "\"We Innovate Your Vision\". We don't overwrite your message; we elevate it into an epic masterpiece. Every brand has a story, and every story deserves the silver screen treatment."
  }
];

const stats = [
  { value: "30+", label: "Major Campaigns" },
  { value: "2024", label: "Founded" },
  { value: "100%", label: "Client Satisfaction" },
  { value: "MENA", label: "Our Region" },
];

export default function AboutPageClient({ heroImage }: Props) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <main id="main-content" className="min-h-screen bg-navy text-white flex flex-col items-center pb-0 relative overflow-hidden">

      {/* ── Full-page star field — bright and clear ──────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarField count={280} />
      </div>

      {/* Subtle radial vignette so text stays readable */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_40%,#00101E_100%)]" />

      {/* Ambient colour blobs */}
      <div className="fixed top-[10%] left-[5%] w-[600px] h-[600px] rounded-full bg-yellow/[0.04] blur-[140px] pointer-events-none" />
      <div className="fixed top-[40%] right-[5%] w-[500px] h-[500px] rounded-full bg-blue-500/[0.04] blur-[160px] pointer-events-none" />
      <div className="fixed bottom-[10%] left-[30%] w-[700px] h-[400px] rounded-full bg-yellow/[0.03] blur-[120px] pointer-events-none" />

      {/* Floating Moon */}
      <motion.div
        className="fixed top-32 right-8 md:right-28 z-10 w-20 h-20 md:w-36 md:h-36 opacity-50 pointer-events-none"
        animate={prefersReducedMotion ? {} : { y: [-12, 12, -12], rotate: [0, 6, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image src="/moon.png" alt="Moon" fill className="object-contain" />
      </motion.div>

      <Navbar />

      {/* ── HERO SECTION ─────────────────────────────────────────────── */}
      <div
        className="w-full relative mt-24 py-36 md:py-48 bg-cover bg-center z-10"
        style={{ backgroundImage: `url('${heroImage}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/60 to-navy" />
        {/* Yellow glow behind title */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-48 bg-yellow/[0.06] blur-[80px] pointer-events-none" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-yellow/70 text-xs uppercase tracking-[0.4em] font-semibold mb-6"
          >
            BT Advertising Agency · Est. 2024
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold text-white uppercase tracking-widest font-display mb-8 drop-shadow-[0_0_50px_rgba(255,238,52,0.35)]"
          >
            Our{" "}
            <span className="text-yellow drop-shadow-[0_0_30px_rgba(255,238,52,0.8)]">
              Story
            </span>
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="w-24 h-0.5 bg-gradient-to-r from-yellow/0 via-yellow to-yellow/0 mx-auto mb-8"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl text-white/70 leading-relaxed max-w-3xl mx-auto font-light"
          >
            Founded in 2024, BT Advertising Agency bridges the gap between raw imagination and premium cinematic reality.
          </motion.p>
        </div>
      </div>

      {/* ── STATS STRIP ──────────────────────────────────────────────── */}
      <div className="w-full z-10 relative border-y border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center text-center gap-1"
            >
              <span className="text-4xl md:text-5xl font-bold text-yellow font-display drop-shadow-[0_0_20px_rgba(255,238,52,0.5)]">
                {stat.value}
              </span>
              <span className="text-white/40 text-xs uppercase tracking-widest">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── CONTENT SECTIONS ─────────────────────────────────────────── */}
      <SectionWrapper className="pt-24 pb-0 z-10 relative">
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-24">

          {/* Row 1: Who We Are + Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
              className="group relative bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] hover:border-yellow/30 rounded-2xl p-8 md:p-10 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_20px_60px_rgba(0,0,0,0.6)] hover:shadow-[0_0_40px_rgba(255,238,52,0.08)] transition-all duration-600"
            >
              {/* Yellow accent top-left corner line */}
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-yellow/40 to-transparent" />
              <div className="flex items-center gap-3 mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-yellow/10 text-yellow border border-yellow/20">
                  {contentBlocks[0].icon}
                </span>
                <h2 className="text-2xl md:text-3xl text-white font-bold uppercase tracking-widest">
                  {contentBlocks[0].title}
                </h2>
              </div>
              <div className="w-12 h-0.5 bg-yellow/40 mb-6 rounded-full" />
              <p className="leading-relaxed text-white/60 text-base md:text-lg">
                {contentBlocks[0].text}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative w-full aspect-video rounded-2xl overflow-hidden group shadow-[0_20px_60px_rgba(0,0,0,0.7)] border border-white/[0.07]"
            >
              <Image src="/img.png" alt="Who We Are — BT ADV team" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-yellow/40 transition-colors duration-500 rounded-2xl" />
              {/* Label */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-1.5">
                <p className="text-white/70 text-xs uppercase tracking-widest">Behind the Lens</p>
              </div>
            </motion.div>
          </div>

          {/* Row 2: Image + What We Do */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative w-full aspect-video rounded-2xl overflow-hidden group shadow-[0_20px_60px_rgba(0,0,0,0.7)] border border-white/[0.07] order-2 md:order-1"
            >
              <Image src="/img.png" alt="What We Do — BT ADV production" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-yellow/40 transition-colors duration-500 rounded-2xl" />
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-1.5">
                <p className="text-white/70 text-xs uppercase tracking-widest">On Production</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
              className="group relative bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] hover:border-yellow/30 rounded-2xl p-8 md:p-10 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_20px_60px_rgba(0,0,0,0.6)] hover:shadow-[0_0_40px_rgba(255,238,52,0.08)] transition-all duration-600 order-1 md:order-2"
            >
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-yellow/40 to-transparent" />
              <div className="flex items-center gap-3 mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-yellow/10 text-yellow border border-yellow/20">
                  {contentBlocks[1].icon}
                </span>
                <h2 className="text-2xl md:text-3xl text-white font-bold uppercase tracking-widest">
                  {contentBlocks[1].title}
                </h2>
              </div>
              <div className="w-12 h-0.5 bg-yellow/40 mb-6 rounded-full" />
              <p className="leading-relaxed text-white/60 text-base md:text-lg">
                {contentBlocks[1].text}
              </p>
            </motion.div>
          </div>

          {/* Row 3: Why Choose Us + Our Philosophy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch">
            {[contentBlocks[2], contentBlocks[3]].map((block, i) => (
              <motion.div
                key={block.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className="group relative bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] hover:border-yellow/30 rounded-2xl p-8 md:p-10 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_20px_60px_rgba(0,0,0,0.6)] hover:shadow-[0_0_40px_rgba(255,238,52,0.08)] transition-all duration-600"
              >
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-yellow/40 to-transparent" />
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-yellow/10 text-yellow border border-yellow/20">
                    {block.icon}
                  </span>
                  <h2 className="text-2xl md:text-3xl text-white font-bold uppercase tracking-widest">
                    {block.title}
                  </h2>
                </div>
                <div className="w-12 h-0.5 bg-yellow/40 mb-6 rounded-full" />
                <p className="leading-relaxed text-white/60 text-base md:text-lg">
                  {block.text}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </SectionWrapper>

      {/* ── CTA STRIP ────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full mt-32 z-10 relative py-24 px-4 overflow-hidden border-t border-white/[0.06]"
      >
        {/* glow */}
        <div className="absolute inset-0 bg-yellow/[0.03] pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow/30 to-transparent" />

        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-8">
          <p className="text-yellow/60 text-xs uppercase tracking-[0.4em] font-semibold">Ready to create?</p>
          <h2 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-widest font-display drop-shadow-[0_0_30px_rgba(255,238,52,0.2)]">
            Let&apos;s Make{" "}
            <span className="text-yellow">History</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Book a consultation and let us transform your vision into a cinematic masterpiece.
          </p>
          <Link
            href="/booking"
            className="group flex items-center gap-3 bg-yellow text-navy font-bold uppercase tracking-widest px-10 py-4 rounded-lg shadow-[0_0_30px_rgba(255,238,52,0.3)] hover:shadow-[0_0_60px_rgba(255,238,52,0.6)] hover:scale-105 transition-all duration-300 text-base"
          >
            Book Your Cinematic Ad
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.section>
    </main>
  );
}
