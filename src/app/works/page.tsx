import SectionWrapper from "@/components/ui/SectionWrapper";
import Navbar from "@/components/layout/Navbar";
import WorksGrid from "@/components/works/WorksGrid";
import { getWorks, getClients } from "@/lib/supabase/queries";
import { Film } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

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
    <main className="min-h-screen bg-navy text-white flex flex-col items-center">
      <Navbar />

      {/* Works Hero Video Reel */}
      <section className="relative w-full h-[60vh] mt-24 bg-black flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          src="/Ads images/BT_Website V04 (NFull).mp4"
        />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-yellow uppercase tracking-widest font-[fantasy] drop-shadow-lg">
            Showreel
          </h1>
        </div>
      </section>

      <SectionWrapper>
        {works.length > 0 ? (
          <WorksGrid works={works} categories={categories} clients={clients} />
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-yellow/10 flex items-center justify-center mb-6">
              <Film className="w-10 h-10 text-yellow/60" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No Works Yet</h2>
            <p className="text-white/60 max-w-md mb-8">
              Our portfolio is being updated. Check back soon for our latest cinematic productions.
            </p>
            <Link
              href="/booking"
              className="bg-yellow text-navy px-8 py-3 rounded font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(255,238,52,0.4)] transition-all"
            >
              Book a Consultation
            </Link>
          </div>
        )}
      </SectionWrapper>
    </main>
  );
}
