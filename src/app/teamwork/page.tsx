import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Image from "next/image";
import { getTeam } from "@/lib/supabase/queries";
import { Users } from "lucide-react";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "The Crew — BT ADV",
  description: "Meet the brilliant minds behind BT Advertising Agency's cinematic productions.",
};

export default async function TeamworkPage() {
  const members = await getTeam();

  return (
    <main className="min-h-screen bg-navy flex flex-col items-center">
      <Navbar />

      <div className="w-full h-[40vh] relative flex items-center justify-center overflow-hidden bg-[#0c131f] border-b border-navy-light mt-24">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFEE34_1px,transparent_1px)] [background-size:40px_40px]" />
        <h1 className="text-4xl md:text-6xl font-bold text-yellow uppercase tracking-widest font-[fantasy] z-10 drop-shadow-[0_0_15px_rgba(255,238,52,0.5)]">
          The Crew
        </h1>
      </div>

      <SectionWrapper className="pt-20 flex-1">
        <p className="text-center text-white/60 mb-20 max-w-2xl mx-auto uppercase tracking-widest text-sm leading-relaxed">
          The brilliant minds that innovate your vision. Bringing together diverse talents to engineer cinematic perfection.
        </p>

        {members.length > 0 ? (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 gap-y-20 mb-20 max-w-6xl mx-auto">
            {members.map((member) => (
              <div key={member.id} className="flex flex-col items-center group cursor-pointer">
                <div className="w-full max-w-[240px] aspect-[3/4] bg-navy-light/50 border border-white/10 rounded-sm relative overflow-hidden transition-all duration-300 group-hover:border-yellow/50 group-hover:shadow-[0_0_30px_rgba(255,238,52,0.2)] mb-6">
                  {member.image_url ? (
                    <Image
                      src={member.image_url}
                      alt={member.name_en ?? member.name_ar}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-navy-light/30">
                      <span className="text-white/20 text-4xl font-bold">
                        {(member.name_en ?? member.name_ar).charAt(0)}
                      </span>
                    </div>
                  )}
                  {/* Vintage corner overlays */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-white/70 z-10 pointer-events-none" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-white/70 z-10 pointer-events-none" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-white/70 z-10 pointer-events-none" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-white/70 z-10 pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>

                <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-1 group-hover:text-yellow transition-colors text-center">
                  {member.name_en ?? member.name_ar}
                </h3>
                <p className="text-yellow/70 text-sm font-semibold uppercase tracking-widest text-center">
                  {member.role_en ?? member.role_ar}
                </p>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center mb-20">
            <div className="w-20 h-20 rounded-full bg-yellow/10 flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-yellow/60" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Team Coming Soon</h2>
            <p className="text-white/60 max-w-md">
              We&apos;re gathering information about our amazing team members. Check back soon!
            </p>
          </div>
        )}
      </SectionWrapper>

      <Footer />
    </main>
  );
}
