import HeroSection from "@/components/home/HeroSection";
import ClientsMarquee from "@/components/home/ClientsMarquee";
import Navbar from "@/components/layout/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-navy flex flex-col items-center">
      <Navbar />
      <HeroSection />
      <ClientsMarquee />
      {/* WorksTeaser, PricingTeaser, AboutTeaser can go here */}
    </main>
  );
}
