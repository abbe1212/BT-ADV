import Navbar from "@/components/layout/Navbar";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { getSiteSettings } from "@/lib/supabase/queries";

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const heroImage = settings.about_hero_image || '/images/about-hero.jpg';

  return (
    <main className="min-h-screen bg-navy text-white flex flex-col items-center pb-20">
      <Navbar />

      <div 
        className="w-full relative mt-24 py-20 bg-cover bg-center"
        style={{ backgroundImage: `url('${heroImage}')` }}
      >
        <div className="absolute inset-0 bg-navy/80 backdrop-blur-sm"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-yellow uppercase tracking-widest font-[fantasy] mb-6 drop-shadow-lg">
            Our Story
          </h1>
          <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto font-light">
            Founded in 2024, BT Advertising Agency bridges the gap between raw imagination and premium cinematic reality.
          </p>
        </div>
      </div>

      <SectionWrapper className="pt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 w-full text-white/80">
          
          <div className="flex flex-col gap-6 items-start">
            <h2 className="text-3xl text-yellow font-bold uppercase tracking-widest mb-2 border-b-2 border-yellow/20 pb-4 w-full">Who We Are</h2>
            <p className="leading-relaxed text-left text-lg">
              We are a team of passionate storytellers, visionaries, and technophiles, dedicated to crafting high-tier visual narratives. From space-age concepts to heart-warming lifestyle ads, we handle everything screen-related.
            </p>
          </div>

          <div className="flex flex-col gap-6 items-start">
            <h2 className="text-3xl text-yellow font-bold uppercase tracking-widest mb-2 border-b-2 border-yellow/20 pb-4 w-full">What We Do</h2>
            <p className="leading-relaxed text-left text-lg">
              Creating compelling TV commercials, high-performing digital campaigns, and immersive music videos. We handle pre-production ideation to post-production magic under one cinematic roof.
            </p>
          </div>

          <div className="flex flex-col gap-6 items-start">
            <h2 className="text-3xl text-yellow font-bold uppercase tracking-widest mb-2 border-b-2 border-yellow/20 pb-4 w-full">Why Choose Us</h2>
            <p className="leading-relaxed text-left text-lg">
              With over 30+ major campaigns executed flawlessly across the Middle East, our process is unyielding when it comes to quality. We don&apos;t just shoot ads; we create experiences that demand to be remembered.
            </p>
          </div>

          <div className="flex flex-col gap-6 items-start">
            <h2 className="text-3xl text-yellow font-bold uppercase tracking-widest mb-2 border-b-2 border-yellow/20 pb-4 w-full">Our Philosophy</h2>
            <p className="leading-relaxed text-left text-lg">
              &quot;We Innovate Your Vision&quot;. We don&apos;t overwrite your message; we elevate it into an epic masterpiece. Every brand has a story, and every story deserves the silver screen treatment.
            </p>
          </div>

        </div>
      </SectionWrapper>
    </main>
  );
}
