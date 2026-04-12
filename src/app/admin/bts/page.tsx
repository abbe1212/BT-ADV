import { BTSPage } from "@/components/admin/bts/BTSPage";
import { getBts } from "@/lib/supabase/queries";

// Content changes rarely; real-time subscription handles live updates on the client.
export const revalidate = 60;

export default async function BTSRoute() {
  const initialBts = await getBts();
  
  return <BTSPage initialBts={initialBts} />;
}
