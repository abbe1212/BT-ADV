import { ClientsPage } from "@/components/admin/clients/ClientsPage";
import { getClients } from "@/lib/supabase/queries";

// Content changes rarely; real-time subscription handles live updates on the client.
export const revalidate = 60;

export default async function ClientsRoute() {
  const initialClients = await getClients();
  
  return <ClientsPage initialClients={initialClients} />;
}
