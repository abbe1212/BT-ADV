import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Film, Building2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import WorksGrid from "@/components/works/WorksGrid";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import { getClients, getClientWithRelations } from "@/lib/supabase/queries";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600;

export async function generateStaticParams() {
  // Use native JS client to bypass cookies() requirement at build time
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.from('clients').select('slug');
  return (data || []).map((client) => ({
    slug: client.slug,
  }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = await getClientWithRelations(slug);
  
  if (!data) return { title: "Client Not Found" };

  return {
    title: `${data.client.name} — BT ADV`,
    description: `Discover our cinematic productions, advertising campaigns, and testimonials for ${data.client.name}.`,
  };
}

export default async function ClientDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await getClientWithRelations(slug);

  if (!data) notFound();

  const { client, works, reviews } = data;
  const categories = works.length 
    ? ["All", ...Array.from(new Set(works.map((w) => w.category)))]
    : ["All"];

  return (
    <main className="min-h-screen bg-navy text-white flex flex-col items-center">
      <Navbar />

      {/* Hero Section (50vh) */}
      <section className="relative w-full h-[50vh] mt-24 bg-black flex flex-col items-center justify-center overflow-hidden">
        {/* Background Visuals */}
        <div className="absolute inset-0 z-0 opacity-30 mix-blend-screen bg-gradient-to-t from-navy via-[#020F1C] to-black" />
        {client.logo_url && (
          <div className="absolute inset-0 z-0 opacity-5 blur-[100px] scale-150">
            <Image src={client.logo_url} alt="bg" fill className="object-cover object-center" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-navy to-transparent z-10" />

        <div className="relative z-20 w-full max-w-5xl mx-auto px-4 flex flex-col items-center pt-8">
          {/* Logo */}
          <div className="w-32 h-32 md:w-40 md:h-40 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex items-center justify-center mb-6 shadow-2xl relative group">
            <div className="absolute inset-0 bg-yellow/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-xl" />
            {client.logo_url ? (
              <div className="relative w-full h-full">
                <Image 
                  src={client.logo_url} 
                  alt={client.name} 
                  fill 
                  className="object-contain filter drop-shadow-xl" 
                  sizes="160px" 
                  unoptimized 
                />
              </div>
            ) : (
              <Building2 className="w-16 h-16 text-white/20" />
            )}
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 text-center">
            {client.name}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm md:text-base">
            {client.industry && (
              <span className="bg-white/10 border border-white/20 px-4 py-1.5 rounded-full uppercase tracking-widest text-white/70">
                {client.industry}
              </span>
            )}
            <span className="bg-yellow/10 border border-yellow/20 text-yellow px-4 py-1.5 rounded-full uppercase tracking-widest font-bold flex items-center gap-2">
              <Film className="w-4 h-4" />
              {works.length} أعمال معاً
            </span>
          </div>
        </div>
      </section>

      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <Link 
          href="/clients"
          className="inline-flex items-center gap-2 text-white/50 hover:text-yellow transition-colors uppercase tracking-widest text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </Link>
      </div>

      {/* Works Section */}
      <section className="w-full max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
           <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-widest font-[fantasy] mb-2 drop-shadow-lg">
             أعمالنا معاً
           </h2>
           <p className="text-yellow tracking-[0.3em] uppercase text-xs md:text-sm">Our Work Together</p>
        </div>

        {works.length > 0 ? (
          <WorksGrid 
            works={works} 
            categories={categories} 
            clients={[client]} 
          />
        ) : (
          <div className="text-center py-20 bg-black/40 rounded-2xl border border-white/5">
             <Film className="w-10 h-10 text-white/10 mx-auto mb-4" />
             <p className="text-white/40 tracking-widest uppercase">No projects displayed yet.</p>
          </div>
        )}
      </section>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <ReviewsSection 
          reviews={reviews} 
          title="ماذا قالوا" 
          subtitle="What They Said" 
          hideClient={true} // Since we are on their page, no need to show their own logo on the review card
        />
      )}

      {/* CTA Strip */}
      <section className="w-full bg-yellow py-16 px-4 mt-20 relative overflow-hidden">
        {/* Subtle patterned background or noise could go here */}
        <div className="w-full max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
           <h2 className="text-3xl md:text-5xl font-bold text-navy uppercase tracking-widest font-[fantasy] mb-6">
             Ready for your next masterpiece?
           </h2>
           <p className="text-navy/70 uppercase tracking-widest font-bold mb-10 arabic-font">
             احجز إعلانك معانا الآن
           </p>
           <Link 
             href="/booking"
             className="bg-navy text-yellow px-10 py-5 rounded-md font-bold uppercase tracking-widest hover:scale-105 hover:shadow-2xl transition-all duration-300 text-lg"
           >
             Book a Consultation
           </Link>
        </div>
      </section>
    </main>
  );
}
