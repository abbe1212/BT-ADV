import HeroSection from "@/components/home/HeroSection";
import ClientsMarquee from "@/components/home/ClientsMarquee";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import { getClients, getFeaturedReviews } from "@/lib/supabase/queries";

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const [clients, featuredReviews] = await Promise.all([
    getClients(),
    getFeaturedReviews(),
  ]);

  return (
    <main id="main-content" className="min-h-screen bg-navy flex flex-col items-center">
      <Navbar />
      <HeroSection logos={clients} />
      <ClientsMarquee logos={clients} />
      {featuredReviews.length > 0 && <ReviewsSection reviews={featuredReviews} />}
      <Footer />
    </main>
  );
}
