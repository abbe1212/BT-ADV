import HeroSection from "@/components/home/HeroSection";
import ClientsMarquee from "@/components/home/ClientsMarquee";
import Navbar from "@/components/layout/Navbar";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import { getClients, getFeaturedReviews } from "@/lib/supabase/queries";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [clients, featuredReviews] = await Promise.all([
    getClients(),
    getFeaturedReviews(),
  ]);

  return (
    <main className="min-h-screen bg-navy flex flex-col items-center">
      <Navbar />
      <HeroSection logos={clients} />
      <ClientsMarquee logos={clients} />
      {featuredReviews.length > 0 && <ReviewsSection reviews={featuredReviews} />}
      {/* WorksTeaser, PricingTeaser, AboutTeaser can go here */}
    </main>
  );
}
