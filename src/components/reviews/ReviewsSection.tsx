"use client";

import ReviewCard from "@/components/reviews/ReviewCard";
import type { Review } from "@/lib/supabase/types";
import { motion, useReducedMotion } from "framer-motion";

interface Props {
  reviews: Review[];
  title?: string;
  subtitle?: string;
  hideClient?: boolean;
}

export default function ReviewsSection({ 
  reviews, 
  title = "What They Said", 
  subtitle = "Testimonials from our partners",
  hideClient = false
}: Props) {
  const prefersReducedMotion = useReducedMotion();

  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="w-full py-10 md:py-20 px-4">
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Section Header */}
        <div className="text-center mb-16">
           <h2 className="text-3xl md:text-5xl font-bold text-yellow uppercase tracking-widest font-display drop-shadow-lg mb-4">
             {title}
           </h2>
           <p className="text-white/50 tracking-[0.2em] uppercase text-sm">{subtitle}</p>
           <div className="w-16 h-1 bg-yellow mx-auto mt-6 rounded-full opacity-50" />
        </div>

        {/* Reviews Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
              whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: prefersReducedMotion ? 0 : i * 0.1 }}
            >
              <ReviewCard review={review} hideClient={hideClient} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
