import Link from "next/link";
import Image from "next/image";
import { Building2, Film } from "lucide-react";
import type { Client } from "@/lib/supabase/types";

interface Props {
  client: Client;
  worksCount: number;
}

export default function ClientCard({ client, worksCount }: Props) {
  return (
    <Link href={`/clients/${client.slug}`} className="group block">
      <div className="bg-[#0A1F33] rounded-2xl border border-white/5 relative overflow-hidden transition-all duration-300 hover:border-yellow hover:shadow-[0_0_30px_rgba(255,238,52,0.15)] hover:-translate-y-1 h-full flex flex-col">
        
        {/* Logo Container / Top Half */}
        <div className="h-48 w-full bg-black/40 flex items-center justify-center p-8 relative">
          {client.logo_url ? (
             <div className="relative w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500 opacity-60 group-hover:opacity-100">
               <Image 
                 src={client.logo_url} 
                 alt={client.name} 
                 fill 
                 className="object-contain drop-shadow-2xl" 
                 sizes="(max-width: 768px) 100vw, 300px" 
                 unoptimized 
               />
             </div>
          ) : (
            <Building2 className="w-16 h-16 text-white/20" />
          )}

          {/* Hover Overlay Button */}
          <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
             <span className="bg-yellow text-navy px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
               عرض الأعمال
             </span>
          </div>
        </div>

        {/* Details / Bottom Half */}
        <div className="p-5 flex flex-col flex-1 border-t border-white/5">
          <h3 className="text-xl font-bold text-white mb-2">{client.name}</h3>
          
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
            {client.industry ? (
              <span className="text-xs uppercase tracking-widest text-white/40">{client.industry}</span>
            ) : <span />}
            
            <div className="flex items-center gap-1.5 bg-yellow/10 text-yellow px-2 py-1 rounded-md">
              <Film className="w-3 h-3" />
              <span className="text-xs font-bold font-mono">{worksCount}</span>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}
