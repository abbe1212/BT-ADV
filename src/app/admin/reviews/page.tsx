import { ReviewsPage } from "@/components/admin/reviews/ReviewsPage";
import { getClients, getAllReviews } from "@/lib/supabase/queries";

export const dynamic = 'force-dynamic';

export default async function ReviewsRoute() {
  // [P2.19] getAllReviews now returns { data, count } with default limit of 50.
  const [{ data: initialReviews, count }, clients] = await Promise.all([
    getAllReviews({ limit: 50 }),
    getClients(),
  ]);

  return <ReviewsPage initialReviews={initialReviews} totalCount={count} clients={clients} />;
}
