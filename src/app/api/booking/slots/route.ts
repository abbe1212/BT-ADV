import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

/**
 * GET /api/booking/slots?date=YYYY-MM-DD
 * Returns already-booked time_slots for the given date.
 *
 * [P2.18] Rate-limited: 60 requests per IP per minute.
 * This endpoint is polled on every date change in the booking form, so the
 * limit is generous but prevents scraping the entire calendar.
 */
export async function GET(req: Request) {
  /* ── Rate limiting (P2.18) ─────────────────────────────────────────────────*/
  const ip = getClientIp(req);
  const rl = await rateLimit(`slots:${ip}`, { limit: 60, windowMs: 60 * 1_000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    );
  }

  /* ── Validate date param ────────────────────────────────────────────────────*/
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: 'Invalid date format. Expected YYYY-MM-DD' },
      { status: 400 }
    );
  }

  /* ── Query booked slots ─────────────────────────────────────────────────────*/
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
