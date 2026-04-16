'use server';

/**
 * Server Actions — Messages
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin write operations for the `contact_messages` table.
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { MessageIdSchema } from '@/lib/validations';
import type { ContactMessage } from '@/lib/supabase/types';

export interface MutationResult<T = void> {
  data: T | null;
  error: string | null;
}

export async function markMessageAsRead(id: string, is_read = true): Promise<MutationResult<ContactMessage>> {
  const parsedId = MessageIdSchema.safeParse(id);
  if (!parsedId.success) return { data: null, error: 'Invalid message ID' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('contact_messages')
    .update({ is_read })
    .eq('id', parsedId.data)
    .select()
    .single();

  if (error) {
    console.error('[SA markMessageAsRead]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/messages');
  revalidatePath('/admin');
  return { data: data as ContactMessage, error: null };
}

export async function deleteMessage(id: string): Promise<MutationResult> {
  const parsedId = MessageIdSchema.safeParse(id);
  if (!parsedId.success) return { data: null, error: 'Invalid message ID' };

  const supabase = await createClient();
  const { error } = await supabase.from('contact_messages').delete().eq('id', parsedId.data);

  if (error) {
    console.error('[SA deleteMessage]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/messages');
  revalidatePath('/admin');
  return { data: null, error: null };
}
