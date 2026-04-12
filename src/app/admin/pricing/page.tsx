import { PricingPage } from "@/components/admin/pricing/PricingPage";
import { getAllPricing } from "@/lib/supabase/queries";

// Content changes rarely; real-time subscription handles live updates on the client.
export const revalidate = 60;

export default async function PricingRoute() {
  const pricing = await getAllPricing();
  return <PricingPage initialPricing={pricing} />;
}
