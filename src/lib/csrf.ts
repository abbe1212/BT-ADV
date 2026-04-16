/**
 * CSRF Protection — Double Submit Cookie Pattern
 * ─────────────────────────────────────────────────────────────────────────────
 * How it works:
 *  1. Middleware sets a `csrf-token` cookie on every non-API GET request.
 *  2. Client-side forms read the cookie and send it as the `X-CSRF-Token` header.
 *  3. API route handlers call `verifyCsrfToken(req)` — it checks that the
 *     header value matches the cookie value.
 *  4. An attacker on another origin cannot read your cookies via JS (SameSite),
 *     so they can never know the token value to forge a request.
 *
 * Token generation:
 *  - Uses `crypto.randomUUID()` — Node.js built-in, no dependency needed.
 *  - Rotated once per page-load (middleware), NOT per request, for performance.
 *
 * Cookie settings:
 *  - HttpOnly: false  → frontend JS needs to read it
 *  - SameSite: Lax    → blocks CSRF from cross-origin while allowing nav links
 *  - Secure: true     → HTTPS only (set via env)
 *  - Path: /          → valid for all routes
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const CSRF_COOKIE = 'csrf-token';
export const CSRF_HEADER = 'x-csrf-token';

/** Generates a cryptographically random CSRF token. */
export function generateCsrfToken(): string {
  return crypto.randomUUID();
}

/**
 * Reads the CSRF token from the request cookie and compares it to
 * the `X-CSRF-Token` header. Returns true if they match.
 *
 * Usage in API route handlers:
 * ```ts
 * const csrf = verifyCsrfToken(req);
 * if (!csrf) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 * ```
 */
export function verifyCsrfToken(req: Request): boolean {
  // Read the token from the cookie header
  const cookieHeader = req.headers.get('cookie') ?? '';
  const tokenFromCookie = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${CSRF_COOKIE}=`))
    ?.split('=')[1];

  // Read the token from the custom header
  const tokenFromHeader = req.headers.get(CSRF_HEADER);

  if (!tokenFromCookie || !tokenFromHeader) return false;

  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(tokenFromCookie, tokenFromHeader);
}

/**
 * Primitive constant-time string comparison.
 * Prevents timing side-channel attacks when comparing tokens.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
