# Troubleshooting: "Cannot coerce the result to a single JSON object"

This error occurs when trying to update data in the admin panel. Here's how to fix it:

---

## Root Cause

The error means **RLS (Row Level Security) is blocking your update**. When Supabase blocks an operation, the query returns 0 rows, and `.single()` fails with this error message.

---

## Quick Fix Steps

### Step 1: Check if RLS Policies Are Applied

Run this query in your **Supabase SQL Editor**:

```sql
-- Check if RLS is enabled and if policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'works'
ORDER BY tablename, policyname;
```

**Expected result:** You should see multiple policies like:
- `works_public_select`
- `works_admin_insert`
- `works_admin_update`
- `works_admin_delete`

**If you see NO results:** You haven't applied the RLS policies yet. Go to Step 2.

---

### Step 2: Apply RLS Policies

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy the entire contents of `supabase-rls-policies.sql`
3. Paste and click **Run**
4. Wait for "Success. No rows returned" message

---

### Step 3: Check if Admin User Exists

Run this query in **Supabase SQL Editor**:

```sql
-- Check if you have an admin user
SELECT * FROM user_roles;
```

**If the table is empty or you don't see your user:**

You need to create an admin user. First, get your user ID:

```sql
-- Get your current user ID (run this while logged in)
SELECT auth.uid();
```

Then create the admin role:

```sql
-- Replace 'your-user-id-here' with the UUID from above
INSERT INTO user_roles (user_id, role) 
VALUES ('your-user-id-here', 'super_admin');
```

**Verify it worked:**

```sql
SELECT * FROM user_roles;
-- Should show your user with super_admin role
```

---

### Step 4: Test the is_admin() Function

```sql
-- This should return TRUE if you're logged in as admin
SELECT is_admin();
```

**If it returns FALSE or NULL:**
- Make sure you're logged in to the Supabase dashboard
- Double-check your user_id in the user_roles table matches your auth.uid()

---

### Step 5: Test Update Permission

```sql
-- Try updating a work directly (replace with a real work ID)
UPDATE works 
SET title_en = 'Test Update' 
WHERE id = 'some-real-work-id-from-your-database';

-- If this succeeds, the issue is with your frontend authentication
-- If this fails, check the error message
```

---

## Common Issues

### Issue 1: "user_roles table doesn't exist"

**Solution:** The table might not have been created. Create it:

```sql
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'super_admin')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "user_roles_admin_select" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );
```

---

### Issue 2: "You're not logged in"

The admin panel requires authentication. Make sure:

1. You have authentication set up in Supabase (Email/Password, OAuth, etc.)
2. You're logged in via the frontend
3. Your `auth.uid()` matches a user in the `user_roles` table

**Test authentication:**

```sql
-- Run this in SQL Editor
SELECT 
  auth.uid() as current_user_id,
  auth.email() as current_email;
```

If both return NULL, you're not authenticated in the SQL Editor context. You'll need to test from the frontend.

---

### Issue 3: "Frontend not sending auth token"

Make sure your Supabase client is properly configured:

Check `src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

Check `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Verification Checklist

Run through this checklist:

- [ ] RLS policies applied (check with `SELECT * FROM pg_policies WHERE schemaname = 'public'`)
- [ ] Admin user created (check with `SELECT * FROM user_roles`)
- [ ] `is_admin()` function returns TRUE (check with `SELECT is_admin()`)
- [ ] You're authenticated in the frontend
- [ ] Environment variables are set correctly
- [ ] Dev server restarted after applying changes

---

## Still Not Working?

### Enable Debug Mode

Add this to see what's happening:

In `src/lib/supabase/mutations.ts`, update the `updateWork` function:

```typescript
export async function updateWork({ id, ...payload }: WorkUpdate): Promise<MutationResult<Work>> {
  const supabase = createClient();
  
  // Debug: Check current user
  const { data: { user } } = await supabase.auth.getUser();
  console.log('[updateWork] Current user:', user?.id);
  
  const { data, error } = await supabase
    .from('works')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[updateWork] Error:', error);
    console.error('[updateWork] Error code:', error.code);
    console.error('[updateWork] Error details:', error.details);
    console.error('[updateWork] Error hint:', error.hint);
    return { data: null, error: error.message };
  }
  return { data: data as Work, error: null };
}
```

This will show:
- If you're authenticated
- Detailed error information
- The specific RLS policy that's blocking you

---

## Need More Help?

If none of the above works, please provide:

1. Output of `SELECT * FROM pg_policies WHERE tablename = 'works'`
2. Output of `SELECT * FROM user_roles`
3. Output of `SELECT auth.uid(), auth.email()`
4. The detailed error logs from the browser console after adding debug mode

This will help identify the exact issue!
