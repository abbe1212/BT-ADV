# Caching Strategy — Admin Dashboard

> Documenting all intentional Next.js caching decisions for the `/app/admin/` route segment.
> Reviewed as part of Phase 3: Performance & Data Layer.

---

## Philosophy

Every server component in this app fetches live data from Supabase. We apply explicit cache directives to:
- **Prevent stale data** on pages where freshness is critical (bookings, messages).
- **Reduce DB reads** on pages that change infrequently (settings, team, services).
- **Eliminate accidental caching** by being intentional rather than relying on Next.js defaults.

---

## Cache Directives by Route

| Route | Directive | Rationale |
|---|---|---|
| `/admin` (Dashboard) | `dynamic = 'force-dynamic'` | Live booking counts, unread message badges — stale data = incorrect KPIs |
| `/admin/bookings` | `dynamic = 'force-dynamic'` | Admins act on bookings in real-time; stale status causes operational errors |
| `/admin/messages` | `dynamic = 'force-dynamic'` | Unread badge and message list must be fresh at all times |
| `/admin/admins` | `dynamic = 'force-dynamic'` | User role changes must take effect immediately |
| `/admin/works` | `dynamic = 'force-dynamic'` | Pagination and search params are read from `searchParams`, requiring per-request render |
| `/admin/settings` | `revalidate = 60` | Site-wide settings rarely change; 60s ISR balances freshness & DB load |
| `/admin/team` | `revalidate = 60` | Team roster changes infrequently; acceptable 60s window |
| `/admin/services` | `revalidate = 60` | Service descriptions are stable content |
| `/admin/pricing` | `revalidate = 60` | Pricing packages change on human timescales, not seconds |
| `/admin/careers` | `revalidate = 60` | Job listings are low-frequency updates |
| `/admin/bts` | `revalidate = 60` | Behind-the-scenes media is managed deliberately, not in real-time |
| `/admin/clients` | `revalidate = 60` | Client logos are stable; rare updates |

---

## Supplementary Real-Time Layer

Pages with `dynamic = 'force-dynamic'` (bookings, dashboard) additionally subscribe to **Supabase Realtime** via `useRealtimeSubscription()`. This means:

1. The **initial page load** is always fresh (server-side fetch, no cache).
2. **Incremental updates** (INSERT/UPDATE/DELETE) are pushed by Supabase Postgres Changes and applied to local state without a full page reload.
3. The combination delivers sub-second UI updates without relying on polling.

---

## What `revalidate = 60` Actually Means

With ISR (Incremental Static Regeneration):
- The first request after the 60s window triggers a **background re-fetch** from Supabase.
- Subsequent requests within the window are served from the cached version.
- The admin will see stale data for **at most 60 seconds** after a change — acceptable for stable content.
- For immediate freshness after an admin mutation, `router.refresh()` is called from client components to bust the cache manually.

---

## Future Improvements

- [ ] Consider on-demand revalidation using Next.js **Route Handlers** + `revalidatePath()` after form submissions (instead of relying on TTL).
- [ ] Add a `Cache-Control` header strategy for the public-facing `/works` page (currently no explicit directive).
- [ ] Investigate Supabase Edge Functions for cache invalidation webhooks on write operations.
