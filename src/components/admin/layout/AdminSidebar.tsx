"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarDays,
  Film,
  Tags,
  Briefcase,
  Users,
  Camera,
  Image as ImageIcon,
  Mail,
  Settings,
  LogOut,
  Star,
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", icon: Home, labelEN: "Dashboard", labelAR: "لوحة التحكم" },
    { href: "/admin/bookings", icon: CalendarDays, labelEN: "Bookings", labelAR: "الحجوزات", badge: 3 },
    { href: "/admin/works", icon: Film, labelEN: "Works", labelAR: "الأعمال" },
    { href: "/admin/pricing", icon: Tags, labelEN: "Pricing", labelAR: "الأسعار" },
    { href: "/admin/services", icon: Briefcase, labelEN: "Services", labelAR: "الخدمات" },
    { href: "/admin/team", icon: Users, labelEN: "Team", labelAR: "الفريق" },
    { href: "/admin/bts", icon: Camera, labelEN: "BTS", labelAR: "كواليس" },
    { href: "/admin/careers", icon: Briefcase, labelEN: "Careers", labelAR: "وظائف" },
    { href: "/admin/clients", icon: ImageIcon, labelEN: "Client Logos", labelAR: "لوجوهات العملاء" },
    { href: "/admin/reviews", icon: Star, labelEN: "Reviews", labelAR: "التقييمات" },
    { href: "/admin/messages", icon: Mail, labelEN: "Contact Messages", labelAR: "الرسائل", badge: 5 },
    { href: "/admin/settings", icon: Settings, labelEN: "Site Settings", labelAR: "الإعدادات" },
    { href: "/admin/admins", icon: Users, labelEN: "Manage Admins", labelAR: "المشرفين" },
  ];

  return (
    <aside className="w-[240px] fixed top-0 left-0 h-screen bg-[#020F1C] border-r border-[#0A1F33] flex flex-col font-['Cairo'] flex-shrink-0 z-50">
      {/* Top: Logo */}
      <div className="h-[64px] flex items-center px-6 border-b border-[#0A1F33]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#00203C] rounded-md border border-[#0A1F33] flex justify-center items-center font-bold text-white">
            BT
          </div>
          <span className="text-[#FFEE34] font-bold tracking-wider text-sm">ADMIN PANEL</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-thin scrollbar-thumb-[#FFEE34] scrollbar-track-transparent">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group ${
                isActive
                  ? "bg-[#0A1F33] text-white"
                  : "text-white/60 hover:bg-[#0A1F33]/50 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <link.icon
                  className={`w-5 h-5 ${isActive ? "text-[#FFEE34]" : "group-hover:text-white"}`}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold leading-tight">{link.labelAR}</span>
                  <span className="text-[10px] uppercase tracking-wider opacity-70 leading-tight">
                    {link.labelEN}
                  </span>
                </div>
              </div>
              {link.badge && (
                <div className="bg-[#FFEE34] text-[#00203C] text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {link.badge}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom User Area */}
      <div className="p-4 border-t border-[#0A1F33] bg-[#020F1C]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#FFEE34] border border-[#FFEE34]/20 flex-shrink-0 flex items-center justify-center font-bold text-[#00203C]">
            A
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-bold text-white truncate w-full">Admin</span>
            <span className="bg-white text-[#00203C] text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-block mt-1 w-max">
              ADMIN
            </span>
          </div>
        </div>
        <button className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-white/70 hover:bg-[#0A1F33] hover:text-[#FFEE34] transition-colors border border-transparent hover:border-[#FFEE34]/20 text-sm">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
