/**
 * Supabase Anon Client — for public server-side reads
 * ─────────────────────────────────────────────────────────────────────────────
 * This client uses only the anon key and does NOT touch cookies or request
 * headers. It is safe to call inside `unstable_cache()` because it has
 * no dependency on dynamic data sources (cookies, headers, etc.).
 *
 * Use this ONLY for:
 *  - Public read queries wrapped in unstable_cache (getWorks, getPricing, etc.)
 *  - Data that is governed by RLS using the anon role
 *
 * Do NOT use it for:
 *  - Admin mutations (use createClient from ./server instead)
 *  - Auth-gated queries (use createClient from ./server)
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

let _anonClient: ReturnType<typeof createSupabaseClient> | null = null;

/**
 * Returns a singleton Supabase client using only the anon key.
 * Safe to call inside unstable_cache — no cookies, no dynamic headers.
 */
export function createAnonClient() {
  if (_anonClient) return _anonClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('[createAnonClient] Missing Supabase env vars');
  }

  _anonClient = createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return _anonClient;
}
