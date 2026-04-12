import Navbar from "@/components/layout/Navbar";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Link from "next/link";
import { Check, Star, Package } from "lucide-react";
import { getPricing } from "@/lib/supabase/queries";
import type { Pricing } from "@/lib/supabase/types";

export const metadata = {
  title: "Pricing — BT ADV",
  description: "Cinematic production packages including Creative Ads, Music Videos, and Marketing Reels.",
};



function PricingTable({ title, items }: { title: string; items: Pricing[] }) {
  return (
    <div className="w-full bg-[#121c2b] border border-[#1a2c42] rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col items-center">
      <div className="w-full bg-[#1a2538] py-6 px-4 text-center border-b border-[#2a3b54]">
        <h2 className="text-xl md:text-2xl text-yellow font-bold uppercase tracking-widest">{title}</h2>
      </div>
      <div className="w-full p-4 flex flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex justify-between items-center p-4 rounded-lg
              ${item.is_popular
                ? "bg-yellow/10 border border-yellow/30"
                : "bg-white/5 border border-transparent"
              }`}
          >
            <div className="flex items-center gap-3">
              {item.is_popular ? (
                <Star size={16} className="text-yellow shrink-0 fill-yellow" />
              ) : (
                <Check size={16} className="text-white/40 shrink-0" />
              )}
              <span className={`font-semibold text-sm md:text-base ${item.is_popular ? "text-yellow" : "text-white"}`}>
                {item.title_en ?? item.title_ar}
              </span>
            </div>
            <span className="font-bold text-yellow whitespace-nowrap text-xs md:text-sm ml-4 uppercase tracking-widest text-right">
              <span className="block sm:inline">Contact Us</span>
              <span className="hidden sm:inline"> / </span>
              <span className="block sm:inline" dir="rtl">تواصل معانا</span>
            </span>
          </div>
        ))}
      </div>
      {/* note from DB or default */}
      {items[0]?.price_note && (
        <p className="text-xs text-white/40 px-6 pb-4 text-center">{items[0].price_note}</p>
      )}
    </div>
  );
}

export default async function PricingPage() {
  const grouped = await getPricing();
  const hasData = Object.keys(grouped).length > 0;

  return (
    <main className="min-h-screen bg-navy text-white flex flex-col items-center pb-20">
      <Navbar />

      <div className="w-full h-40 bg-navy relative mt-24 flex items-center justify-center">
        <h1 className="text-4xl md:text-6xl font-bold text-yellow font-[fantasy] tracking-widest text-center">
          Showtime Rates
        </h1>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow/50 to-transparent" />
      </div>

      <SectionWrapper className="pt-10">
        <p className="text-center text-white/70 max-w-2xl mx-auto mb-16 text-lg">
          Select the cinematic package that brings your brand into the spotlight.
          Service showcase for all production scales.
        </p>

        {hasData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto">
            {Object.entries(grouped).map(([cat, items]) => (
              <PricingTable key={cat} title={cat} items={items} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-yellow/10 flex items-center justify-center mb-6">
              <Package className="w-10 h-10 text-yellow/60" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Pricing Coming Soon</h2>
            <p className="text-white/60 max-w-md mb-8">
              We&apos;re finalizing our production packages. Contact us for a custom quote tailored to your project.
            </p>
            <Link
              href="/contact"
              className="bg-yellow text-navy px-8 py-3 rounded font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(255,238,52,0.4)] transition-all"
            >
              Contact Us
            </Link>
          </div>
        )}

        {/* Disclaimer - only show when data exists */}
        {hasData && (
          <div className="w-full max-w-5xl mx-auto mt-12 bg-black/40 border-l-4 border-yellow p-6 rounded-r-lg">
            <p className="text-sm md:text-base text-white/80 leading-relaxed">
              <span className="text-yellow font-bold uppercase tracking-wider block mb-2">Note:</span>
              Prices apply within Egypt only. For other Arab countries, pricing differs due to different costumes, dialects, and talent requirements.
              <br />
              <span className="text-white/50 block mt-2 text-xs" dir="rtl">
                ملحوظة: الأسعار داخل جمهورية مصر العربية فقط...
              </span>
            </p>
          </div>
        )}

        <div className="w-full flex justify-center mt-16">
          <Link
            href="/booking"
            className="group relative px-8 py-4 bg-yellow text-navy font-bold uppercase tracking-widest rounded transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,238,52,0.3)] hover:shadow-[0_0_40px_rgba(255,238,52,0.6)] flex items-center gap-3"
          >
            Get a Custom Quote
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </SectionWrapper>
    </main>
  );
}
