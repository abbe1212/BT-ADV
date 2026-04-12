/**
 * Admin Settings — Data Layer
 * ---------------------------
 * Server-side query functions for site settings in the admin panel.
 * Settings are cached aggressively (5 min) since they change rarely.
 */

import { createClient } from '../server';
import type { SiteSetting } from '../types';

export interface SiteSettingsMap {
  [key: string]: string;
}

/**
 * Returns all site settings as a key→value map.
 *
 * Cache strategy: revalidate every 5 minutes (ISR-style).
 * Use `{ cache: 'no-store' }` on the page if you need real-time settings.
 *
 * @example
 * const settings = await getAdminSettings();
 * const phone = settings['contact_phone'] ?? '';
 */
export async function getAdminSettings(): Promise<SiteSettingsMap> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .order('key', { ascending: true });

  if (error) {
    console.error('[getAdminSettings]', error.message);
    return {};
  }

  return (data as SiteSetting[]).reduce<SiteSettingsMap>((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}

/**
 * Returns a single setting value by key.
 * Returns `null` if the key does not exist.
 */
export async function getAdminSetting(key: string): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is expected
      console.error('[getAdminSetting]', error.message);
    }
    return null;
  }

  return (data as { value: string }).value;
}

/**
 * Returns a list of all settings keys.
 * Useful for auditing or building a dynamic settings form.
 */
export async function getSettingKeys(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('site_settings')
    .select('key')
    .order('key', { ascending: true });

  if (error) {
    console.error('[getSettingKeys]', error.message);
    return [];
  }

  return (data as { key: string }[]).map((row) => row.key);
}
