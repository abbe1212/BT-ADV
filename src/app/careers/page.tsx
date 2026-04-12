import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { ArrowRight, Briefcase } from "lucide-react";
import { getCareers } from "@/lib/supabase/queries";

export const metadata = {
  title: "Careers — BT ADV",
  description: "Join the BT ADV crew. Open positions for cinematic visionaries in Egypt.",
};

export default async function CareersPage() {
  const jobs = await getCareers(true);

  return (
    <main className="min-h-screen bg-navy flex flex-col items-center">
      <Navbar />

      <div className="w-full relative mt-24 py-20 bg-navy flex items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow/10 rounded-full blur-[100px] pointer-events-none" />
        <h1 className="relative z-10 text-4xl md:text-6xl font-bold text-yellow uppercase tracking-widest font-[fantasy]">
          Join Our Crew
        </h1>
      </div>

      <SectionWrapper className="pt-10 flex-1 w-full max-w-4xl mx-auto flex flex-col items-center">
        <p className="text-center text-white/70 max-w-2xl text-lg mb-16 uppercase tracking-wider leading-relaxed">
          We&apos;re always looking for cinematic visionaries. Check the open roles below or send an open application.
        </p>

        {jobs.length > 0 ? (
          <div className="flex flex-col gap-6 w-full text-white/90">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="group flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-navy-light/40 border border-white/10 rounded-lg hover:border-yellow/50 transition-colors shadow-lg cursor-pointer"
              >
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold uppercase tracking-widest group-hover:text-yellow transition-colors">
                    {job.title_en ?? job.title_ar}
                  </h3>
                  <div className="flex gap-4 text-xs font-semibold text-white/50 tracking-wider flex-wrap">
                    <span className="uppercase">{job.type}</span>
                    <span className="w-px h-full bg-white/20" />
                    <span className="uppercase">{job.department}</span>
                  </div>
                  {job.description_en && (
                    <p className="text-white/40 text-sm mt-1 max-w-md">{job.description_en}</p>
                  )}
                </div>

                <div className="mt-6 md:mt-0 flex items-center justify-center w-10 h-10 border border-white/20 rounded-full group-hover:border-yellow group-hover:bg-yellow group-hover:text-navy transition-all duration-300">
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State - No open positions */
          <div className="flex flex-col items-center justify-center py-16 text-center w-full">
            <div className="w-20 h-20 rounded-full bg-yellow/10 flex items-center justify-center mb-6">
              <Briefcase className="w-10 h-10 text-yellow/60" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No Open Positions</h2>
            <p className="text-white/60 max-w-md">
              We don&apos;t have any open positions right now, but we&apos;re always looking for talented people.
            </p>
          </div>
        )}

        <div className="mt-20 flex flex-col items-center w-full px-8 py-12 border border-white/10 rounded-xl text-center shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] bg-black/20">
          <h3 className="text-2xl font-bold text-white uppercase tracking-widest mb-4">Don&apos;t see a fit?</h3>
          <p className="text-white/60 mb-8 max-w-md">We&apos;re always exploring new galaxies. Send us your portfolio and let&apos;s see how our orbits align.</p>
          <button className="bg-yellow text-navy px-8 py-3 rounded uppercase font-bold tracking-widest hover:shadow-[0_0_20px_rgba(255,238,52,0.4)] hover:scale-[1.02] transition-all">
            Send Portfolio
          </button>
        </div>
      </SectionWrapper>

      <Footer />
    </main>
  );
}
