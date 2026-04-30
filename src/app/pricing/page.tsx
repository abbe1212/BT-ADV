import Navbar from "@/components/layout/Navbar";
import SectionWrapper from "@/components/ui/SectionWrapper";
import StarField from "@/components/booking/StarField";
import Link from "next/link";
import { Check, Star, Package, ArrowRight } from "lucide-react";
import { getPricing } from "@/lib/supabase/queries";
import type { Pricing } from "@/lib/supabase/types";

export const revalidate = 3600;

export const metadata = {
  title: "Pricing — BT ADV",
  description: "Cinematic production packages including Creative Ads, Music Videos, and Marketing Reels.",
};

function PricingTable({ title, items }: { title: string; items: Pricing[] }) {
  return (
    <div className="group relative w-full rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/[0.08] hover:border-yellow/30 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 flex flex-col items-center">
      
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow/0 to-transparent group-hover:via-yellow/60 transition-all duration-500" />
      
      <div className="w-full bg-black/40 py-8 px-4 text-center border-b border-white/[0.06] relative overflow-hidden">
         {/* Subtle inner glow */}
        <div className="absolute inset-0 bg-yellow/0 group-hover:bg-yellow/[0.03] transition-colors duration-500" />
        <h2 className="relative z-10 text-2xl md:text-3xl text-white group-hover:text-yellow font-bold uppercase tracking-widest font-display transition-colors duration-300 drop-shadow-md">
          {title}
        </h2>
      </div>
      
      <div className="w-full p-6 flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex justify-between items-center p-5 rounded-xl transition-all duration-300
              ${item.is_popular
                ? "bg-yellow/[0.08] border border-yellow/30 shadow-[0_0_20px_rgba(255,238,52,0.1)]"
                : "bg-white/[0.03] border border-white/[0.05]"
              }`}
          >
            <div className="flex items-center gap-4">
              {item.is_popular ? (
                <div className="w-8 h-8 rounded-full bg-yellow/20 flex items-center justify-center shrink-0 border border-yellow/30 shadow-[0_0_10px_rgba(255,238,52,0.3)]">
                  <Star size={14} className="text-yellow fill-yellow" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <Check size={14} className="text-white/40" />
                </div>
              )}
              <span className={`font-semibold tracking-wide ${item.is_popular ? "text-white" : "text-white/80"}`}>
                {item.title_en ?? item.title_ar}
              </span>
            </div>
            <span className="font-bold text-yellow whitespace-nowrap text-xs ml-4 uppercase tracking-widest bg-yellow/10 px-3 py-1.5 rounded-full border border-yellow/20">
              Contact Us
            </span>
          </div>
        ))}
      </div>
      {/* note from DB or default */}
      {items[0]?.price_note && (
        <div className="w-full mt-auto border-t border-white/[0.05] bg-black/20 p-5">
           <p className="text-[11px] uppercase tracking-widest text-white/40 text-center leading-relaxed">
             {items[0].price_note}
           </p>
        </div>
      )}
    </div>
  );
}

export default async function PricingPage() {
  const grouped = await getPricing();
  const hasData = Object.keys(grouped).length > 0;

  return (
    <main id="main-content" className="min-h-screen bg-navy text-white flex flex-col items-center overflow-x-hidden relative">
      <Navbar />

      {/* ── STAR FIELD & BACKGROUNDS ─────────────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarField count={200} />
      </div>
      {/* Radial vignette */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_40%,#00101E_100%)]" />

      {/* Ambient colour blobs */}
      <div className="fixed top-[10%] left-[5%] w-[600px] h-[600px] rounded-full bg-yellow/[0.03] blur-[140px] pointer-events-none" />
      <div className="fixed top-[40%] right-[5%] w-[500px] h-[500px] rounded-full bg-blue-500/[0.03] blur-[160px] pointer-events-none" />


      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative w-full pt-40 pb-16 flex flex-col items-center justify-center z-10 px-4">
        <div className="flex flex-col items-center text-center gap-6 max-w-4xl mx-auto">
          <p className="text-yellow/60 text-xs uppercase tracking-[0.5em] font-semibold">
            Invest in quality
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white uppercase tracking-widest font-display drop-shadow-[0_0_60px_rgba(255,238,52,0.2)]">
            Showtime <span className="text-yellow drop-shadow-[0_0_40px_rgba(255,238,52,0.7)]">Rates</span>
          </h1>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-yellow/50 to-transparent" />
          <p className="text-white/40 text-lg max-w-2xl leading-relaxed mt-2">
            Select the cinematic package that brings your brand into the spotlight. Service showcase for all production scales.
          </p>
        </div>
      </section>

      {/* ── CONTENT ───────────────────────────────────────────────────── */}
      <SectionWrapper className="pt-8 pb-32 z-10">
        {hasData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full max-w-6xl mx-auto">
            {Object.entries(grouped).map(([cat, items]) => (
              <PricingTable key={cat} title={cat} items={items} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 rounded-full bg-yellow/[0.08] border border-yellow/20 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,238,52,0.1)]">
              <Package className="w-10 h-10 text-yellow/60" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 uppercase tracking-widest">Pricing Coming Soon</h2>
            <p className="text-white/40 max-w-md mb-10 leading-relaxed">
              We&apos;re finalizing our production packages. Contact us for a custom quote tailored to your project.
            </p>
            <Link
              href="/contact"
              className="group flex items-center gap-3 bg-yellow text-navy px-8 py-4 rounded-lg font-bold uppercase tracking-widest hover:shadow-[0_0_40px_rgba(255,238,52,0.5)] hover:scale-105 transition-all duration-300"
            >
              Contact Us
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}

        {/* Disclaimer */}
        {hasData && (
          <div className="w-full max-w-4xl mx-auto mt-20 bg-white/[0.02] border border-white/[0.08] p-8 rounded-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-yellow/50" />
            <p className="text-sm md:text-base text-white/60 leading-relaxed pl-4">
              <span className="text-yellow font-bold uppercase tracking-widest block mb-3 text-xs">
                ✦ Important Note
              </span>
              Prices apply within Egypt only. For other Arab countries, pricing differs due to different costumes, dialects, and talent requirements.
            </p>
          </div>
        )}

        {/* CTA */}
        {hasData && (
          <div className="w-full flex justify-center mt-20 relative z-20">
             <Link
              href="/booking"
              className="group flex items-center gap-3 bg-yellow text-navy font-bold uppercase tracking-widest px-10 py-5 rounded-lg shadow-[0_0_30px_rgba(255,238,52,0.25)] hover:shadow-[0_0_60px_rgba(255,238,52,0.55)] hover:scale-105 transition-all duration-300 text-lg"
            >
              Get a Custom Quote
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </SectionWrapper>

      {/* Bottom glow */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[60vw] h-[200px] bg-yellow/[0.02] blur-[100px] pointer-events-none rounded-full z-0" />
    </main>
  );
}
