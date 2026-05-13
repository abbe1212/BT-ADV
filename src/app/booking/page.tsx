import { getClients, getServices, getWorks, getFeaturedReviews } from "@/lib/supabase/queries";
import BookingPageClient from "@/components/booking/BookingPageClient";

// ISR: revalidate page shell every hour.
// Live slot availability is fetched client-side via /api/booking/slots — not here.
export const revalidate = 3600;

export const metadata = {
  title: "Book Your Slot — BT ADV",
  description: "Schedule a consultation with BT Advertising Agency for your next cinematic production.",
};

export default async function BookingPage() {
  // All 4 queries run in parallel; getServices & getWorks are cached for 1 hr
  const [clients, services, works, reviews] = await Promise.all([
    getClients(),
    getServices(),
    getWorks(),
    getFeaturedReviews(),
  ]);

  // Latest 5 works sorted by created_at desc
  const latestWorks = [...works]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <BookingPageClient
      clientLogos={clients}
      services={services}
      featuredWorks={latestWorks}
      reviews={reviews}
    />
  );
}
