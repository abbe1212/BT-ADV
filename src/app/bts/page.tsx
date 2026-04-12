import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BTSGallery from "@/components/bts/BTSGallery";
import { getBts } from "@/lib/supabase/queries";
import { Camera } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Behind The Scenes — BT ADV",
  description: "Exclusive behind-the-scenes photos and videos from BT ADV productions.",
};

export default async function BTSPage() {
  const media = await getBts();

  const photoCount = media.filter((m) => m.media_type === "image").length;
  const videoCount = media.filter((m) => m.media_type === "video").length;

  return (
    <main className="min-h-screen bg-[#080812] flex flex-col items-center overflow-x-hidden">
      <Navbar />

      {/* Hero Header */}
      <section className="relative w-full flex flex-col items-center justify-center pt-40 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,238,52,0.06)_0%,_transparent_70%)] pointer-events-none" />

        <p className="text-yellow/60 text-xs uppercase tracking-[0.5em] font-semibold mb-4">
          Exclusive Access
        </p>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white uppercase tracking-widest font-[fantasy] text-center">
          Behind The{" "}
          <span className="text-yellow drop-shadow-[0_0_30px_rgba(255,238,52,0.6)]">Scenes</span>
        </h1>
        <p className="mt-6 text-white/40 text-sm md:text-base tracking-widest uppercase max-w-xl text-center px-4">
          Where the magic happens — on-set life, creative process & cinematic moments
        </p>
        <div className="mt-10 w-32 h-px bg-gradient-to-r from-transparent via-yellow to-transparent origin-center" />

        {/* Stats - only show when data exists */}
        {media.length > 0 && (
          <div className="flex gap-10 mt-10">
            {[
              { label: "Photos", value: String(photoCount) },
              { label: "Videos", value: String(videoCount) },
              { label: "Items", value: `${media.length}+` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-yellow font-[fantasy]">{value}</div>
                <div className="text-xs uppercase tracking-widest text-white/40 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Gallery or Empty State */}
      {media.length > 0 ? (
        <BTSGallery media={media} />
      ) : (
        <section className="w-full flex-1 flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 rounded-full bg-yellow/10 flex items-center justify-center mb-6">
            <Camera className="w-10 h-10 text-yellow/60" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">No Media Yet</h2>
          <p className="text-white/60 max-w-md text-center mb-8">
            Behind-the-scenes content is being curated. Check back soon for exclusive on-set footage!
          </p>
          <Link
            href="/works"
            className="bg-yellow text-navy px-8 py-3 rounded font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(255,238,52,0.4)] transition-all"
          >
            View Our Works
          </Link>
        </section>
      )}

      <Footer />
    </main>
  );
}
