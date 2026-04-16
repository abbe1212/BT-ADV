/**
 * In-memory rate limiter
 * ─────────────────────────────────────────────────────────────────────────────
 * Works for local dev and single-process deployments.
 *
 * ⚠️  For multi-instance / Vercel Edge deployments, replace the `store` Map
 *     with @upstash/ratelimit + @upstash/redis for shared state across pods.
 *
 * Usage:
 *   const result = rateLimit(ip, { limit: 5, windowMs: 60_000 });
 *   if (!result.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// Module-level store — persists across requests within the same Node.js process.
const store = new Map<string, RateLimitRecord>();

// Clean up expired entries every 5 minutes to prevent memory leaks.
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store) {
    if (now > record.resetAt) store.delete(key);
  }
}, 5 * 60 * 1_000);

export interface RateLimitOptions {
  /** Max requests allowed in the window. */
  limit: number;
  /** Window duration in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  /** Remaining requests allowed in the current window. */
  remaining: number;
  /** Seconds until the window resets. */
  retryAfter: number;
}

export function rateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const record = store.get(key);

  // First request or window expired → start a fresh window.
  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, retryAfter: 0 };
  }

  // Over limit.
  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      retryAfter: Math.ceil((record.resetAt - now) / 1_000),
    };
  }

  // Within limit — increment.
  record.count++;
  return {
    success: true,
    remaining: limit - record.count,
    retryAfter: 0,
  };
}

/**
 * Extract the real client IP from a Next.js Request.
 * Prefers the Vercel / Cloudflare forwarded header over the raw socket IP.
 */
export function getClientIp(request: Request): string {
  const forwarded = (request.headers as Headers).get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}
