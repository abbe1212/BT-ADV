import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import type { Work } from "@/lib/supabase/types";

export function LatestWorksWidget({ recentWorks }: { recentWorks: Work[] }) {
  return (
    <div className="bg-[#0A1F33] rounded-xl border border-[#14304A] p-5">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Latest Works Added</h2>
          <p className="text-xs text-white/50 uppercase tracking-wide">أحدث الأعمال</p>
        </div>
        <Link href="/admin/works" className="text-sm text-[#00203C] bg-[#FFEE34] px-4 py-1.5 rounded-lg font-bold hover:bg-white transition-colors">
          Manage Works
        </Link>
      </div>

      {recentWorks.length === 0 ? (
        <div className="text-center py-12 text-white/50">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No works added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {recentWorks.map((work) => (
            <div key={work.id} className="relative aspect-video rounded-lg overflow-hidden group bg-[#020F1C] border border-[#14304A]">
              {work.image_url ? (
                <Image 
                  src={work.image_url} 
                  alt={work.title_ar}
                  fill
                  className="object-cover"
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#00203C] to-[#0A3355] opacity-50 group-hover:opacity-30 transition-opacity"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-white/20">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
                <span className="text-[10px] font-bold text-[#FFEE34] uppercase mb-0.5">{work.category}</span>
                <h4 className="text-white text-sm font-bold truncate">{work.title_ar}</h4>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
