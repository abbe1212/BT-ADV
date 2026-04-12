import { TeamPage } from "@/components/admin/team/TeamPage";
import { getTeam } from "@/lib/supabase/queries";

// Content changes rarely; real-time subscription handles live updates on the client.
export const revalidate = 60;

export default async function TeamRoute() {
  const team = await getTeam(false); // Get all members, not just featured
  return <TeamPage initialMembers={team} />;
}
