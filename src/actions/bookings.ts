'use server';

/**
 * Server Actions — Bookings
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin write operations for the `bookings` table.
 * Status changes and deletions require an authenticated admin session.
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { BookingStatusSchema, MessageIdSchema } from '@/lib/validations';
import type { Booking } from '@/lib/supabase/types';

export interface MutationResult<T = void> {
  data: T | null;
  error: string | null;
}

export async function updateBookingStatus(
  id: string,
  status: 'pending' | 'confirmed' | 'cancelled'
): Promise<MutationResult<Booking>> {
  const parsed = BookingStatusSchema.safeParse({ id, status });
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.id)
    .select()
    .single();

  if (error) {
    console.error('[SA updateBookingStatus]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/bookings');
  revalidatePath('/admin');
  revalidateTag('booked-slots', 'default');
  return { data: data as Booking, error: null };
}

export async function deleteBooking(id: string): Promise<MutationResult> {
  const parsedId = MessageIdSchema.safeParse(id);
  if (!parsedId.success) return { data: null, error: 'Invalid booking ID' };

  const supabase = await createClient();
  const { error } = await supabase.from('bookings').delete().eq('id', parsedId.data);

  if (error) {
    console.error('[SA deleteBooking]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/bookings');
  revalidatePath('/admin');
  revalidateTag('booked-slots', 'default');
  return { data: null, error: null };
}
