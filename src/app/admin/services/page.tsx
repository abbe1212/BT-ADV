import { ServicesPage } from "@/components/admin/services/ServicesPage";
import { getServices } from "@/lib/supabase/queries";

// Content changes rarely; real-time subscription handles live updates on the client.
export const revalidate = 60;

export default async function ServicesRoute() {
  const services = await getServices();
  return <ServicesPage initialServices={services} />;
}
