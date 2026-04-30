import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ContactMessageInsert } from '@/lib/supabase/types';
import * as z from 'zod';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { verifyCsrfToken } from '@/lib/csrf';

const schema = z.object({
  name:    z.string().min(2),
  email:   z.string().email(),
  phone:   z.string().optional(),
  message: z.string().min(5),
});

export async function POST(req: Request) {
  try {
    // ── CSRF verification ────────────────────────────────────────────────────
    if (!verifyCsrfToken(req)) {
      return NextResponse.json(
        { error: 'Invalid or missing CSRF token.' },
        { status: 403 }
      );
    }

    // ── Rate limiting ────────────────────────────────────────────────────
    // 3 submissions per IP per 5 minutes — prevents contact form spam.
    const ip = getClientIp(req);
    const rl = await rateLimit(`contact:${ip}`, { limit: 3, windowMs: 5 * 60 * 1_000 });
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before submitting again.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rl.retryAfter) },
        }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const payload: ContactMessageInsert = {
      name:    parsed.data.name,
      email:   parsed.data.email,
      message: parsed.data.message,
      ...(parsed.data.phone ? { phone: parsed.data.phone } : {}),
    };

    const supabase = await createClient();
    const { error } = await supabase.from('contact_messages').insert(payload);

    if (error) {
      console.error('[POST /api/contact]', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[POST /api/contact] unexpected:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
