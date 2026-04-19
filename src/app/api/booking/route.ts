import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import type { BookingInsert } from '@/lib/supabase/types';
import * as z from 'zod';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { verifyCsrfToken } from '@/lib/csrf';

/* ─── Validation ─────────────────────────────────────────────────────────────*/
const bookingSchema = z.object({
  name:                z.string().min(2),
  email:               z.string().email(),
  phone:               z.string().min(5),
  address:             z.string().optional(),
  date:                z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),  // now optional
  time_slot:           z.string().min(1),                                    // time range e.g. '10am-12pm'
  type:                z.string().default('phone'),
  estimated_budget:    z.string().optional(),
  company_name:        z.string().optional(),
  company_brief:       z.string().optional(),
  industry:            z.string().optional(),
  has_brand_guide:     z.boolean().optional(),
  previous_ads:        z.boolean().optional(),
  target_audience:     z.enum(['B2B', 'B2C', 'General', 'Other']).optional(),
  platforms:           z.array(z.string()).optional(),
  project_type:        z.string().optional(),
  project_type_other:  z.string().optional(),
  project_goal:        z.string().optional(),
  project_goal_other:  z.string().optional(),
  planning_start:      z.string().optional(),
  notes:               z.string().optional(),
});

/* ─── ref_code generator ─────────────────────────────────────────────────────*/
/**
 * Generates a collision-safe booking reference code using Node.js crypto.
 * crypto.randomUUID() is RFC 4122 compliant and cryptographically random —
 * guaranteed unique even under concurrent load, no external package required.
 * Example output: BT-A3F9C12E
 */
function generateRefCode(): string {
  const unique = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  return `BT-${unique}`;
}

/* ─── Date formatter ─────────────────────────────────────────────────────────*/
function formatDate(date: string, time: string) {
  const d = new Date(`${date}T${time}:00`);
  return {
    full: d.toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' }),
    day:  d.toLocaleDateString('en-GB', { day: '2-digit' }),
    month:d.toLocaleDateString('en-GB', { month: 'long' }),
    year: d.toLocaleDateString('en-GB', { year: 'numeric' }),
  };
}

