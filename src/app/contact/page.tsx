"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { User, Mail, Phone, MessageSquare, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-navy flex flex-col items-center">
      <Navbar />

      <div className="w-full relative mt-24 py-16 bg-gradient-to-b from-[#0a1526] to-navy flex items-center justify-center">
        <h1 className="text-4xl md:text-6xl font-bold text-yellow uppercase tracking-widest font-[fantasy]">
          Contact Us
        </h1>
      </div>

      <SectionWrapper className="pt-10 flex-1">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
          
          <div className="flex flex-col gap-8">
            <h2 className="text-2xl text-white font-bold uppercase tracking-widest mb-4">Let&apos;s Create Magic</h2>
            <div className="flex flex-col gap-6 text-white/80">
              <div className="flex items-start gap-4 p-6 bg-navy-light/50 border border-white/5 rounded-lg hover:border-yellow/30 transition-colors">
                <MapPin className="text-yellow shrink-0 mt-1" size={24} />
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-white uppercase tracking-wider text-sm">Headquarters</span>
                  <span>(Pending Studio Address)</span>
                  <span>Cairo, Egypt</span>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-navy-light/50 border border-white/5 rounded-lg hover:border-yellow/30 transition-colors">
                <Phone className="text-yellow shrink-0 mt-1" size={24} />
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-white uppercase tracking-wider text-sm">Direct Line</span>
                  <span>+20 10 0000 0000 (Pending)</span>
                  <span className="text-xs opacity-60">Mon-Fri 9am - 6pm EET</span>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-navy-light/50 border border-white/5 rounded-lg hover:border-yellow/30 transition-colors">
                <Mail className="text-yellow shrink-0 mt-1" size={24} />
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-white uppercase tracking-wider text-sm">Email Us</span>
                  <span>info@btadv.agency</span>
                </div>
              </div>
            </div>
          </div>

          <form className="flex flex-col gap-6 p-8 bg-[#121c2b] border border-white/10 rounded-xl shadow-2xl">
            <h3 className="text-xl text-yellow font-bold uppercase tracking-widest mb-2 border-b border-white/10 pb-4">Send a Transmission</h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-white/60">Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input type="text" placeholder="Jane Doe" className="w-full bg-navy-light/30 border border-white/20 p-4 pl-12 rounded focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors text-white placeholder-white/30" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-white/60">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input type="email" placeholder="jane@brand.com" className="w-full bg-navy-light/30 border border-white/20 p-4 pl-12 rounded focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors text-white placeholder-white/30" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-white/60">Message</label>
              <div className="relative">
                <MessageSquare size={18} className="absolute left-4 top-4 text-white/40" />
                <textarea rows={4} placeholder="Tell us about your next project..." className="w-full bg-navy-light/30 border border-white/20 p-4 pl-12 rounded focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors text-white placeholder-white/30 mt-0" />
              </div>
            </div>

            <button type="button" className="mt-4 bg-yellow text-navy font-bold py-4 rounded uppercase tracking-widest hover:shadow-[0_0_20px_rgba(255,238,52,0.8)] transition-all flex items-center justify-center gap-2 group">
              Transmit <span className="text-xl leading-none group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform">🚀</span>
            </button>
          </form>

        </div>
      </SectionWrapper>
      
      <Footer />
    </main>
  );
}
