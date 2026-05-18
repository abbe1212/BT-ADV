/**
 * Admin Auth Guard — shared helper for API route handlers
 * ─────────────────────────────────────────────────────────────────────────────
 * Verifies that the incoming request is made by an authenticated admin user.
 * Returns `{ user, error }` — if `error` is set the caller should return it
 * immediately as an HTTP response.
 *
 * Strategy (matches middleware.ts):
 *  1. Validate session with Supabase (getUser — required, validates JWT).
 *  2. Read role from JWT app_metadata first (zero DB hit if hook is active).
 *  3. Fallback to user_roles DB check if JWT doesn't carry the role yet.
 *
 * Usage in any API route:
 * ```ts
 * const guard = await requireAdmin(req);
 * if (guard.error) return guard.error;
 * // guard.user is the authenticated admin
 * ```
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextResponse } from 'next/server';
import { createClient } from './server';

export interface AdminGuardSuccess {
  error: null;
  user: { id: string; email?: string };
}

export interface AdminGuardFailure {
  error: Response;
  user: null;
}

export type AdminGuardResult = AdminGuardSuccess | AdminGuardFailure;

/**
 * Verifies the request is from an authenticated admin.
 * Call at the top of any admin-only API route handler.
 */
export async function requireAdmin(): Promise<AdminGuardResult> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        error: NextResponse.json(
          { error: 'Authentication required.' },
          { status: 401 }
        ) as unknown as Response,
        user: null,
      };
    }

    // 1. Try JWT app_metadata first (no DB hit when hook is active)
    const jwtRole = (user.app_metadata as Record<string, unknown>)?.role as string | undefined;
    if (jwtRole && ['admin', 'super_admin'].includes(jwtRole)) {
      return { error: null, user: { id: user.id, email: user.email } };
    }

    // 2. Fallback: query user_roles (hook not yet registered or old token)
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || !['admin', 'super_admin'].includes(roleData.role)) {
      return {
        error: NextResponse.json(
          { error: 'Admin access required.' },
          { status: 403 }
        ) as unknown as Response,
        user: null,
      };
    }

    return { error: null, user: { id: user.id, email: user.email } };
  } catch (err) {
    console.error('[requireAdmin] unexpected error:', err);
    return {
      error: NextResponse.json(
        { error: 'Internal server error during auth check.' },
        { status: 500 }
      ) as unknown as Response,
      user: null,
    };
  }
}
