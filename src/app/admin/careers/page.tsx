import { CareersPage } from "@/components/admin/careers/CareersPage";
import { getAllCareers } from "@/lib/supabase/queries";

// Content changes rarely; real-time subscription handles live updates on the client.
export const revalidate = 60;

export default async function CareersRoute() {
  const careers = await getAllCareers();
  return <CareersPage initialCareers={careers} />;
}
