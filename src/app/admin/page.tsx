import { AdminDashboard } from "@/components/admin/home/AdminDashboard";
import { 
  getDashboardStats, 
  getRecentBookings, 
  getRecentMessages, 
  getRecentWorks 
} from "@/lib/supabase/queries";

// Dashboard shows live booking counts and unread message totals — must always be fresh.
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [stats, recentBookings, recentMessages, recentWorks] = await Promise.all([
    getDashboardStats(),
    getRecentBookings(5),
    getRecentMessages(3),
    getRecentWorks(4),
  ]);

  return (
    <AdminDashboard 
      stats={stats}
      recentBookings={recentBookings}
      recentMessages={recentMessages}
      recentWorks={recentWorks}
    />
  );
}
