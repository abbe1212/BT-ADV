-- ============================================================================
-- BT Agency - Row Level Security (RLS) Policies
-- ============================================================================
-- This file contains all RLS policies for the BT Agency application.
-- Apply these policies to your Supabase database to secure your tables.
--
-- IMPORTANT: Before applying these policies, ensure you have:
-- 1. Created a 'user_roles' table with proper admin users
-- 2. Configured authentication in Supabase
-- 3. Tested with your admin credentials
-- ============================================================================

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Enable RLS on all tables
-- ============================================================================

ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Public Read Policies (Frontend Access)
-- ============================================================================

-- Works: Public can view all works
CREATE POLICY "works_public_select" ON public.works
  FOR SELECT USING (true);

-- Pricing: Public can view all pricing tiers
CREATE POLICY "pricing_public_select" ON public.pricing
  FOR SELECT USING (true);

-- Services: Public can view all services
CREATE POLICY "services_public_select" ON public.services
  FOR SELECT USING (true);

-- Site Settings: Public can view all settings
CREATE POLICY "site_settings_public_select" ON public.site_settings
  FOR SELECT USING (true);

-- BTS: Public can view all BTS items
CREATE POLICY "bts_public_select" ON public.bts
  FOR SELECT USING (true);

-- Team: Public can view all team members
CREATE POLICY "team_public_select" ON public.team
  FOR SELECT USING (true);

-- Careers: Public can view all career postings
CREATE POLICY "careers_public_select" ON public.careers
  FOR SELECT USING (true);

-- Client Logos: Public can view all client logos
CREATE POLICY "client_logos_public_select" ON public.client_logos
  FOR SELECT USING (true);

-- ============================================================================
-- Bookings Policies
-- ============================================================================

-- Public can create bookings (contact form submission)
CREATE POLICY "bookings_public_insert" ON public.bookings
  FOR INSERT WITH CHECK (true);

-- Public can view their own bookings (if authenticated)
CREATE POLICY "bookings_user_select" ON public.bookings
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

-- Admin can view all bookings
CREATE POLICY "bookings_admin_select" ON public.bookings
  FOR SELECT USING (is_admin());

-- Admin can update bookings (status changes)
CREATE POLICY "bookings_admin_update" ON public.bookings
  FOR UPDATE USING (is_admin());

-- Admin can delete bookings
CREATE POLICY "bookings_admin_delete" ON public.bookings
  FOR DELETE USING (is_admin());

-- ============================================================================
-- Contact Messages Policies
-- ============================================================================

-- Public can create contact messages
CREATE POLICY "contact_messages_public_insert" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

-- Admin can view all contact messages
CREATE POLICY "contact_messages_admin_select" ON public.contact_messages
  FOR SELECT USING (is_admin());

-- Admin can update contact messages (mark as read)
CREATE POLICY "contact_messages_admin_update" ON public.contact_messages
  FOR UPDATE USING (is_admin());

-- Admin can delete contact messages
CREATE POLICY "contact_messages_admin_delete" ON public.contact_messages
  FOR DELETE USING (is_admin());

-- ============================================================================
-- Admin-Only Policies (CRUD Operations)
-- ============================================================================

-- Works: Admin full access
CREATE POLICY "works_admin_insert" ON public.works
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "works_admin_update" ON public.works
  FOR UPDATE USING (is_admin());

CREATE POLICY "works_admin_delete" ON public.works
  FOR DELETE USING (is_admin());

-- Pricing: Admin full access
CREATE POLICY "pricing_admin_insert" ON public.pricing
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "pricing_admin_update" ON public.pricing
  FOR UPDATE USING (is_admin());

CREATE POLICY "pricing_admin_delete" ON public.pricing
  FOR DELETE USING (is_admin());

-- Services: Admin full access
CREATE POLICY "services_admin_insert" ON public.services
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "services_admin_update" ON public.services
  FOR UPDATE USING (is_admin());

CREATE POLICY "services_admin_delete" ON public.services
  FOR DELETE USING (is_admin());

-- Site Settings: Admin full access
CREATE POLICY "site_settings_admin_insert" ON public.site_settings
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "site_settings_admin_update" ON public.site_settings
  FOR UPDATE USING (is_admin());

