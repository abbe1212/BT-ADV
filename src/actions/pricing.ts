'use server';

/**
 * Server Actions — Pricing
 * ─────────────────────────────────────────────────────────────────────────────
 * All admin write operations for the `pricing` table.
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { PricingInsertSchema, PricingUpdateSchema } from '@/lib/validations';
import type { Pricing } from '@/lib/supabase/types';

export interface MutationResult<T = void> {
  data: T | null;
  error: string | null;
}

export interface PricingInsert {
  category: string;
  title_ar: string;
  title_en?: string | null;
  price_from: number;
  price_to?: number | null;
  price_note?: string | null;
  is_popular?: boolean;
  order_index?: number;
}

export interface PricingUpdate extends Partial<PricingInsert> {
  id: string;
}

export async function insertPricing(payload: PricingInsert): Promise<MutationResult<Pricing>> {
  const parsed = PricingInsertSchema.safeParse(payload);
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('pricing')
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    console.error('[SA insertPricing]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/pricing');
  revalidatePath('/pricing');
  revalidateTag('pricing', 'default');
  return { data: data as Pricing, error: null };
}

export async function updatePricing({ id, ...payload }: PricingUpdate): Promise<MutationResult<Pricing>> {
  const parsed = PricingUpdateSchema.safeParse({ id, ...payload });
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const { id: parsedId, ...updateData } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('pricing')
    .update(updateData)
    .eq('id', parsedId)
    .select()
    .single();

  if (error) {
    console.error('[SA updatePricing]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/pricing');
  revalidatePath('/pricing');
  revalidateTag('pricing', 'default');
  return { data: data as Pricing, error: null };
}

export async function deletePricing(id: string): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('pricing').delete().eq('id', id);

  if (error) {
    console.error('[SA deletePricing]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/pricing');
  revalidatePath('/pricing');
  revalidateTag('pricing', 'default');
  return { data: null, error: null };
}
