# Quick Fix: Add Your User as Admin

You're getting "You do not have admin access" because you're logged in, but your user isn't in the `user_roles` table yet.

---

## 🔥 Quick Fix (2 minutes)

### Step 1: Get Your User ID

Open **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- This will show YOUR user ID
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

**Copy your `user_id`** (it looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

---

### Step 2: Add Yourself as Admin

In the same **SQL Editor**, run this query (replace `YOUR_USER_ID_HERE`):

```sql
-- Replace YOUR_USER_ID_HERE with the UUID you just copied
INSERT INTO user_roles (user_id, role) 
VALUES ('YOUR_USER_ID_HERE', 'super_admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
```

**Example:**
```sql
-- If your user_id is: a1b2c3d4-e5f6-7890-abcd-ef1234567890
INSERT INTO user_roles (user_id, role) 
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'super_admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
```

---

### Step 3: Verify It Worked

Run this to confirm:

```sql
-- Check if you're now an admin
SELECT 
  ur.user_id,
  ur.role,
  u.email
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id;
```

**Expected result:**
```
user_id                              | role         | email
-------------------------------------|--------------|------------------
a1b2c3d4-e5f6-7890-abcd-ef1234567890 | super_admin  | youremail@example.com
```

---

### Step 4: Refresh Your Browser

1. Go back to your browser with the admin panel
2. Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac) to hard refresh
3. You should now have full admin access! ✅

If the error persists, **log out and log back in**:
- Click your avatar (top-right)
- Click "Sign Out"
- Go to `/admin/login`
- Log in again

---

## 🔍 Troubleshooting

### Issue: RLS Policy Blocking Login (Most Common!)

If you applied the RLS policies and login still fails, there's a **circular dependency bug**. Fix it:

```sql
-- Drop the problematic policy
DROP POLICY IF EXISTS "user_roles_admin_select" ON public.user_roles;

-- Allow users to read their OWN role (required for login!)
CREATE POLICY "user_roles_own_select" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Allow admins to see all roles
CREATE POLICY "user_roles_admin_select_all" ON public.user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );
```

**OR** temporarily disable RLS on user_roles:

```sql
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
```

---

### Issue: "relation user_roles does not exist"

The `user_roles` table wasn't created. Create it:

```sql
-- Create the user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'super_admin')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Add RLS policy
CREATE POLICY "user_roles_admin_select" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );
```

Then go back to Step 2 and add yourself as admin.

---

### Issue: "No rows in auth.users"

You need to create a user first:

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click "Add user" → "Create new user"
3. Enter your email and password
4. Check ✓ "Auto Confirm User"
5. Click "Create user"
6. Then go back to Step 1 to get your user ID

---

### Issue: Still getting "You do not have admin access"

**Clear your browser session:**

1. Open browser DevTools (F12)
2. Go to **Application** tab → **Storage** → **Clear site data**
3. Log out from admin panel
4. Close all browser tabs with your app
5. Open a new tab and log in again

---

## ✅ Success Checklist

After following the steps above, verify:

- [ ] Your user ID appears in `user_roles` table with role `super_admin`
- [ ] You can log in without the "admin access" error
- [ ] You can edit works without errors
- [ ] The admin dashboard loads properly

---

## 🎯 The Complete Command Sequence

Here's everything in one place (copy-paste ready):

```sql
-- 1. Get your user ID
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- 2. Add yourself as admin (replace the UUID with yours)
INSERT INTO user_roles (user_id, role) 
VALUES ('PASTE-YOUR-UUID-HERE', 'super_admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';

-- 3. Verify it worked
SELECT ur.*, u.email 
FROM user_roles ur 
JOIN auth.users u ON u.id = ur.user_id;
```

---

**That's it!** After running these 3 queries and refreshing your browser, you should have full admin access. 🎉
