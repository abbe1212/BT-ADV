'use client';

import React from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import { ReactQueryProvider } from "@/providers/QueryProvider";
import { ConfirmProvider } from "@/providers/ConfirmProvider";
import { Toaster } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Pages that shouldn't have the admin layout (login, etc.)
  const isAuthPage = pathname === '/admin/login';

  const content = (
    <ReactQueryProvider>
      <ConfirmProvider>
        {children}
        <Toaster theme="dark" position="bottom-right" richColors toastOptions={{
          style: { background: '#0A1F33', border: '1px solid #14304A', color: 'white' }
        }} />
      </ConfirmProvider>
    </ReactQueryProvider>
  );

  if (isAuthPage) {
    return content;
  }

  return (
    <div className="min-h-screen bg-[#00203C] text-white flex font-['Cairo']">
      <AdminSidebar />
      <div className="flex-1 ml-[240px] flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-8 overflow-x-hidden">
          {content}
        </main>
      </div>
    </div>
  );
}
