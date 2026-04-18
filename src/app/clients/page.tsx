import Navbar from "@/components/layout/Navbar";
import ClientCard from "@/components/clients/ClientCard";
import { getClients, getWorks } from "@/lib/supabase/queries";
import { Users } from "lucide-react";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Our Clients — BT ADV",
  description: "Explore the brands and organizations that trust BT Advertising Agency for their cinematic productions.",
};

export default async function ClientsIndexPage() {
  // Fetch clients and works simultaneously
  const [clients, works] = await Promise.all([getClients(), getWorks()]);

  // Compute works count for each client
  const worksCountMap = works.reduce((acc, work) => {
    if (work.client_id) {
      acc[work.client_id] = (acc[work.client_id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <main className="min-h-screen bg-navy text-white flex flex-col items-center">
      <Navbar />

      {/* Cinematic Hero */}
      <section className="relative w-full h-[50vh] mt-24 bg-black flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy/60 to-black z-10" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-navy to-transparent z-20" />
        
        {/* Subtle decorative particles */}
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('/noise.png')] mix-blend-overlay" />
        
        <div className="relative z-30 text-center px-4 w-full pt-10">
          <div> {/* Assuming client side animation not strictly needed, let's keep static for server */}
            <Users className="w-12 h-12 text-yellow/50 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-4 tracking-widest font-[fantasy]">
              عملاؤنا
              <span className="block text-2xl md:text-3xl lg:text-4xl text-yellow mt-2 uppercase tracking-[0.3em]">Our Clients</span>
            </h1>
            <p className="text-white/50 max-w-2xl mx-auto mt-6 tracking-widest uppercase text-xs md:text-sm">
              The brands that trust our cinematic vision
            </p>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="w-full max-w-7xl mx-auto px-4 py-20 z-30 relative">
        {clients.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <p className="tracking-widest uppercase">No clients to display.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {clients.map(client => (
              <ClientCard 
                key={client.id} 
                client={client} 
                worksCount={worksCountMap[client.id] || 0} 
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
