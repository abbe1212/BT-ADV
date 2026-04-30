/**
 * Rate Limiter — Production-safe via Upstash Redis
 * ─────────────────────────────────────────────────────────────────────────────
 * Strategy: dual-mode
 *   • Production (Vercel): uses @upstash/ratelimit + @upstash/redis for shared
 *     state across all serverless function instances / edge replicas.
 *   • Local dev (no UPSTASH_REDIS_REST_URL set): falls back to an in-memory Map,
 *     which is sufficient for a single-process dev server.
 *
 * Required environment variables (add to Vercel project settings + .env.local):
 *   UPSTASH_REDIS_REST_URL   — from your Upstash console (REST API URL)
 *   UPSTASH_REDIS_REST_TOKEN — from your Upstash console (REST API token)
 *
 * Setup:
 *   1. Create a free Redis database at https://console.upstash.com
 *   2. Copy the REST URL and token into your env vars above.
 *   3. That's it — no code changes needed.
 */

export interface RateLimitResult {
  /** Whether the request is allowed to proceed. */
  success: boolean;
  /** Remaining requests allowed in the current window. */
  remaining: number;
  /** Seconds until the window resets (0 if not rate-limited). */
  retryAfter: number;
}

// ─── Upstash implementation ───────────────────────────────────────────────────

/**
 * Creates a sliding-window rate limiter backed by Upstash Redis.
 * Lazily initialised so the import doesn't break local dev without env vars.
 */
async function upstashRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const { Ratelimit } = await import('@upstash/ratelimit');
  const { Redis } = await import('@upstash/redis');

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const ratelimit = new Ratelimit({
    redis,
    // Sliding window = fair per-user enforcement that doesn't allow burst at window boundary.
    limiter: Ratelimit.slidingWindow(limit, `${windowMs / 1000} s`),
    prefix: 'bt-adv:rl',
  });

  const result = await ratelimit.limit(key);

  return {
    success: result.success,
    remaining: result.remaining,
    retryAfter: result.success ? 0 : Math.ceil((result.reset - Date.now()) / 1_000),
  };
}

// ─── In-memory fallback (local dev only) ─────────────────────────────────────

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

// Clean up expired entries every 5 minutes to prevent memory growth.
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store) {
    if (now > record.resetAt) store.delete(key);
  }
}, 5 * 60 * 1_000);

function inMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      retryAfter: Math.ceil((record.resetAt - now) / 1_000),
    };
  }

  record.count++;
  return { success: true, remaining: limit - record.count, retryAfter: 0 };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface RateLimitOptions {
  /** Max requests allowed in the window. */
  limit: number;
  /** Window duration in milliseconds. */
  windowMs: number;
}

/**
 * Rate-limits a key using Upstash Redis in production, in-memory in local dev.
 * Automatically selects the correct backend based on environment variables.
 *
 * @example
 * const result = await rateLimit(`booking:${ip}`, { limit: 5, windowMs: 10 * 60 * 1_000 });
 * if (!result.success) {
 *   return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 * }
 */
export async function rateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions
): Promise<RateLimitResult> {
  const hasUpstash =
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN;

  if (hasUpstash) {
    try {
      return await upstashRateLimit(key, limit, windowMs);
    } catch (err) {
      // If Upstash is temporarily unreachable, fall back to in-memory rather
      // than blocking all requests — log loudly so the issue is visible.
      console.error('[rateLimit] Upstash unavailable, falling back to in-memory:', err);
      return inMemoryRateLimit(key, limit, windowMs);
    }
  }

  // Local dev: use in-memory store.
  return inMemoryRateLimit(key, limit, windowMs);
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
