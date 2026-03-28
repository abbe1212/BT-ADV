"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { ArrowLeft, Play, ArrowRight, X } from "lucide-react";

// Mock data matching works list
const campaignsData = {
  1: { title: "Tasty Spice", category: "TV", client: "Tasty Spice", director: "Ahmed Sedawy", year: "2025", videoSrc: "https://youtu.be/zcqMX6JxGq4?si=4Q14GcsWi6nng0_e", nextId: 2, description: "A fiery and energetic TV commercial for Tasty Spice that captures the rich flavors and vibrant colors of their new spice lineup. Every frame highlights the warmth and intensity that Tasty Spice brings to the kitchen." },
  2: { title: "Qasr El-Mandy", category: "TV", client: "Qasr El-Mandy", director: "Ahmed Sedawy", year: "2025", videoSrc: "https://youtu.be/4e_hCk0YgIc?si=hQzCg_IlG0MOo-TC", nextId: 3, description: "Showcasing the authentic atmosphere and deeply rooted culinary traditions of Qasr El-Mandy. The campaign emphasizes authentic Arab hospitality and the mouth-watering visual appeal of traditional slow-cooked meals." },
  3: { title: "Rhythm & Flow", category: "Music Video", client: "Sony Music", director: "Director X", year: "2026", videoSrc: "https://www.w3schools.com/html/mov_bbb.mp4", nextId: 4, description: "A visually striking music video combining dynamic choreography, fast-paced editing, and bold lighting schemes to perfectly match the artist's high-energy track." },
  4: { title: "Fast Forward", category: "Reels", client: "Nike", director: "Alex Johnson", year: "2025", videoSrc: "https://www.w3schools.com/html/mov_bbb.mp4", nextId: 5, description: "A fast-paced digital reel campaign designed to inspire movement and athletic determination, utilizing intense angles and rapid transitions tailored specifically for social media engagement." },
  5: { title: "Epic Journey", category: "TV", client: "National Geographic", director: "Sarah Lee", year: "2024", videoSrc: "https://www.w3schools.com/html/mov_bbb.mp4", nextId: 6, description: "An awe-inspiring cinematic journey traversing some of the world's most remote landscapes. The project utilized cutting-edge drone cinematography to capture humanity's profound connection with nature." },
  6: { title: "Midnight Snack", category: "Digital", client: "McDonald's", director: "Mike Brown", year: "2025", videoSrc: "https://www.w3schools.com/html/mov_bbb.mp4", nextId: 1, description: "A playful, modern digital campaign targeting late-night cravings. The visuals emphasize rich, warm tones and mouth-watering slow-motion food styling that pops off the screen." },
};

export default function WorkDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  
  // Cast id to number or fallback to 1
  const campaign = campaignsData[Number(id) as keyof typeof campaignsData] || campaignsData[1];

  const isYouTube = campaign.videoSrc.includes("youtube") || campaign.videoSrc.includes("youtu.be");
  let youtubeId = "";
  if (isYouTube) {
    if (campaign.videoSrc.includes("youtu.be")) {
      youtubeId = campaign.videoSrc.split("youtu.be/")[1]?.split("?")[0];
    } else {
      try {
        youtubeId = new URL(campaign.videoSrc).searchParams.get("v") || "";
      } catch (e) {}
    }
  }

  const embedUrl = isYouTube 
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&modestbranding=1&playsinline=1`
    : campaign.videoSrc;

  const playUrl = isYouTube 
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&rel=0&controls=1`
    : campaign.videoSrc;

  return (
    <main className="min-h-screen bg-navy text-white flex flex-col">
      <Navbar />
      
      {/* Full-screen Video Hero */}
      <section className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
        {isYouTube ? (
          <iframe 
            src={embedUrl}
            className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 opacity-60 pointer-events-none"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
            src={embedUrl}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-transparent to-navy/90 pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-7xl px-6 md:px-12 flex flex-col items-center text-center mt-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <span className="text-yellow text-sm font-bold uppercase tracking-[0.3em] px-4 py-1 border border-yellow/30 rounded-full bg-navy/50 backdrop-blur-sm">
              {campaign.category}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-widest font-[fantasy] text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            {campaign.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 flex items-center justify-center"
          >
            <button 
              onClick={() => setIsVideoOpen(true)}
              className="flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-yellow/50 hover:border-yellow text-yellow hover:bg-yellow hover:text-navy hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(255,238,52,0.2)] hover:shadow-[0_0_50px_rgba(255,238,52,0.6)] group"
            >
              <Play fill="currentColor" size={32} className="ml-2 group-hover:scale-110 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* Floating Back Link */}
        <Link 
          href="/works" 
          className="absolute top-28 left-6 md:left-12 flex items-center gap-2 text-white/50 hover:text-yellow transition-colors font-semibold uppercase tracking-widest text-sm z-20 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Works
        </Link>
      </section>

      {/* Details Section */}
      <SectionWrapper className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 md:gap-24">
          
          {/* Credits Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-1/3 flex flex-col gap-8"
          >
            <div className="flex flex-col gap-1">
              <span className="text-white/40 uppercase tracking-widest text-xs font-bold">Client</span>
              <span className="text-xl font-medium tracking-wide">{campaign.client}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-white/40 uppercase tracking-widest text-xs font-bold">Director</span>
              <span className="text-xl font-medium tracking-wide">{campaign.director}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-white/40 uppercase tracking-widest text-xs font-bold">Year</span>
              <span className="text-xl font-medium tracking-wide">{campaign.year}</span>
            </div>
          </motion.div>

          {/* About Text */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-2/3 flex flex-col gap-6 text-white/70 leading-relaxed text-lg"
          >
            <p>
              {campaign.description}
            </p>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* Image Gallery Mockup */}
      <SectionWrapper className="py-10">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="aspect-video bg-navy-light rounded-sm overflow-hidden group">
            <img src="https://www.w3schools.com/w3images/mountains.jpg" alt="BTS" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="aspect-video bg-navy-light rounded-sm overflow-hidden group">
            <img src="https://www.w3schools.com/w3images/forest.jpg" alt="BTS" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
        </div>
      </SectionWrapper>

      {/* Next Project Nav */}
      <div className="w-full border-t border-white/5 bg-navy-light/20 hover:bg-navy-light/40 transition-colors">
        <Link 
          href={`/works/${campaign.nextId}`}
          className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 flex flex-col md:flex-row justify-between items-center group cursor-pointer"
        >
          <div className="flex flex-col text-center md:text-left mb-6 md:mb-0">
            <span className="text-yellow text-sm font-bold uppercase tracking-[0.3em] mb-2">Next Project</span>
            <span className="text-3xl md:text-5xl font-bold uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
              {campaignsData[campaign.nextId as keyof typeof campaignsData]?.title || "Explore More"}
            </span>
          </div>
          
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-yellow group-hover:border-yellow group-hover:text-navy transition-all duration-500">
            <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform duration-500" />
          </div>
        </Link>
      </div>
      {/* Video Overlay Modal */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-12"
          >
            <button 
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-6 right-6 md:top-10 md:right-10 text-white/50 hover:text-white transition-colors p-2 z-10"
            >
              <X size={32} />
            </button>
            
            <div className="w-full max-w-6xl aspect-video bg-black rounded-lg overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] relative">
              {isYouTube ? (
                <iframe 
                  src={playUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video 
                  src={playUrl} 
                  autoPlay 
                  controls 
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Footer />
    </main>
  );
}
