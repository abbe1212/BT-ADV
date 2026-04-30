/**
 * Admin Layout — Server Component
 * ─────────────────────────────────────────────────────────────────────────────
 * Previously 'use client' because of usePathname(). Now a Server Component:
 *
 *  • Reads the current pathname from the `x-pathname` request header, which is
 *    injected by middleware.ts on every request. This is the recommended
 *    Next.js pattern for pathname-aware Server Component layouts.
 *
 *  • All interactive children (AdminSidebar, AdminHeader) remain 'use client'
 *    and handle their own usePathname() calls internally, as they already did.
 *
 *  • ReactQueryProvider and ConfirmProvider are Client Component wrappers that
 *    correctly accept Server-rendered children as props — no hydration issues.
 *
 * Benefit: The entire admin layout subtree no longer forces client-side
 * hydration. RSC payload is smaller, TTFB is faster, no JS needed for
 * the outer shell.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Force all admin pages to render on-demand — never prerender at build time.
// This cascades to all child pages in the /admin segment.
export const dynamic = 'force-dynamic';

import React from 'react';
import { headers } from 'next/headers';
import { AdminSidebar, SidebarProvider } from '@/components/admin/layout/AdminSidebar';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';
import { ReactQueryProvider } from '@/providers/QueryProvider';
import { ConfirmProvider } from '@/providers/ConfirmProvider';
import { Toaster } from 'sonner';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read the pathname injected by middleware via x-pathname header.
  // This avoids usePathname() (which forces 'use client').
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';
  const isAuthPage = pathname === '/admin/login';

  const content = (
    <ReactQueryProvider>
      <ConfirmProvider>
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          richColors
          toastOptions={{
            style: { background: '#0A1F33', border: '1px solid #14304A', color: 'white' },
          }}
        />
      </ConfirmProvider>
    </ReactQueryProvider>
  );

  if (isAuthPage) {
    return content;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-navy text-white flex font-['Cairo']">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminHeader />
          <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
            {content}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
