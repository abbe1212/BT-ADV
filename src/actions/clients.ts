'use server';

/**
 * Server Actions — Clients
 * ─────────────────────────────────────────────────────────────────────────────
 * All admin write operations for the `clients` table.
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ClientInsertSchema, ClientUpdateSchema } from '@/lib/validations';
import type { Client } from '@/lib/supabase/types';

export interface MutationResult<T = void> {
  data: T | null;
  error: string | null;
}

export interface ClientInsert {
  name: string;
  slug: string;
  logo_url?: string | null;
  youtube_url?: string | null;
  website_url?: string | null;
  industry?: string | null;
  order_index?: number;
}

export interface ClientUpdate extends Partial<ClientInsert> {
  id: string;
}

export async function insertClient(payload: ClientInsert): Promise<MutationResult<Client>> {
  const parsed = ClientInsertSchema.safeParse(payload);
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('clients')
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    console.error('[SA insertClient]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/clients');
  revalidatePath('/clients');
  return { data: data as Client, error: null };
}

export async function updateClient({ id, ...payload }: ClientUpdate): Promise<MutationResult<Client>> {
  const parsed = ClientUpdateSchema.safeParse({ id, ...payload });
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const { id: parsedId, ...updateData } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('clients')
    .update(updateData)
    .eq('id', parsedId)
    .select()
    .single();

  if (error) {
    console.error('[SA updateClient]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/clients');
  revalidatePath('/clients');
  return { data: data as Client, error: null };
}

export async function deleteClient(id: string): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('clients').delete().eq('id', id);

  if (error) {
    console.error('[SA deleteClient]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/clients');
  revalidatePath('/clients');
  return { data: null, error: null };
}
