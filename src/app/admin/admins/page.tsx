import { AdminsPage } from "@/components/admin/admins/AdminsPage";
import { getAdminUsers } from "@/lib/supabase/queries";

// Admin user list must be fresh — security-sensitive.
export const dynamic = 'force-dynamic';

export default async function AdminsRoute() {
  const admins = await getAdminUsers();
  return <AdminsPage initialAdmins={admins} />;
}
