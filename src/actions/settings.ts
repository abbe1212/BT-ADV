'use server';

/**
 * Server Actions — Site Settings
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin write operations for the `site_settings` table.
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { SiteSettingSchema, SiteSettingsSchema } from '@/lib/validations';

export interface MutationResult<T = void> {
  data: T | null;
  error: string | null;
}

export async function updateSiteSetting(key: string, value: string): Promise<MutationResult> {
  const parsed = SiteSettingSchema.safeParse({ key, value });
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key: parsed.data.key, value: parsed.data.value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

  if (error) {
    console.error('[SA updateSiteSetting]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/settings');
  revalidatePath('/');
  return { data: null, error: null };
}

export async function updateSiteSettings(settings: Record<string, string>): Promise<MutationResult> {
  const parsed = SiteSettingsSchema.safeParse(settings);
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid settings data' };

  const supabase = await createClient();
  const now = new Date().toISOString();
  const payload = Object.entries(parsed.data).map(([key, value]) => ({
    key,
    value,
    updated_at: now,
  }));

  const { error } = await supabase
    .from('site_settings')
    .upsert(payload, { onConflict: 'key' });

  if (error) {
    console.error('[SA updateSiteSettings]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/settings');
  revalidatePath('/');
  return { data: null, error: null };
}
