'use server';

/**
 * Server Actions — BTS (Behind The Scenes)
 * ─────────────────────────────────────────────────────────────────────────────
 * All admin write operations for the `bts` table.
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { BtsItemInsertSchema, BtsItemUpdateSchema } from '@/lib/validations';
import type { BtsItem } from '@/lib/supabase/types';

export interface MutationResult<T = void> {
  data: T | null;
  error: string | null;
}

export interface BtsItemInsert {
  title_ar?: string | null;
  title_en?: string | null;
  media_url: string;
  media_type: 'image' | 'video';
  order_index?: number;
}

export interface BtsItemUpdate extends Partial<BtsItemInsert> {
  id: string;
}

export async function insertBtsItem(payload: BtsItemInsert): Promise<MutationResult<BtsItem>> {
  const parsed = BtsItemInsertSchema.safeParse(payload);
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bts')
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    console.error('[SA insertBtsItem]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/bts');
  revalidatePath('/bts');
  return { data: data as BtsItem, error: null };
}

export async function updateBtsItem({ id, ...payload }: BtsItemUpdate): Promise<MutationResult<BtsItem>> {
  const parsed = BtsItemUpdateSchema.safeParse({ id, ...payload });
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const { id: parsedId, ...updateData } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bts')
    .update(updateData)
    .eq('id', parsedId)
    .select()
    .single();

  if (error) {
    console.error('[SA updateBtsItem]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/bts');
  revalidatePath('/bts');
  return { data: data as BtsItem, error: null };
}

export async function deleteBtsItem(id: string): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('bts').delete().eq('id', id);

  if (error) {
    console.error('[SA deleteBtsItem]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/bts');
  revalidatePath('/bts');
  return { data: null, error: null };
}
