'use server';

/**
 * Server Actions — Careers
 * ─────────────────────────────────────────────────────────────────────────────
 * All admin write operations for the `careers` table.
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { CareerInsertSchema, CareerUpdateSchema } from '@/lib/validations';
import type { Career } from '@/lib/supabase/types';

export interface MutationResult<T = void> {
  data: T | null;
  error: string | null;
}

export interface CareerInsert {
  title_ar: string;
  title_en?: string | null;
  department: string;
  type: string;
  description_ar?: string | null;
  description_en?: string | null;
  is_open?: boolean;
}

export interface CareerUpdate extends Partial<CareerInsert> {
  id: string;
}

export async function insertCareer(payload: CareerInsert): Promise<MutationResult<Career>> {
  const parsed = CareerInsertSchema.safeParse(payload);
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('careers')
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    console.error('[SA insertCareer]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/careers');
  revalidatePath('/careers');
  return { data: data as Career, error: null };
}

export async function updateCareer({ id, ...payload }: CareerUpdate): Promise<MutationResult<Career>> {
  const parsed = CareerUpdateSchema.safeParse({ id, ...payload });
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const { id: parsedId, ...updateData } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('careers')
    .update(updateData)
    .eq('id', parsedId)
    .select()
    .single();

  if (error) {
    console.error('[SA updateCareer]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/careers');
  revalidatePath('/careers');
  return { data: data as Career, error: null };
}

export async function deleteCareer(id: string): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('careers').delete().eq('id', id);

  if (error) {
    console.error('[SA deleteCareer]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/careers');
  revalidatePath('/careers');
  return { data: null, error: null };
}
