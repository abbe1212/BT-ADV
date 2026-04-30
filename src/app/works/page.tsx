import Navbar from "@/components/layout/Navbar";
import WorksGrid from "@/components/works/WorksGrid";
import StarField from "@/components/booking/StarField";
import { getWorks, getClients } from "@/lib/supabase/queries";
import { Film, ArrowRight } from "lucide-react";
import Link from "next/link";

export const revalidate = 3600; // Revalidate every hour; bust via revalidateTag('works')

export const metadata = {
  title: "Works — BT ADV",
  description: "Portfolio of cinematic TV commercials, digital ads, music videos and reel campaigns by BT Advertising Agency.",
};

export default async function WorksPage() {
  const [works, clients] = await Promise.all([getWorks(), getClients()]);
  const categories = works.length
    ? ["All", ...Array.from(new Set(works.map((w) => w.category)))]
    : ["All"];

  return (
    <main id="main-content" className="min-h-screen bg-navy text-white flex flex-col items-center overflow-hidden">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[70vh] mt-24 flex items-center justify-center overflow-hidden">
        {/* Star field behind video */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <StarField count={200} />
        </div>

        {/* Showreel video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          src="/Ads images/BT_Website V04 (NFull).mp4"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-navy/60 z-10" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy to-transparent z-10" />

        {/* Hero text */}
        <div className="relative z-20 text-center px-4 flex flex-col items-center gap-6">
          <p className="text-yellow/60 text-xs uppercase tracking-[0.5em] font-semibold">
            Our Portfolio
          </p>
          <h1 className="text-7xl md:text-9xl font-bold text-white uppercase tracking-widest font-display drop-shadow-[0_0_60px_rgba(255,238,52,0.25)]">
            Show<span className="text-yellow drop-shadow-[0_0_40px_rgba(255,238,52,0.8)]">reel</span>
          </h1>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-yellow/60 to-transparent" />
          <p className="text-white/50 text-lg max-w-xl tracking-wide">
            Cinematic campaigns crafted for brands that demand to be remembered.
          </p>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-40">
          <div className="w-px h-12 bg-gradient-to-b from-yellow/60 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ── WORKS GRID ──────────────────────────────────────────────── */}
      <section className="relative w-full max-w-7xl mx-auto px-4 pt-16 pb-24 z-10">
        {works.length > 0 ? (
          <WorksGrid works={works} categories={categories} clients={clients} />
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="w-24 h-24 rounded-full bg-yellow/[0.08] border border-yellow/20 flex items-center justify-center mb-8">
              <Film className="w-10 h-10 text-yellow/50" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 uppercase tracking-widest">No Works Yet</h2>
            <p className="text-white/40 max-w-md mb-10 leading-relaxed">
              Our portfolio is being updated. Check back soon for our latest cinematic productions.
            </p>
            <Link
              href="/booking"
              className="group flex items-center gap-3 bg-yellow text-navy px-8 py-4 rounded-lg font-bold uppercase tracking-widest hover:shadow-[0_0_40px_rgba(255,238,52,0.5)] hover:scale-105 transition-all duration-300"
            >
              Book a Consultation
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </section>

      {/* Ambient glow */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[300px] bg-yellow/[0.025] blur-[120px] pointer-events-none rounded-full" />
    </main>
  );
}
