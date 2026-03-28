import { NextResponse } from 'next/server';
import { Resend } from 'resend';

/* ─── Cinema Ticket Email Templates ─────────────────────────────────────── */

function formatDate(date: string) {
  const d = new Date(date);
  return {
    day:      d.toLocaleDateString('en-GB', { day: '2-digit' }),
    month:    d.toLocaleDateString('en-GB', { month: 'long' }),
    year:     d.toLocaleDateString('en-GB', { year: 'numeric' }),
    time:     d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    full:     d.toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' }),
  };
}

function generateTicketNumber() {
  return `BT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
}

/* ─── Shared ticket HTML block (used in both emails) ─────────────────────── */
function ticketBlock(fullName: string, date: string, meetingType: string, ticketNum: string, note?: string) {
  const d = formatDate(date);
  const typeLabel = meetingType.replace(/_/g, ' ').toUpperCase();

  return `
  <!-- Ticket Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:32px 0;">
    <tr>
      <td align="center">
        <!-- Outer ticket frame -->
        <table cellpadding="0" cellspacing="0" role="presentation"
          style="width:600px; max-width:100%; background-color:#e8c35e;
                 border-radius:12px; overflow:hidden;
                 box-shadow:0 8px 40px rgba(0,0,0,0.5);
                 font-family:'Courier New',Courier,monospace;">

          <!-- TOP PUNCH HOLES strip -->
          <tr>
            <td style="height:18px; background:repeating-linear-gradient(
              90deg,
              transparent 0px, transparent 14px,
              #00203c 14px, #00203c 30px
            );"></td>
          </tr>

          <!-- MAIN CONTENT ROW -->
          <tr>
            <!-- LEFT MAIN SECTION -->
            <td style="width:420px; padding:28px 30px 24px 36px; vertical-align:top; border-right:3px dashed rgba(0,32,60,0.4);">

              <!-- Agency name / header -->
              <p style="margin:0 0 4px 0; font-size:11px; letter-spacing:5px; color:#00203c; opacity:0.7; text-transform:uppercase;">
                Band Trend Advertising
              </p>
              <h1 style="margin:0 0 16px 0; font-size:30px; font-weight:900; letter-spacing:6px; color:#00203c; text-transform:uppercase; line-height:1;">
                BOOKING TICKET
              </h1>

              <!-- Divider -->
              <div style="height:2px; background:#00203c; opacity:0.25; margin-bottom:20px;"></div>

              <!-- Client info row -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:18px;">
                <tr>
                  <td style="width:50%; vertical-align:top; padding-right:12px;">
                    <p style="margin:0; font-size:9px; letter-spacing:3px; color:#00203c; opacity:0.6; text-transform:uppercase; margin-bottom:4px;">PASSENGER</p>
                    <p style="margin:0; font-size:15px; font-weight:800; color:#00203c; text-transform:uppercase; letter-spacing:1px;">${fullName}</p>
                  </td>
                  <td style="width:50%; vertical-align:top; padding-left:12px; border-left:2px dashed rgba(0,32,60,0.3);">
                    <p style="margin:0; font-size:9px; letter-spacing:3px; color:#00203c; opacity:0.6; text-transform:uppercase; margin-bottom:4px;">SESSION TYPE</p>
                    <p style="margin:0; font-size:13px; font-weight:800; color:#00203c; text-transform:uppercase; letter-spacing:1px;">${typeLabel}</p>
                  </td>
                </tr>
              </table>

              <!-- Date & Time -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:18px;">
                <tr>
                  <td style="width:33%; vertical-align:top;">
                    <p style="margin:0; font-size:9px; letter-spacing:3px; color:#00203c; opacity:0.6; text-transform:uppercase; margin-bottom:4px;">DATE</p>
                    <p style="margin:0; font-size:22px; font-weight:900; color:#00203c; line-height:1;">${d.day}</p>
                    <p style="margin:0; font-size:11px; font-weight:700; color:#00203c; text-transform:uppercase; letter-spacing:2px;">${d.month} ${d.year}</p>
                  </td>
                  <td style="width:4%; vertical-align:middle; text-align:center; padding:0 4px;">
                    <div style="height:40px; width:2px; border-left:2px dashed rgba(0,32,60,0.4); margin:auto;"></div>
                  </td>
                  <td style="width:30%; vertical-align:top;">
                    <p style="margin:0; font-size:9px; letter-spacing:3px; color:#00203c; opacity:0.6; text-transform:uppercase; margin-bottom:4px;">TIME</p>
                    <p style="margin:0; font-size:28px; font-weight:900; color:#00203c; line-height:1; letter-spacing:2px;">${d.time}</p>
                  </td>
                  <td style="width:4%; vertical-align:middle; text-align:center; padding:0 4px;">
                    <div style="height:40px; width:2px; border-left:2px dashed rgba(0,32,60,0.4); margin:auto;"></div>
                  </td>
                  <td style="width:29%; vertical-align:top;">
                    <p style="margin:0; font-size:9px; letter-spacing:3px; color:#00203c; opacity:0.6; text-transform:uppercase; margin-bottom:4px;">TICKET NO.</p>
                    <p style="margin:0; font-size:11px; font-weight:900; color:#00203c; letter-spacing:1px;">${ticketNum}</p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div style="height:2px; background:#00203c; opacity:0.2; margin-bottom:14px;"></div>

              <!-- Footer note -->
              <p style="margin:0; font-size:9px; letter-spacing:2px; color:#00203c; opacity:0.55; text-transform:uppercase;">
                Our team will confirm & contact you — BT Agency © ${d.year}
              </p>
            </td>

            <!-- RIGHT STUB SECTION -->
            <td style="width:180px; padding:24px 16px; vertical-align:middle; text-align:center; background:rgba(0,32,60,0.08);">
              <!-- Rotated stub text via stacked table approach -->
              <p style="margin:0 0 12px 0; font-size:9px; letter-spacing:4px; color:#00203c; opacity:0.6; text-transform:uppercase;">✂ TEAR HERE</p>
              <div style="height:2px; background:rgba(0,32,60,0.2); margin-bottom:16px;"></div>
              <p style="margin:0 0 6px 0; font-size:20px; font-weight:900; color:#00203c; letter-spacing:4px; text-transform:uppercase;">BT</p>
              <p style="margin:0 0 6px 0; font-size:10px; font-weight:700; color:#00203c; letter-spacing:3px; text-transform:uppercase;">AGENCY</p>
              <div style="height:2px; background:rgba(0,32,60,0.2); margin:14px 0;"></div>
              <p style="margin:0 0 4px 0; font-size:9px; letter-spacing:2px; color:#00203c; opacity:0.7; text-transform:uppercase;">SEAT</p>
              <p style="margin:0; font-size:26px; font-weight:900; color:#00203c;">A1</p>
              <div style="height:2px; background:rgba(0,32,60,0.2); margin:14px 0;"></div>
              <!-- Barcode-like decoration -->
              <div style="display:flex; justify-content:center; gap:2px; margin-top:8px; text-align:center;">
                <div style="font-family:monospace; font-size:5px; color:#00203c; opacity:0.5; letter-spacing:1px; word-break:break-all; max-width:120px; line-height:1.6;">
                  ||||| |||| ||||| ||| ||||| ||<br/>
                  ${ticketNum}<br/>
                  ||||| |||| ||||| ||| |||||
                </div>
              </div>
            </td>
          </tr>

          <!-- BOTTOM PUNCH HOLES strip -->
          <tr>
            <td style="height:18px; background:repeating-linear-gradient(
              90deg,
              transparent 0px, transparent 14px,
              #00203c 14px, #00203c 30px
            );"></td>
          </tr>
        </table>
        ${note ? `<p style="margin:12px auto 0; max-width:600px; font-size:11px; color:rgba(255,255,255,0.35); text-align:center; font-family:'Courier New',monospace;">${note}</p>` : ''}
      </td>
    </tr>
  </table>
  `;
}

/* ─── CLIENT email template ──────────────────────────────────────────────── */
function clientEmailHtml(fullName: string, email: string, date: string, meetingType: string, ticketNum: string, isTesting: boolean) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your BT Booking Confirmation</title></head>
<body style="margin:0; padding:0; background-color:#00203c; font-family:'Helvetica Neue',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#00203c; min-height:100vh;">
    <tr><td align="center" style="padding:40px 16px 60px;">

      <!-- Container -->
      <table width="640" cellpadding="0" cellspacing="0" role="presentation" style="max-width:100%;">

        <!-- HEADER -->
        <tr>
          <td align="center" style="padding-bottom:32px;">
            <p style="margin:0; font-size:11px; letter-spacing:6px; color:#e8c35e; text-transform:uppercase; opacity:0.8;">Band Trend Advertising Agency</p>
            <h2 style="margin:8px 0 0; font-size:28px; font-weight:900; color:#ffffff; letter-spacing:3px; text-transform:uppercase;">Booking Confirmed</h2>
            <div style="width:60px; height:2px; background:#e8c35e; margin:14px auto 0;"></div>
          </td>
        </tr>

        <!-- GREETING -->
        <tr>
          <td style="padding:0 20px 4px;">
            <p style="margin:0; font-size:16px; color:rgba(255,255,255,0.85); line-height:1.7;">
              Hi <strong style="color:#e8c35e;">${fullName}</strong>,<br>
              Your booking request has been <strong style="color:#e8c35e;">successfully received</strong>. Here is your cinema-style ticket — our team will be in touch shortly to confirm the final details.
            </p>
          </td>
        </tr>

        <!-- CINEMA TICKET -->
        <tr><td>${ticketBlock(fullName, date, meetingType, ticketNum)}</td></tr>

        <!-- INFO PANEL -->
        <tr>
          <td style="padding:0 20px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
              style="background:rgba(255,255,255,0.04); border:1px solid rgba(232,195,94,0.2); border-radius:10px; overflow:hidden;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 14px; font-size:11px; letter-spacing:4px; color:#e8c35e; text-transform:uppercase;">Booking Details</p>
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    ${detailRow('Full Name', fullName)}
                    ${detailRow('Email', email)}
                    ${detailRow('Meeting Type', meetingType.replace(/_/g, ' ').toUpperCase())}
                    ${detailRow('Scheduled', new Date(date).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' }))}
                    ${detailRow('Ticket No.', ticketNum)}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td align="center" style="padding:24px 20px 0; border-top:1px solid rgba(255,255,255,0.08);">
            <p style="margin:0 0 6px; font-size:13px; color:rgba(255,255,255,0.5);">Questions? Reach us at <a href="mailto:hello@btadv.agency" style="color:#e8c35e; text-decoration:none;">hello@btadv.agency</a></p>
            <p style="margin:0; font-size:11px; color:rgba(255,255,255,0.25); letter-spacing:2px; text-transform:uppercase;">© ${new Date().getFullYear()} Band Trend Advertising — All rights reserved</p>
          </td>
        </tr>

        ${isTesting ? `<tr><td style="padding:16px 20px 0;"><p style="margin:0; font-size:10px; color:rgba(255,255,255,0.25); font-style:italic; text-align:center;">⚠ Testing mode: this email was redirected from ${email} to admin inbox.</p></td></tr>` : ''}

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ─── ADMIN email template ───────────────────────────────────────────────── */
function adminEmailHtml(fullName: string, email: string, mobile: string, date: string, meetingType: string, ticketNum: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New BT Booking</title></head>
<body style="margin:0; padding:0; background-color:#00203c; font-family:'Helvetica Neue',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#00203c; min-height:100vh;">
    <tr><td align="center" style="padding:40px 16px 60px;">

      <!-- Container -->
      <table width="640" cellpadding="0" cellspacing="0" role="presentation" style="max-width:100%;">

        <!-- HEADER -->
        <tr>
          <td align="center" style="padding-bottom:24px;">
            <div style="display:inline-block; background:#e8c35e; color:#00203c; font-size:11px; font-weight:800; letter-spacing:5px; text-transform:uppercase; padding:6px 18px; border-radius:99px; margin-bottom:14px;">
              🎬 New Booking Alert
            </div>
            <h2 style="margin:0; font-size:26px; font-weight:900; color:#ffffff; letter-spacing:2px; text-transform:uppercase;">Booking Received</h2>
            <div style="width:60px; height:2px; background:#e8c35e; margin:12px auto 0;"></div>
          </td>
        </tr>

        <!-- CINEMA TICKET -->
        <tr><td>${ticketBlock(fullName, date, meetingType, ticketNum, undefined)}</td></tr>

        <!-- FULL CLIENT INFO PANEL -->
        <tr>
          <td style="padding:0 20px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
              style="background:rgba(255,255,255,0.04); border:1px solid rgba(232,195,94,0.3); border-radius:10px; overflow:hidden;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 14px; font-size:11px; letter-spacing:4px; color:#e8c35e; text-transform:uppercase;">Client Information</p>
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    ${detailRow('Full Name', fullName)}
                    ${detailRow('Email', `<a href="mailto:${email}" style="color:#e8c35e;text-decoration:none;">${email}</a>`)}
                    ${detailRow('Mobile', `<a href="tel:${mobile}" style="color:#e8c35e;text-decoration:none;">${mobile}</a>`)}
                    ${detailRow('Meeting Type', meetingType.replace(/_/g, ' ').toUpperCase())}
                    ${detailRow('Date & Time', new Date(date).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' }))}
                    ${detailRow('Ticket No.', ticketNum)}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td align="center" style="padding:0 20px 32px;">
            <a href="mailto:${email}" style="display:inline-block; background:#e8c35e; color:#00203c; font-size:13px; font-weight:800; letter-spacing:3px; text-transform:uppercase; padding:14px 36px; border-radius:8px; text-decoration:none;">
              Reply to Client
            </a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td align="center" style="padding:24px 20px 0; border-top:1px solid rgba(255,255,255,0.08);">
            <p style="margin:0; font-size:11px; color:rgba(255,255,255,0.25); letter-spacing:2px; text-transform:uppercase;">BT Agency Admin Dashboard — Internal Use Only</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ─── Helper: single info row ────────────────────────────────────────────── */
function detailRow(label: string, value: string) {
  return `
  <tr>
    <td style="padding:7px 0; border-bottom:1px solid rgba(255,255,255,0.06); width:38%; vertical-align:top;">
      <span style="font-size:10px; letter-spacing:3px; color:rgba(255,255,255,0.4); text-transform:uppercase;">${label}</span>
    </td>
    <td style="padding:7px 0 7px 16px; border-bottom:1px solid rgba(255,255,255,0.06); vertical-align:top;">
      <span style="font-size:13px; color:#ffffff; font-weight:600;">${value}</span>
    </td>
  </tr>`;
}

/* ─── Route Handler ──────────────────────────────────────────────────────── */
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { fullName, email, mobile, date, meetingType } = data;

    const resend = new Resend(process.env.RESEND_API_KEY || process.env.SENDER_API_TOKEN);
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hello@btadv.agency";
    const FROM_EMAIL  = process.env.FROM_EMAIL  || "onboarding@resend.dev";

    if (!process.env.RESEND_API_KEY && !process.env.SENDER_API_TOKEN) {
      console.warn("RESEND_API_KEY is not configured.");
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({ success: true, mocked: true });
      }
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
    }

    const isTesting         = FROM_EMAIL === "onboarding@resend.dev";
    const clientDestination = isTesting ? ADMIN_EMAIL : email;
    const ticketNum         = generateTicketNumber();

    const [clientRes, adminRes] = await Promise.all([
      resend.emails.send({
        from:    `BT Advertising <${FROM_EMAIL}>`,
        to:      [clientDestination],
        subject: `🎬 Your Booking Ticket — BT Advertising Agency`,
        html:    clientEmailHtml(fullName, email, date, meetingType, ticketNum, isTesting),
      }),
      resend.emails.send({
        from:    `BT Booking System <${FROM_EMAIL}>`,
        to:      [ADMIN_EMAIL],
        subject: `🎟 New Booking: ${fullName} — ${new Date(date).toLocaleDateString('en-GB')}`,
        html:    adminEmailHtml(fullName, email, mobile, date, meetingType, ticketNum),
      }),
    ]);

    if (clientRes.error || adminRes.error) {
      console.error("Resend API Errors:", clientRes.error, adminRes.error);
      throw new Error(clientRes.error?.message || adminRes.error?.message || "Failed to send");
    }

    return NextResponse.json({ success: true, clientRes, adminRes });

  } catch (error: any) {
    console.error("Booking submission error:", error);
    return NextResponse.json(
      { error: "Failed to process booking", details: error?.message },
      { status: 500 }
    );
  }
}
