import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BTSGallery from "@/components/bts/BTSGallery";
import StarField from "@/components/booking/StarField";
import { getBts } from "@/lib/supabase/queries";
import { Camera, ArrowRight } from "lucide-react";
import Link from "next/link";

export const revalidate = 3600;

export const metadata = {
  title: "Behind The Scenes — BT ADV",
  description: "Exclusive behind-the-scenes photos and videos from BT ADV productions.",
};

export default async function BTSPage() {
  const media = await getBts();

  const photoCount = media.filter((m) => m.media_type === "image").length;
  const videoCount = media.filter((m) => m.media_type === "video").length;

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
      <div className="fixed top-[15%] right-[5%] w-[600px] h-[600px] rounded-full bg-yellow/[0.03] blur-[140px] pointer-events-none" />
      <div className="fixed top-[50%] left-[5%] w-[500px] h-[500px] rounded-full bg-blue-500/[0.03] blur-[160px] pointer-events-none" />


      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative w-full flex flex-col items-center justify-center pt-48 pb-16 overflow-hidden z-10 px-4">
        
        <div className="flex flex-col items-center text-center gap-6 max-w-4xl mx-auto">
           <p className="text-yellow/60 text-xs uppercase tracking-[0.5em] font-semibold">
            Exclusive Access
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white uppercase tracking-widest font-display drop-shadow-[0_0_60px_rgba(255,238,52,0.2)]">
            Behind The{" "}
            <span className="text-yellow drop-shadow-[0_0_40px_rgba(255,238,52,0.7)]">Scenes</span>
          </h1>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-yellow/50 to-transparent" />
          <p className="text-white/40 text-lg max-w-2xl leading-relaxed mt-2">
             Where the magic happens — on-set life, creative process & cinematic moments
          </p>
        </div>

        {/* Stats - only show when data exists */}
        {media.length > 0 && (
          <div className="flex items-center gap-8 md:gap-16 mt-16 border-t border-white/[0.06] pt-8">
            {[
              { label: "Photos", value: String(photoCount) },
              { label: "Videos", value: String(videoCount) },
              { label: "Items", value: `${media.length}+` },
            ].map(({ label, value }, i) => (
              <div key={label} className="flex items-center gap-8 md:gap-16">
                 <div className="text-center">
                   <div className="text-3xl font-bold text-yellow font-display block">{value}</div>
                   <div className="text-white/30 text-xs uppercase tracking-widest mt-1">{label}</div>
                 </div>
                 {i < 2 && <div className="w-px h-8 bg-white/10 hidden sm:block" />}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── GALLERY ───────────────────────────────────────────────────── */}
      <div className="w-full relative z-10">
        {media.length > 0 ? (
          <BTSGallery media={media} />
        ) : (
          <section className="w-full flex-1 flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="w-24 h-24 rounded-full bg-yellow/[0.08] border border-yellow/20 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,238,52,0.1)]">
              <Camera className="w-10 h-10 text-yellow/60" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 uppercase tracking-widest">No Media Yet</h2>
            <p className="text-white/40 max-w-md mb-10 leading-relaxed">
              Behind-the-scenes content is being curated. Check back soon for exclusive on-set footage!
            </p>
            <Link
              href="/works"
              className="group flex items-center gap-3 bg-yellow text-navy px-8 py-4 rounded-lg font-bold uppercase tracking-widest hover:shadow-[0_0_40px_rgba(255,238,52,0.5)] hover:scale-105 transition-all duration-300"
            >
              View Our Works
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </section>
        )}
      </div>

      <Footer />
      
      {/* Bottom glow */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[60vw] h-[200px] bg-yellow/[0.02] blur-[100px] pointer-events-none rounded-full z-0" />
    </main>
  );
}
