'use server';

/**
 * Server Actions — Reviews
 * ─────────────────────────────────────────────────────────────────────────────
 * All admin write operations for the `reviews` table.
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ReviewInsertSchema, ReviewUpdateSchema } from '@/lib/validations';
import type { Review } from '@/lib/supabase/types';

export interface MutationResult<T = void> {
  data: T | null;
  error: string | null;
}

export interface ReviewInsert {
  client_id: string;
  reviewer_name: string;
  reviewer_role?: string | null;
  content_ar: string;
  content_en?: string | null;
  rating?: number;
  is_featured?: boolean;
  order_index?: number;
}

export interface ReviewUpdate extends Partial<ReviewInsert> {
  id: string;
}

export async function insertReview(payload: ReviewInsert): Promise<MutationResult<Review>> {
  const parsed = ReviewInsertSchema.safeParse(payload);
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    console.error('[SA insertReview]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/reviews');
  revalidatePath('/');
  return { data: data as Review, error: null };
}

export async function updateReview({ id, ...payload }: ReviewUpdate): Promise<MutationResult<Review>> {
  const parsed = ReviewUpdateSchema.safeParse({ id, ...payload });
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const { id: parsedId, ...updateData } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .update(updateData)
    .eq('id', parsedId)
    .select()
    .single();

  if (error) {
    console.error('[SA updateReview]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/reviews');
  revalidatePath('/');
  return { data: data as Review, error: null };
}

export async function deleteReview(id: string): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('reviews').delete().eq('id', id);

  if (error) {
    console.error('[SA deleteReview]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/reviews');
  revalidatePath('/');
  return { data: null, error: null };
}
