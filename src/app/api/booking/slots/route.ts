import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/booking/slots?date=YYYY-MM-DD
 * Returns already-booked time_slots for the given date.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format. Expected YYYY-MM-DD' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('time_slot')
    .eq('date', date)
    .in('status', ['pending', 'confirmed']);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const bookedSlots = (data as { time_slot: string }[]).map((r) => r.time_slot);
  return NextResponse.json({ bookedSlots });
}
