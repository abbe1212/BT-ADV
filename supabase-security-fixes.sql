-- ============================================================================
-- BT Agency — Phase 1 Security Fixes
-- ============================================================================
-- Run these statements in the Supabase SQL Editor (Dashboard → SQL Editor).
-- They are idempotent: safe to run multiple times.
-- ============================================================================


-- ─── Fix 1: Drop the over-broad bookings SELECT policy ──────────────────────
--
-- PROBLEM: "bookings_user_select" allowed ANY authenticated user to read ALL
-- bookings (every customer's name, email, phone, budget). This is a data
-- privacy / GDPR violation.
--
-- The existing "bookings_admin_select" policy already gives admins full access.
-- We only drop the one that is too permissive.

DROP POLICY IF EXISTS "bookings_user_select" ON public.bookings;


-- ─── Fix 2: Harden is_admin() SECURITY DEFINER function ─────────────────────
--
-- PROBLEM: SECURITY DEFINER functions run as the function owner (superuser).
-- Without a locked search_path, a malicious schema or search-path exploit
-- could inject a fake user_roles table and bypass the admin check.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = public;   -- ← locks the search path to prevent injection


-- ─── Verification queries (run after applying fixes) ────────────────────────

-- Should return 0 rows (policy is gone):
-- SELECT policyname FROM pg_policies
-- WHERE tablename = 'bookings' AND policyname = 'bookings_user_select';

-- Should show prosecdef = true AND proconfig contains search_path:
-- SELECT proname, prosecdef, proconfig
-- FROM pg_proc
-- WHERE proname = 'is_admin' AND pronamespace = 'public'::regnamespace;


-- ============================================================================
-- Performance Fix 1: Single-query dashboard stats RPC
-- ============================================================================
-- Replaces 8 separate HTTP round-trips with one Postgres function call.
-- getDashboardStats() in queries.ts calls supabase.rpc('get_dashboard_stats').

CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS json
LANGUAGE sql
STABLE                       -- result is consistent within a transaction
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total_bookings',     COUNT(*)::int,
    'pending_bookings',   COUNT(*) FILTER (WHERE status = 'pending')::int,
    'this_month_bookings',COUNT(*) FILTER (WHERE created_at >= date_trunc('month', now()))::int,
    'last_month_bookings',COUNT(*) FILTER (
        WHERE created_at >= date_trunc('month', now() - interval '1 month')
          AND created_at <  date_trunc('month', now())
      )::int,
    'new_messages',  (SELECT COUNT(*)::int FROM public.contact_messages WHERE is_read = false),
    'phone_bookings', COUNT(*) FILTER (WHERE type = 'phone')::int,
    'zoom_bookings',  COUNT(*) FILTER (WHERE type = 'zoom')::int,
    'onsite_bookings',COUNT(*) FILTER (WHERE type = 'onsite')::int
  )
  FROM public.bookings;
$$;

-- Grant execute to the anon and authenticated roles used by Supabase clients.
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO anon, authenticated;


-- ============================================================================
-- Performance Fix 2: Custom Access Token Hook — embed role in JWT
-- ============================================================================
-- This embeds the user's admin role into every JWT token at sign-in time.
-- The middleware reads it from app_metadata, eliminating the DB lookup per request.
--
-- After creating the function:
--   1. Go to Supabase Dashboard → Authentication → Hooks
--   2. Under "Custom Access Token", set the function to: public.custom_access_token_hook
--   3. Save. New logins will carry the role in app_metadata automatically.

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  role_val text;
BEGIN
  -- Look up this user's role from user_roles.
  SELECT role INTO role_val
  FROM public.user_roles
  WHERE user_id = (event->>'user_id')::uuid
  LIMIT 1;

  -- Embed the role into the token's app_metadata claim.
  -- If no role exists the claim is simply omitted (regular user).
  IF role_val IS NOT NULL THEN
    event := jsonb_set(
      event,
      '{claims,app_metadata,role}',
      to_jsonb(role_val)
    );
  END IF;

  RETURN event;
END;
$$;

-- Grant execute to the supabase_auth_admin role (required for Auth hooks).
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;

