import Navbar from "@/components/layout/Navbar";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Link from "next/link";
import { Check, Star } from "lucide-react";

export default function PricingPage() {
  const creativeAd = [
    { tier: "Standard", price: "100K - 150K EGP" },
    { tier: "Star (Social Media)", price: "200K - 250K EGP", recommended: true },
    { tier: "Mega Star (Social Media)", price: "300K - 400K EGP" },
    { tier: "TV", price: "500K EGP+" },
  ];

  const musicVideo = [
    { tier: "Standard", price: "300K - 400K EGP" },
    { tier: "Premium", price: "500K EGP+" },
  ];

  const marketingReel = [
    { tier: "4 Scripted Reels", price: "40K - 80K EGP" },
    { tier: "4 Scripted Reels + Star (Social Media)", price: "125K - 175K EGP", recommended: true },
  ];

  const packageOffers = [
    { tier: "Creative AD + 4 Reels (Scripted)", price: "125K - 175K EGP" },
    { tier: "Creative AD + Star (Social)", price: "350K - 450K EGP" },
  ];

  const renderTable = (title: string, data: any[]) => (
    <div className="w-full bg-[#121c2b] border border-[#1a2c42] rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col items-center">
      <div className="w-full bg-[#1a2538] py-6 px-4 text-center border-b border-[#2a3b54]">
        <h2 className="text-xl md:text-2xl text-yellow font-bold uppercase tracking-widest">{title}</h2>
      </div>
      <div className="w-full p-4 flex flex-col gap-2">
        {data.map((item, idx) => (
          <div 
            key={idx} 
            className={`flex justify-between items-center p-4 rounded-lg 
              ${item.recommended ? "bg-yellow/10 border border-yellow/30" : "bg-white/5 border border-transparent"}
            `}
          >
            <div className="flex items-center gap-3">
              {item.recommended ? (
                <Star size={16} className="text-yellow shrink-0 fill-yellow" />
              ) : (
                <Check size={16} className="text-white/40 shrink-0" />
              )}
              <span className={`font-semibold text-sm md:text-base ${item.recommended ? "text-yellow" : "text-white"}`}>
                {item.tier}
              </span>
            </div>
            <span className="font-mono text-white/80 whitespace-nowrap text-sm md:text-base ml-4">
              {item.price}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-navy text-white flex flex-col items-center pb-20">
      <Navbar />

      <div className="w-full h-40 bg-navy relative mt-24 flex items-center justify-center">
        <h1 className="text-4xl md:text-6xl font-bold text-yellow font-[fantasy] tracking-widest text-center">
          Showtime Rates
        </h1>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow/50 to-transparent"></div>
      </div>

      <SectionWrapper className="pt-10">
        <p className="text-center text-white/70 max-w-2xl mx-auto mb-16 text-lg">
          Select the cinematic package that brings your brand into the spotlight. Tailored rates for all production scales.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto">
          {renderTable("Creative Ad", creativeAd)}
          {renderTable("Music Video Ad", musicVideo)}
          {renderTable("Marketing Reel Campaign", marketingReel)}
          {renderTable("Packages / Offers", packageOffers)}
        </div>

        {/* Disclaimer Note */}
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

        {/* CTA */}
        <div className="w-full flex justify-center mt-16">
          <Link 
            href="/#book" 
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
