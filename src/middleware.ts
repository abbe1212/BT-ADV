import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { generateCsrfToken, CSRF_COOKIE } from '@/lib/csrf';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // ── CSRF cookie ───────────────────────────────────────────────────────────
  // Set a csrf-token cookie on every GET request that isn't an API call.
  // Frontend forms read this cookie and attach it as X-CSRF-Token header.
  // POST/PUT/DELETE API routes then verify header === cookie.
  const isGetRequest = request.method === 'GET';
  const isApiRoute   = request.nextUrl.pathname.startsWith('/api');
  const hasCsrfCookie = request.cookies.has(CSRF_COOKIE);

  if (isGetRequest && !isApiRoute && !hasCsrfCookie) {
    response.cookies.set(CSRF_COOKIE, generateCsrfToken(), {
      httpOnly: false,     // must be readable by client JS
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Verify the session and get the authenticated user.
  // getUser() validates the JWT with Supabase every time (required for security).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Login page is always accessible.
    if (request.nextUrl.pathname === '/admin/login') {
      return response;
    }

    // No session → redirect to login.
    if (!user) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // ── Role check ─────────────────────────────────────────────────────────────
    // Strategy: read role from JWT app_metadata first (zero extra DB round-trip).
    //
    // To enable this, register the Postgres function below as a
    // "Custom Access Token" hook in:
    //   Supabase Dashboard → Authentication → Hooks → Custom Access Token Hook
    //
    // SQL (also included in supabase-security-fixes.sql):
    //
    //   CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
    //   RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
    //   DECLARE role_val text;
    //   BEGIN
    //     SELECT role INTO role_val FROM public.user_roles
    //     WHERE user_id = (event->>'user_id')::uuid LIMIT 1;
    //     IF role_val IS NOT NULL THEN
    //       event := jsonb_set(event, '{claims,app_metadata,role}', to_jsonb(role_val));
    //     END IF;
    //     RETURN event;
    //   END $$;
    //
    // Once the hook is active, new JWT tokens will carry the role in app_metadata
    // and the DB fallback below will never be reached.
    // ──────────────────────────────────────────────────────────────────────────

    // 1. Try reading role from JWT claims (no DB hit).
    const jwtRole = (user.app_metadata as Record<string, unknown>)?.role as string | undefined;

    if (jwtRole && ['admin', 'super_admin'].includes(jwtRole)) {
      return response; // ✅ Role confirmed via JWT — no DB query needed.
    }

    // 2. Fallback: JWT doesn't have the role yet (hook not registered, or old token).
    //    Query the DB exactly once and let the response proceed.
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || !['admin', 'super_admin'].includes(roleData.role)) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/booking',
    '/contact',
  ],
};

