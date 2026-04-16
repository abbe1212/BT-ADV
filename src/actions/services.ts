'use server';

/**
 * Server Actions — Services
 * ─────────────────────────────────────────────────────────────────────────────
 * All admin write operations for the `services` table.
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { ServiceInsertSchema, ServiceUpdateSchema } from '@/lib/validations';
import type { Service } from '@/lib/supabase/types';

export interface MutationResult<T = void> {
  data: T | null;
  error: string | null;
}

export interface ServiceInsert {
  title_ar: string;
  title_en?: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  icon?: string | null;
  order_index?: number;
}

export interface ServiceUpdate extends Partial<ServiceInsert> {
  id: string;
}

export async function insertService(payload: ServiceInsert): Promise<MutationResult<Service>> {
  const parsed = ServiceInsertSchema.safeParse(payload);
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('services')
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    console.error('[SA insertService]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/services');
  revalidatePath('/');
  revalidateTag('services', 'default');
  return { data: data as Service, error: null };
}

export async function updateService({ id, ...payload }: ServiceUpdate): Promise<MutationResult<Service>> {
  const parsed = ServiceUpdateSchema.safeParse({ id, ...payload });
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const { id: parsedId, ...updateData } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('services')
    .update(updateData)
    .eq('id', parsedId)
    .select()
    .single();

  if (error) {
    console.error('[SA updateService]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/services');
  revalidatePath('/');
  revalidateTag('services', 'default');
  return { data: data as Service, error: null };
}

export async function deleteService(id: string): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('services').delete().eq('id', id);

  if (error) {
    console.error('[SA deleteService]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/services');
  revalidatePath('/');
  revalidateTag('services', 'default');
  return { data: null, error: null };
}