/* ─── Shared ticket HTML ─────────────────────────────────────────────────────*/
function ticketBlock(name: string, date: string, time_slot: string, type: string, budget: string, refCode: string) {
  const d = formatDate(date, time_slot);
  const typeLabel = type.replace('onsite', 'On-Site').replace('phone', 'Phone Call').replace('zoom', 'Zoom').toUpperCase();

  return `
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:32px 0;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0" role="presentation"
        style="width:600px;max-width:100%;background-color:#e8c35e;border-radius:12px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.5);font-family:'Courier New',Courier,monospace;">
        <tr><td style="height:18px;background:repeating-linear-gradient(90deg,transparent 0px,transparent 14px,#00203c 14px,#00203c 30px);"></td></tr>
        <tr>
          <td style="width:420px;padding:28px 30px 24px 36px;vertical-align:top;border-right:3px dashed rgba(0,32,60,0.4);">
            <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:5px;color:#00203c;opacity:0.7;text-transform:uppercase;">BT-ADV</p>
            <h1 style="margin:0 0 16px 0;font-size:30px;font-weight:900;letter-spacing:6px;color:#00203c;text-transform:uppercase;line-height:1;">BOOKING TICKET</h1>
            <div style="height:2px;background:#00203c;opacity:0.25;margin-bottom:20px;"></div>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
              <tr>
                <td style="width:40%;vertical-align:top;padding-right:10px;">
                  <p style="margin:0;font-size:9px;letter-spacing:3px;color:#00203c;opacity:0.6;text-transform:uppercase;margin-bottom:4px;">PASSENGER</p>
                  <p style="margin:0;font-size:15px;font-weight:800;color:#00203c;text-transform:uppercase;">${name}</p>
                </td>
                <td style="width:30%;vertical-align:top;padding:0 10px;border-left:2px dashed rgba(0,32,60,0.3);">
                  <p style="margin:0;font-size:9px;letter-spacing:3px;color:#00203c;opacity:0.6;text-transform:uppercase;margin-bottom:4px;">SESSION</p>
                  <p style="margin:0;font-size:12px;font-weight:800;color:#00203c;text-transform:uppercase;">${typeLabel}</p>
                </td>
                <td style="width:30%;vertical-align:top;padding-left:10px;border-left:2px dashed rgba(0,32,60,0.3);">
                  <p style="margin:0;font-size:9px;letter-spacing:3px;color:#00203c;opacity:0.6;text-transform:uppercase;margin-bottom:4px;">BUDGET</p>
                  <p style="margin:0;font-size:15px;font-weight:900;color:#00203c;text-transform:uppercase;">${budget}</p>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
              <tr>
                <td style="width:33%;vertical-align:top;">
                  <p style="margin:0;font-size:9px;letter-spacing:3px;color:#00203c;opacity:0.6;text-transform:uppercase;margin-bottom:4px;">DATE</p>
                  <p style="margin:0;font-size:22px;font-weight:900;color:#00203c;line-height:1;">${d.day}</p>
                  <p style="margin:0;font-size:11px;font-weight:700;color:#00203c;text-transform:uppercase;">${d.month} ${d.year}</p>
                </td>
                <td style="width:33%;vertical-align:top;padding-left:10px;border-left:2px dashed rgba(0,32,60,0.4);">
                  <p style="margin:0;font-size:9px;letter-spacing:3px;color:#00203c;opacity:0.6;text-transform:uppercase;margin-bottom:4px;">TIME</p>
                  <p style="margin:0;font-size:28px;font-weight:900;color:#00203c;line-height:1;letter-spacing:2px;">${time_slot}</p>
                </td>
                <td style="width:34%;vertical-align:top;padding-left:10px;border-left:2px dashed rgba(0,32,60,0.4);">
                  <p style="margin:0;font-size:9px;letter-spacing:3px;color:#00203c;opacity:0.6;text-transform:uppercase;margin-bottom:4px;">REF CODE</p>
                  <p style="margin:0;font-size:11px;font-weight:900;color:#00203c;">${refCode}</p>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:9px;letter-spacing:2px;color:#00203c;opacity:0.55;text-transform:uppercase;">Our team will confirm shortly — BT-ADV © ${d.year}</p>
          </td>
          <td style="width:180px;padding:24px 16px;vertical-align:middle;text-align:center;background:rgba(0,32,60,0.08);">
            <p style="margin:0 0 12px 0;font-size:9px;letter-spacing:4px;color:#00203c;opacity:0.6;text-transform:uppercase;">✂ TEAR HERE</p>
            <div style="height:2px;background:rgba(0,32,60,0.2);margin-bottom:16px;"></div>
            <p style="margin:0 0 6px 0;font-size:20px;font-weight:900;color:#00203c;letter-spacing:4px;text-transform:uppercase;">BT</p>
            <p style="margin:0 0 6px 0;font-size:10px;font-weight:700;color:#00203c;letter-spacing:3px;text-transform:uppercase;">AGENCY</p>
            <div style="height:2px;background:rgba(0,32,60,0.2);margin:14px 0;"></div>
            <p style="margin:0 0 4px 0;font-size:9px;letter-spacing:2px;color:#00203c;opacity:0.7;text-transform:uppercase;">SEAT</p>
            <p style="margin:0;font-size:26px;font-weight:900;color:#00203c;">A1</p>
            <div style="height:2px;background:rgba(0,32,60,0.2);margin:14px 0;"></div>
            <div style="font-family:monospace;font-size:5px;color:#00203c;opacity:0.5;letter-spacing:1px;word-break:break-all;max-width:120px;margin:auto;line-height:1.6;">
              ||||| |||| ||||| ||| ||||| ||<br/>${refCode}<br/>||||| |||| ||||| ||| |||||
            </div>
          </td>
        </tr>
        <tr><td style="height:18px;background:repeating-linear-gradient(90deg,transparent 0px,transparent 14px,#00203c 14px,#00203c 30px);"></td></tr>
      </table>
    </td></tr>
  </table>`;
}