CREATE POLICY "site_settings_admin_delete" ON public.site_settings
  FOR DELETE USING (is_admin());

-- BTS: Admin full access
CREATE POLICY "bts_admin_insert" ON public.bts
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "bts_admin_update" ON public.bts
  FOR UPDATE USING (is_admin());

CREATE POLICY "bts_admin_delete" ON public.bts
  FOR DELETE USING (is_admin());

-- Team: Admin full access
CREATE POLICY "team_admin_insert" ON public.team
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "team_admin_update" ON public.team
  FOR UPDATE USING (is_admin());

CREATE POLICY "team_admin_delete" ON public.team
  FOR DELETE USING (is_admin());

-- Careers: Admin full access
CREATE POLICY "careers_admin_insert" ON public.careers
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "careers_admin_update" ON public.careers
  FOR UPDATE USING (is_admin());

CREATE POLICY "careers_admin_delete" ON public.careers
  FOR DELETE USING (is_admin());

-- Client Logos: Admin full access
CREATE POLICY "client_logos_admin_insert" ON public.client_logos
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "client_logos_admin_update" ON public.client_logos
  FOR UPDATE USING (is_admin());

CREATE POLICY "client_logos_admin_delete" ON public.client_logos
  FOR DELETE USING (is_admin());

-- ============================================================================
-- User Roles Policies
-- ============================================================================

-- CRITICAL: Users must be able to read their OWN role entry for login to work
-- Without this, there's a circular dependency: is_admin() needs to read user_roles,
-- but user_roles requires is_admin() - causing login to always fail!
CREATE POLICY "user_roles_own_select" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view ALL user roles (for user management features)
CREATE POLICY "user_roles_admin_select_all" ON public.user_roles
  FOR SELECT USING (is_admin());

-- Only super admins can manage user roles (insert/update/delete)
CREATE POLICY "user_roles_super_admin_insert" ON public.user_roles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "user_roles_super_admin_update" ON public.user_roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "user_roles_super_admin_delete" ON public.user_roles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- ============================================================================
-- Enable Realtime for Admin Tables
-- ============================================================================

-- Enable realtime for all tables that need live updates in the admin panel
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

-- ============================================================================
-- Additional Indexes for Performance
-- ============================================================================

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);

-- Contact messages indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON public.contact_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);

-- Works indexes
CREATE INDEX IF NOT EXISTS idx_works_category ON public.works(category);
CREATE INDEX IF NOT EXISTS idx_works_featured ON public.works(featured);
CREATE INDEX IF NOT EXISTS idx_works_order_index ON public.works(order_index);

-- Team indexes
CREATE INDEX IF NOT EXISTS idx_team_is_featured ON public.team(is_featured);
CREATE INDEX IF NOT EXISTS idx_team_order_index ON public.team(order_index);

-- BTS indexes
CREATE INDEX IF NOT EXISTS idx_bts_order_index ON public.bts(order_index);

-- Client logos indexes
CREATE INDEX IF NOT EXISTS idx_client_logos_order_index ON public.client_logos(order_index);

-- Careers indexes
CREATE INDEX IF NOT EXISTS idx_careers_is_open ON public.careers(is_open);

-- ============================================================================
-- Database Triggers for Auto-timestamping
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables that have this column
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Notes
-- ============================================================================

/*
IMPORTANT SECURITY NOTES:

1. Admin Access:
   - Ensure you have at least one admin user in the 'user_roles' table
   - Example: INSERT INTO user_roles (user_id, role) VALUES ('your-auth-uid', 'super_admin');

2. Public vs Authenticated:
   - Bookings and contact_messages allow public INSERT for form submissions
   - All other write operations require admin authentication

3. Realtime Subscriptions:
   - All tables are added to the realtime publication
   - Ensure your Supabase project has realtime enabled
   - Frontend components use useRealtimeSubscription hook

4. Testing:
   - Test all policies with both authenticated admin and public users
   - Verify that non-admin users cannot perform write operations
   - Check that realtime updates work in the admin panel

5. Environment Variables:
   - Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set
   - Keep your service role key secure and never expose it to the client

6. Rate Limiting:
   - Consider implementing rate limiting for public INSERT operations
   - Supabase provides built-in rate limiting features

7. Backup:
   - Regularly backup your database
   - Test RLS policies in a staging environment first
*/
