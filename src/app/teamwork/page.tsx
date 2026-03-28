"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Image from "next/image";

export default function TeamworkPage() {
  const teamMembers = [
    { title: "Mohamed Hegazy", role: "CEO & Production Manager", image: "/team/team-1.jpeg" },
    { title: "Ahmed Sedawy", role: "CEO - Director - Creative Writer", image: "/team/team-2.jpeg" },
    { title: "Ahmed Ehab", role: "Founder & Creative Writer", image: "/team/team-3.jpeg" },
    { title: "Beshoy Magdy", role: "Founder & Marketing Manager", image: "/team/team-4.jpeg" },
  ];

  return (
    <main className="min-h-screen bg-navy flex flex-col items-center">
      <Navbar />

      <div className="w-full h-[40vh] relative flex items-center justify-center overflow-hidden bg-[#0c131f] border-b border-navy-light mt-24">
        {/* Subtle grid background to match the "space" aesthetic vaguely */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFEE34_1px,transparent_1px)] [background-size:40px_40px]"></div>
        <h1 className="text-4xl md:text-6xl font-bold text-yellow uppercase tracking-widest font-[fantasy] z-10 drop-shadow-[0_0_15px_rgba(255,238,52,0.5)]">
          The Crew
        </h1>
      </div>

      <SectionWrapper className="pt-20 flex-1">
        <p className="text-center text-white/60 mb-20 max-w-2xl mx-auto uppercase tracking-widest text-sm leading-relaxed">
          The brilliant minds that innovate your vision. Bringing together diverse talents to engineer cinematic perfection.
        </p>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 gap-y-20 mb-20 max-w-6xl mx-auto">
          {teamMembers.map((member, i) => (
            <div key={i} className="flex flex-col items-center group cursor-pointer">
              {/* Cinematic portrait frame */}
              <div className="w-full max-w-[240px] aspect-[3/4] bg-navy-light/50 border border-white/10 rounded-sm relative overflow-hidden transition-all duration-300 group-hover:border-yellow/50 group-hover:shadow-[0_0_30px_rgba(255,238,52,0.2)] mb-6">
                
                {/* Image instead of placeholder */}
                <Image 
                  src={member.image} 
                  alt={member.role} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Vintage overlay corners */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-white/70 z-10 pointer-events-none"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-white/70 z-10 pointer-events-none"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-white/70 z-10 pointer-events-none"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-white/70 z-10 pointer-events-none"></div>
                
                {/* Dark gradient at bottom to pop out if needed */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
              </div>

              {/* Text */}
              <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-1 group-hover:text-yellow transition-colors text-center">{member.title}</h3>
              <p className="text-yellow/70 text-sm font-semibold uppercase tracking-widest text-center">{member.role}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>
      
      <Footer />
    </main>
  );
}
