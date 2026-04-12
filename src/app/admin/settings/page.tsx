import { SettingsPage } from "@/components/admin/settings/SettingsPage";
import { getSiteSettings } from "@/lib/supabase/queries";

// Settings change infrequently; 60s cache reduces DB reads.
export const revalidate = 60;

export default async function SettingsRoute() {
  const settings = await getSiteSettings();
  return <SettingsPage initialSettings={settings} />;
}
