import { Star, MessageSquareQuote } from "lucide-react";
import Image from "next/image";
import type { Review } from "@/lib/supabase/types";

interface Props {
  review: Review;
  hideClient?: boolean;
}

export default function ReviewCard({ review, hideClient = false }: Props) {
  const hasEn = !!review.content_en;

  return (
    <div className="bg-[#0A1F33] rounded-2xl border border-white/5 border-l-4 border-l-yellow p-6 sm:p-8 flex flex-col h-full relative transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,238,52,0.1)]">
      {/* Decorative Quote Icon */}
      <MessageSquareQuote className="absolute top-6 right-6 w-12 h-12 text-white/5 opacity-50 pointer-events-none" />

      {/* Rating */}
      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${i < review.rating ? 'fill-yellow text-yellow' : 'fill-transparent text-white/10'}`} 
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center mb-8 relative z-10">
        <p className="text-white md:text-lg lg:text-xl font-bold leading-relaxed text-right arabic-font drop-shadow-md">
          {review.content_ar}
        </p>
        {hasEn && (
          <p className="text-white/50 text-sm md:text-base mt-4 italic font-serif relative pl-4 border-l-2 border-white/10">
            "{review.content_en}"
          </p>
        )}
      </div>

      {/* Attribution */}
      <div className="flex items-center justify-between border-t border-white/10 pt-5 mt-auto relative z-10 gap-4">
        <div className="flex flex-col flex-1 shrink min-w-0">
          <span className="text-white font-bold text-sm uppercase tracking-widest truncate">{review.reviewer_name}</span>
          {review.reviewer_role && (
            <span className="text-yellow text-xs mt-1 font-medium truncate">{review.reviewer_role}</span>
          )}
        </div>
        
        {/* Client Tag */}
        {!hideClient && review.clients && (
          <div className="flex items-center gap-2.5 bg-[#00203c]/50 px-3 py-1.5 rounded-lg border border-[#14304A] shrink-0 hover:border-yellow/30 transition-colors shadow-inner">
            <span className="text-white/90 text-xs font-bold tracking-wider uppercase text-right leading-tight max-w-[90px] truncate">
              {review.clients.name}
            </span>
            {review.clients.logo_url && (
              <div className="w-7 h-7 relative shrink-0">
                <Image 
                  src={review.clients.logo_url} 
                  alt={review.clients.name} 
                  fill 
                  sizes="28px"
                  className="object-contain drop-shadow-md"
                  unoptimized
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