function detailRow(label: string, value: string) {
  return `<tr>
    <td style="padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.06);width:38%;vertical-align:top;">
      <span style="font-size:10px;letter-spacing:3px;color:rgba(255,255,255,0.4);text-transform:uppercase;">${label}</span>
    </td>
    <td style="padding:7px 0 7px 16px;border-bottom:1px solid rgba(255,255,255,0.06);vertical-align:top;">
      <span style="font-size:13px;color:#ffffff;font-weight:600;">${value}</span>
    </td>
  </tr>`;
}

function wrapEmail(body: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BT Booking</title></head>
  <body style="margin:0;padding:0;background-color:#00203c;font-family:'Helvetica Neue',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#00203c;min-height:100vh;">
      <tr><td align="center" style="padding:40px 16px 60px;">
        <table width="640" cellpadding="0" cellspacing="0" style="max-width:100%;">
          ${body}
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

/* ─── Route Handler ──────────────────────────────────────────────────────────*/
export async function POST(req: Request) {
  try {
    // ── CSRF verification ─────────────────────────────────────────────────────
    // Blocks cross-origin form submissions. The client must read the
    // `csrf-token` cookie (set by middleware) and echo it as X-CSRF-Token.
    if (!verifyCsrfToken(req)) {
      return NextResponse.json(
        { error: 'Invalid or missing CSRF token.' },
        { status: 403 }
      );
    }

    // ── Rate limiting ─────────────────────────────────────────────────────────
    // 5 booking attempts per IP per 10 minutes — prevents slot exhaustion & email abuse.
    const ip = getClientIp(req);
    const rl = rateLimit(`booking:${ip}`, { limit: 5, windowMs: 10 * 60 * 1_000 });
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
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { 
      name, email, phone, address, 
      date, time_slot, type, estimated_budget,
      company_name, company_brief, industry, has_brand_guide, previous_ads,
      target_audience, platforms, notes,
      project_type, project_type_other, project_goal, project_goal_other, planning_start
    } = parsed.data;

    // ── 1. Insert into Supabase ───────────────────────────────────────────────
    const ref_code = generateRefCode();
    const payload: BookingInsert = {
      ref_code,
      name,
      email,
      phone,
      address:             address || undefined,
      date:                date || undefined,
      time_slot,
      type:                type || 'phone',
      estimated_budget:    estimated_budget || undefined,
      company_name:        company_name || undefined,
      company_brief:       company_brief || undefined,
      industry:            industry || undefined,
      has_brand_guide,
      previous_ads,
      target_audience:     target_audience || undefined,
      platforms:           platforms || undefined,
      project_type:        project_type || undefined,
      project_type_other:  project_type_other || undefined,
      project_goal:        project_goal || undefined,
      project_goal_other:  project_goal_other || undefined,
      planning_start:      planning_start || undefined,
      notes:               notes || undefined,
      status: 'pending',
    };

    const supabase = await createClient();
    const { error: dbError } = await supabase.from('bookings').insert(payload);

    if (dbError) {
      console.error('[POST /api/booking] DB error:', dbError.message);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // ── 2. Send emails via Resend ─────────────────────────────────────────────
    const RESEND_KEY  = process.env.RESEND_API_KEY;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'hello@btadv.agency';
    const FROM_EMAIL  = process.env.FROM_EMAIL  ?? 'onboarding@resend.dev';
    const isTesting   = FROM_EMAIL === 'onboarding@resend.dev';
    const budget      = estimated_budget ?? 'N/A';

    if (RESEND_KEY) {
      const resend = new Resend(RESEND_KEY);
      const ticket = ticketBlock(name, date, time_slot, type, budget, ref_code);
      const clientDest = isTesting ? ADMIN_EMAIL : email;

      const clientHtml = wrapEmail(`
        <tr><td align="center" style="padding-bottom:32px;">
          <p style="margin:0;font-size:11px;letter-spacing:6px;color:#e8c35e;text-transform:uppercase;opacity:0.8;">BT-ADV</p>
          <h2 style="margin:8px 0 0;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:3px;text-transform:uppercase;">Booking Confirmed</h2>
          <div style="width:60px;height:2px;background:#e8c35e;margin:14px auto 0;"></div>
        </td></tr>
        <tr><td style="padding:0 20px 4px;">
          <p style="margin:0;font-size:16px;color:rgba(255,255,255,0.85);line-height:1.7;">
            Hi <strong style="color:#e8c35e;">${name}</strong>,<br>
            Your booking has been <strong style="color:#e8c35e;">received</strong>. Our team will contact you shortly.
          </p>
        </td></tr>
        <tr><td>${ticket}</td></tr>
        <tr><td style="padding:0 20px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.04);border:1px solid rgba(232,195,94,0.2);border-radius:10px;overflow:hidden;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 14px;font-size:11px;letter-spacing:4px;color:#e8c35e;text-transform:uppercase;">Booking Details</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${detailRow('Full Name', name)}
                ${detailRow('Email', email)}
                ${detailRow('Budget', budget)}
                ${detailRow('Type', type.replace('onsite','On-Site').replace('phone','Phone Call').toUpperCase())}
                ${detailRow('Date', date)}
                ${detailRow('Time', time_slot)}
                ${detailRow('Ref Code', ref_code)}
              </table>
            </td></tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding:24px 20px 0;border-top:1px solid rgba(255,255,255,0.08);">
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.25);letter-spacing:2px;text-transform:uppercase;">© ${new Date().getFullYear()} BT-ADV — All rights reserved</p>
        </td></tr>`);

      const adminHtml = wrapEmail(`
        <tr><td align="center" style="padding-bottom:24px;">
          <div style="display:inline-block;background:#e8c35e;color:#00203c;font-size:11px;font-weight:800;letter-spacing:5px;text-transform:uppercase;padding:6px 18px;border-radius:99px;margin-bottom:14px;">🎬 New Booking Alert</div>
          <h2 style="margin:0;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:2px;text-transform:uppercase;">Booking Received</h2>
        </td></tr>
        <tr><td>${ticket}</td></tr>
        <tr><td style="padding:0 20px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.04);border:1px solid rgba(232,195,94,0.3);border-radius:10px;overflow:hidden;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 14px;font-size:11px;letter-spacing:4px;color:#e8c35e;text-transform:uppercase;">Client Information</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${detailRow('Name', name)}
                ${detailRow('Email', `<a href="mailto:${email}" style="color:#e8c35e;text-decoration:none;">${email}</a>`)}
                ${detailRow('Phone', `<a href="tel:${phone}" style="color:#e8c35e;text-decoration:none;">${phone}</a>`)}
                ${detailRow('Budget', budget)}
                ${detailRow('Type', type.replace('onsite','On-Site').replace('phone','Phone Call').toUpperCase())}
                ${detailRow('Date & Time', `${date} at ${time_slot}`)}
                ${detailRow('Ref Code', ref_code)}
              </table>
            </td></tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding:0 20px 32px;">
          <a href="mailto:${email}" style="display:inline-block;background:#e8c35e;color:#00203c;font-size:13px;font-weight:800;letter-spacing:3px;text-transform:uppercase;padding:14px 36px;border-radius:8px;text-decoration:none;">Reply to Client</a>
        </td></tr>`);

      await Promise.allSettled([
        resend.emails.send({
          from: `BT Advertising <${FROM_EMAIL}>`,
          to:   [clientDest],
          subject: `🎬 Your Booking Confirmed — BT-ADV (${ref_code})`,
          html: clientHtml,
        }),
        resend.emails.send({
          from: `BT Booking System <${FROM_EMAIL}>`,
          to:   [ADMIN_EMAIL],
          subject: `🎟 New Booking: ${name} — ${date} ${time_slot}`,
          html: adminHtml,
        }),
      ]);
    } else {
      console.warn('[booking] RESEND_API_KEY not set — emails skipped');
    }

    // ── 3. Return success ─────────────────────────────────────────────────────
    return NextResponse.json({ success: true, ref_code });

  } catch (err: any) {
    console.error('[POST /api/booking] unexpected:', err);
    return NextResponse.json({ error: 'Internal server error', details: err?.message }, { status: 500 });
  }
}
