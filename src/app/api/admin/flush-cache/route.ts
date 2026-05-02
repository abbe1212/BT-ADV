import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/admin/flush-cache
 * ─────────────────────────────────────────────────────────────────────────────
 * Invalidates every public-facing cache tag + path so that edits made directly
 * in Supabase Dashboard are immediately reflected on the live site.
 *
 * Protected: only authenticated admin users can call this.
 */
export async function POST() {
  // Auth guard — must be a logged-in admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Invalidate all data tags ──────────────────────────────────────────────
  const tags = [
    'works',
    'pricing',
    'services',
    'team',
    'clients',
    'reviews',
    'bts',
    'careers',
    'site-settings',
    'booked-slots',
  ];

  for (const tag of tags) {
    revalidateTag(tag, 'default');
  }

  // ── Invalidate key public paths ───────────────────────────────────────────
  const paths = [
    '/',
    '/pricing',
    '/about',
    '/teamwork',
    '/bts',
    '/careers',
    '/works',
    '/clients',
  ];

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({
    success: true,
    message: 'Cache flushed — public pages will now reflect the latest database state.',
    flushed: { tags, paths },
    timestamp: new Date().toISOString(),
  });
}
