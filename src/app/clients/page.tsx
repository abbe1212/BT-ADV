import Navbar from "@/components/layout/Navbar";
import ClientCard from "@/components/clients/ClientCard";
import StarField from "@/components/booking/StarField";
import { getClients, getWorks } from "@/lib/supabase/queries";
import { Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export const revalidate = 3600;

export const metadata = {
  title: "Our Clients — BT ADV",
  description: "Explore the brands and organizations that trust BT Advertising Agency for their cinematic productions.",
};

export default async function ClientsIndexPage() {
  const [clients, works] = await Promise.all([getClients(), getWorks()]);

  const worksCountMap = works.reduce((acc, work) => {
    if (work.client_id) {
      acc[work.client_id] = (acc[work.client_id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <main id="main-content" className="min-h-screen bg-navy text-white flex flex-col items-center overflow-hidden">
      <Navbar />

      {/* ── STAR FIELD ────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarField count={240} />
      </div>
      {/* Radial vignette */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_40%,#00101E_100%)]" />

      {/* Ambient blobs */}
      <div className="fixed top-[15%] left-0 w-[500px] h-[500px] rounded-full bg-yellow/[0.035] blur-[140px] pointer-events-none -translate-x-1/3" />
      <div className="fixed top-[50%] right-0 w-[400px] h-[400px] rounded-full bg-blue-500/[0.03] blur-[160px] pointer-events-none translate-x-1/3" />

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative w-full pt-40 pb-24 flex flex-col items-center justify-center z-10 px-4">
        <div className="flex flex-col items-center text-center gap-6 max-w-4xl mx-auto">
          {/* Icon badge */}
          <div className="w-16 h-16 rounded-2xl bg-yellow/[0.08] border border-yellow/20 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(255,238,52,0.1)]">
            <Users className="w-7 h-7 text-yellow/70" />
          </div>

          <p className="text-yellow/60 text-xs uppercase tracking-[0.5em] font-semibold">
            Trusted By
          </p>

          <h1 className="text-6xl md:text-8xl font-bold text-white uppercase tracking-widest font-display drop-shadow-[0_0_60px_rgba(255,238,52,0.2)]">
            Our{" "}
            <span className="text-yellow drop-shadow-[0_0_40px_rgba(255,238,52,0.7)]">
              Clients
            </span>
          </h1>

          <div className="w-20 h-px bg-gradient-to-r from-transparent via-yellow/50 to-transparent" />

          <p className="text-white/40 text-lg max-w-xl leading-relaxed">
            The brands that trusted us with their story — and received a cinematic masterpiece in return.
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-8 md:gap-16 mt-4 border-t border-white/[0.06] pt-6">
            <div className="text-center">
              <span className="block text-3xl font-bold text-yellow font-display">{clients.length}+</span>
              <span className="text-white/30 text-xs uppercase tracking-widest">Brands</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <span className="block text-3xl font-bold text-yellow font-display">{works.length}+</span>
              <span className="text-white/30 text-xs uppercase tracking-widest">Productions</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <span className="block text-3xl font-bold text-yellow font-display">MENA</span>
              <span className="text-white/30 text-xs uppercase tracking-widest">Region</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CLIENTS GRID ─────────────────────────────────────────── */}
      <section className="relative w-full max-w-7xl mx-auto px-4 pb-32 z-10">
        {clients.length === 0 ? (
          <div className="text-center py-40">
            <p className="text-white/20 tracking-widest uppercase text-sm">No clients to display yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {clients.map((client, i) => (
              <ClientCard
                key={client.id}
                client={client}
                worksCount={worksCountMap[client.id] || 0}
                index={i}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="relative w-full z-10 border-t border-white/[0.06] py-24 px-4">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow/20 to-transparent" />
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
          <p className="text-yellow/50 text-xs uppercase tracking-[0.4em] font-semibold">Join them</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-widest font-display">
            Ready to Create <span className="text-yellow">Together?</span>
          </h2>
          <Link
            href="/booking"
            className="group flex items-center gap-3 bg-yellow text-navy font-bold uppercase tracking-widest px-10 py-4 rounded-lg shadow-[0_0_30px_rgba(255,238,52,0.25)] hover:shadow-[0_0_60px_rgba(255,238,52,0.55)] hover:scale-105 transition-all duration-300"
          >
            Book Your Cinematic Ad
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Bottom glow */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[60vw] h-[200px] bg-yellow/[0.02] blur-[100px] pointer-events-none rounded-full" />
    </main>
  );
}
