import { NextResponse } from 'next/server';
import { generateCsrfToken, CSRF_COOKIE } from '@/lib/csrf';

/**
 * GET /api/csrf
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns the active CSRF token for this session.
 *
 * If a `csrf-token` cookie is already present in the request (set by the
 * middleware on a prior page GET), we echo it back unchanged so the cookie
 * and header stay in sync.
 *
 * If no cookie exists yet (e.g. a programmatic client like k6 that skips
 * page loads), we generate a fresh token, set it as a cookie, and return
 * it in the JSON body — all in one round-trip.
 *
 * ─── Why this exists ────────────────────────────────────────────────────────
 * k6's named cookie jars have inconsistent behaviour when parsing multiple
 * Set-Cookie headers from Next.js page routes (middleware sets csrf-token;
 * Supabase SSR sets its own auth cookies in the same response).  Reading the
 * token from a JSON body is completely reliable.
 *
 * ─── Security note ──────────────────────────────────────────────────────────
 * This does NOT weaken the double-submit cookie pattern.  CSRF protection
 * relies on the browser's SameSite=Lax restriction: an attacker on another
 * origin cannot read the victim's cookies, so they cannot forge the echo.
 * Exposing the token in a JSON body only matters when the caller CAN already
 * read the response — i.e., same-origin or a trusted programmatic client.
 */
export async function GET(req: Request) {
  // Read the existing token from the incoming Cookie header (if any).
  const cookieHeader  = req.headers.get('cookie') ?? '';
  const existingToken = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${CSRF_COOKIE}=`))
    ?.split('=')[1];

  const token = existingToken ?? generateCsrfToken();

  const res = NextResponse.json({ token });

  // Always (re-)set the cookie so k6's jar captures it from this response,
  // even if the token already existed (idempotent — same value).
  res.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false,            // must be JS-readable by client forms
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,      // 24 hours — matches middleware setting
  });

  return res;
}
