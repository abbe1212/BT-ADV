# BT Agency - Supabase Setup Guide

## ⚠️ IMPORTANT: These steps must be completed before the admin panel will work!

The errors you're seeing are expected because the database hasn't been configured yet. Follow these steps to set up your Supabase project:

> **Note:** The SQL script has been updated to match your actual database schema. If you encountered errors before, the script is now fixed!

---

## 1. Apply RLS Policies

The RLS (Row Level Security) policies control who can read/write data. Without them, the admin panel cannot perform CRUD operations.

### Steps:
1. Open your Supabase dashboard
2. Go to **SQL Editor**
3. Open the file `supabase-rls-policies.sql` (in the root of this project)
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run**

### What this does:
- Enables RLS on all tables
- Allows public read access for frontend content (works, services, etc.)
- Allows public INSERT for bookings and contact messages
- **Requires admin authentication for all write operations**
- Enables realtime subscriptions for all tables
- Adds performance indexes
- Creates helper function `is_admin()` for role checking

---

## 2. Create Your Admin User

After applying RLS policies, you need to create an admin user. Otherwise, you won't be able to perform any admin operations.

### Steps:

#### Option A: Using Supabase Dashboard
1. Go to **Authentication** → **Users** in your Supabase dashboard
2. Note your user's UUID (or create a new user if needed)
3. Go to **SQL Editor**
4. Run this query (replace with your UUID):

```sql
-- Replace 'your-user-uuid-here' with your actual user UUID
INSERT INTO user_roles (user_id, role) 
VALUES ('your-user-uuid-here', 'super_admin');
```

#### Option B: Using SQL (Creating a new admin)
```sql
-- First, create a user via the Supabase Auth dashboard
-- Then get their UUID and run:
INSERT INTO user_roles (user_id, role, email) 
VALUES ('user-uuid-from-auth-dashboard', 'super_admin', 'admin@yourdomain.com');
```

### Verify it worked:
```sql
-- Check if your admin user was created
SELECT * FROM user_roles;
```

---

## 3. Enable Realtime

Realtime allows the admin panel to update instantly when data changes. You need to enable it in Supabase.

### Steps:
1. Go to **Database** → **Replication** in Supabase dashboard
2. Enable realtime for these tables:
   - ✅ `works`
   - ✅ `pricing`
   - ✅ `services`
   - ✅ `bookings`
   - ✅ `contact_messages`
   - ✅ `site_settings`
   - ✅ `bts`
   - ✅ `team`
   - ✅ `careers`
   - ✅ `client_logos`

### Alternative: SQL Command
If you already ran `supabase-rls-policies.sql`, realtime should already be configured. If not, run:

```sql
-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.works;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pricing;
ALTER PUBLICATION supabase_realtime ADD TABLE public.services;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team;
ALTER PUBLICATION supabase_realtime ADD TABLE public.careers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_logos;
```

---

## 4. Verify Your Setup

After completing the above steps, test that everything works:

### Test 1: Check if you can update a work
1. Log in to the admin panel
2. Go to **Works**
3. Try editing an existing work
4. **Expected:** Update succeeds without "Cannot coerce to single JSON object" error

### Test 2: Check realtime subscriptions
1. Open the admin dashboard
2. Open your browser console (F12)
3. Look for messages like: `[Realtime] Subscribed to bookings`
4. **Expected:** No `CHANNEL_ERROR` messages

### Test 3: Test realtime updates
1. Open admin panel in two browser windows side-by-side
2. In one window, create a new BTS item
3. **Expected:** The new item appears instantly in both windows

---

## Common Errors and Solutions

### Error: "Cannot coerce the result to a single JSON object"
**Cause:** RLS policies are blocking the update because you're not authenticated as an admin.

**Solution:** 
1. Make sure you ran `supabase-rls-policies.sql`
2. Make sure you added your user to the `user_roles` table
3. Make sure you're logged in with that user

### Error: "[Realtime] Error subscribing to contact_messages"
**Cause:** Realtime is not enabled for the table, OR RLS policies are blocking realtime access.

**Solution:**
1. Enable realtime for the table in Supabase dashboard
2. Make sure RLS policies are applied (they allow realtime by default)

### Error: "hostname is not configured under images"
**Solution:** Already fixed in `next.config.ts`. Just restart your dev server:
```bash
npm run dev
```

---

## 5. Environment Variables

Make sure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional (for booking emails)
RESEND_API_KEY=your-resend-key
ADMIN_EMAIL=admin@yourdomain.com
FROM_EMAIL=noreply@yourdomain.com
```

---

## 6. Database Schema Verification

Make sure your database has all required tables. Run this query to check:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected tables:**
- `bookings`
- `bts`
- `careers`
- `client_logos`
- `contact_messages`
- `pricing`
- `services`
- `site_settings`
- `team`
- `user_roles`
- `works`

If any are missing, refer to `scheme.md` in the root directory for the schema definitions.

---

## Quick Setup Checklist

- [ ] Run `supabase-rls-policies.sql` in Supabase SQL Editor
- [ ] Create admin user in `user_roles` table
- [ ] Enable realtime for all 10 tables
- [ ] Verify `.env.local` has correct Supabase credentials
- [ ] Restart Next.js dev server (`npm run dev`)
- [ ] Test admin operations (create, update, delete)
- [ ] Test realtime updates (open two windows side-by-side)

---

## Need Help?

If you're still seeing errors after following these steps:

1. **Check Supabase logs:**
   - Go to **Logs** → **Postgres Logs** in Supabase dashboard
   - Look for permission errors or failed queries

2. **Check browser console:**
   - Open DevTools (F12)
   - Look for detailed error messages
   - Check Network tab for failed API calls

3. **Verify authentication:**
   - Make sure you're logged in
   - Check that your user UUID matches what's in `user_roles`

4. **Test RLS policies:**
   ```sql
   -- Test if is_admin() function works
   SELECT is_admin();
   -- Should return true if you're logged in as admin
   ```

---

## What's Next?

Once setup is complete:
- ✅ Admin panel will have full CRUD functionality
- ✅ Realtime updates will work across all pages
- ✅ Data will be secure with RLS policies
- ✅ Public can submit bookings and messages
- ✅ Only admins can manage content

Happy managing! 🎉
