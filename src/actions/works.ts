'use server';

/**
 * Server Actions — Works
 * ─────────────────────────────────────────────────────────────────────────────
 * All admin write operations for the `works` table.
 * Runs on the server using the authenticated session (NOT the anon key).
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { WorkInsertSchema, WorkUpdateSchema } from '@/lib/validations';
import type { Work } from '@/lib/supabase/types';

export interface MutationResult<T = void> {
  data: T | null;
  error: string | null;
}

export interface WorkInsert {
  title_ar: string;
  title_en?: string | null;
  category: string;
  image_url: string;
  video_url?: string | null;
  year: number;
  featured?: boolean;
  order_index?: number;
  client_id?: string | null;
}

export interface WorkUpdate extends Partial<WorkInsert> {
  id: string;
}

export async function insertWork(payload: WorkInsert): Promise<MutationResult<Work>> {
  const parsed = WorkInsertSchema.safeParse(payload);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Invalid input';
    return { data: null, error: msg };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('works')
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    console.error('[SA insertWork]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/works');
  revalidatePath('/works');
  revalidateTag('works', 'default');
  return { data: data as Work, error: null };
}

export async function updateWork({ id, ...payload }: WorkUpdate): Promise<MutationResult<Work>> {
  const parsed = WorkUpdateSchema.safeParse({ id, ...payload });
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Invalid input';
    return { data: null, error: msg };
  }

  const { id: parsedId, ...updateData } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('works')
    .update(updateData)
    .eq('id', parsedId)
    .select()
    .single();

  if (error) {
    console.error('[SA updateWork]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/works');
  revalidatePath('/works');
  revalidateTag('works', 'default');
  return { data: data as Work, error: null };
}

export async function deleteWork(id: string): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('works').delete().eq('id', id);

  if (error) {
    console.error('[SA deleteWork]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/works');
  revalidatePath('/works');
  revalidateTag('works', 'default');
  return { data: null, error: null };
}
