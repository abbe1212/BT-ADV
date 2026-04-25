"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, CalendarDays, Film, Tags, Briefcase, Users, Camera,
  Image as ImageIcon, Mail, Settings, LogOut, Star,
  ChevronLeft, ChevronRight, X,
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

/* ─── Sidebar Context ────────────────────────────────────────────────────────*/

interface SidebarCtx {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export const SidebarContext = createContext<SidebarCtx>({
  collapsed: false,
  setCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Auto-collapse on tablet (< lg = 1024px) — runs only on client
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 1024) setCollapsed(true);
  }, []);
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

/* ─── Component ──────────────────────────────────────────────────────────────*/

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useContext(SidebarContext);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname, setMobileOpen]);

  // Close drawer on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [setMobileOpen]);

  // Initial badge counts
  useEffect(() => {
    const fetchCounts = async () => {
      const sb = createClient();
      const { count: b } = await sb.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending");
      if (b !== null) setPendingBookings(b);
      const { count: m } = await sb.from("contact_messages").select("*", { count: "exact", head: true }).eq("is_read", false);
      if (m !== null) setUnreadMessages(m);
    };
    fetchCounts();
  }, []);

  useRealtimeSubscription({
    table: "bookings",
    onChange: async () => {
      const { count } = await createClient().from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending");
      if (count !== null) setPendingBookings(count);
    },
  });

  useRealtimeSubscription({
    table: "contact_messages",
    onChange: async () => {
      const { count } = await createClient().from("contact_messages").select("*", { count: "exact", head: true }).eq("is_read", false);
      if (count !== null) setUnreadMessages(count);
    },
  });

  const handleLogout = async () => {
    await createClient().auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const NAV = [
    {
      groupEN: "General",
      items: [
        { href: "/admin",          icon: Home,        labelEN: "Dashboard", badge: 0 },
        { href: "/admin/bookings", icon: CalendarDays, labelEN: "Bookings", badge: pendingBookings },
        { href: "/admin/works",    icon: Film,         labelEN: "Works",     badge: 0 },
        { href: "/admin/services", icon: Briefcase,    labelEN: "Services",  badge: 0 },
        { href: "/admin/pricing",  icon: Tags,         labelEN: "Pricing",   badge: 0 },
      ],
    },
    {
      groupEN: "Content",
      items: [
        { href: "/admin/team",    icon: Users,     labelEN: "Team",    badge: 0 },
        { href: "/admin/clients", icon: ImageIcon, labelEN: "Clients", badge: 0 },
        { href: "/admin/reviews", icon: Star,      labelEN: "Reviews", badge: 0 },
        { href: "/admin/bts",     icon: Camera,    labelEN: "BTS",     badge: 0 },
        { href: "/admin/careers", icon: Briefcase, labelEN: "Careers", badge: 0 },
      ],
    },
    {
      groupEN: "System",
      items: [
        { href: "/admin/messages", icon: Mail,     labelEN: "Messages", badge: unreadMessages },
        { href: "/admin/settings", icon: Settings, labelEN: "Settings", badge: 0 },
        { href: "/admin/admins",   icon: Users,    labelEN: "Admins",   badge: 0 },
      ],
    },
  ];

  // On mobile the sidebar always shows expanded; collapsed only applies on desktop
  const showLabels = mobileOpen || !collapsed;
  const desktopWidth = collapsed ? "lg:w-[72px]" : "lg:w-[240px]";

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen flex flex-col z-50
          bg-[#0B1929] border-r border-white/[0.06]
          transition-all duration-300 ease-in-out
          w-[240px] ${desktopWidth}
          -translate-x-full lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : ""}
        `}
      >
        {/* Logo */}
        <div className="h-[64px] flex items-center justify-between px-4 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`relative flex-shrink-0 transition-all duration-300 ${!showLabels ? "w-8 h-8" : "w-10 h-10"}`}>
              <Image src="/logo.png" alt="BT-ADV" fill quality={100} className="object-contain" />
            </div>
            <span className={`text-white font-bold text-[15px] tracking-wide whitespace-nowrap transition-all duration-300 ${!showLabels ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"}`}>
              BT-ADV
            </span>
          </div>

          {/* Toggle: X on mobile drawer, chevron on desktop */}
          <button
            onClick={() => mobileOpen ? setMobileOpen(false) : setCollapsed(c => !c)}
            aria-label={mobileOpen ? "Close sidebar" : collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/[0.05] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.1] transition-all duration-200 ${!showLabels ? "mx-auto" : ""}`}
          >
            {mobileOpen
              ? <X className="w-3.5 h-3.5" />
              : collapsed
                ? <ChevronRight className="w-3.5 h-3.5" />
                : <ChevronLeft className="w-3.5 h-3.5" />
            }
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-5 scrollbar-none">
          {NAV.map((group) => (
            <div key={group.groupEN}>
              {showLabels
                ? <p className="px-4 mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">{group.groupEN}</p>
                : <div className="mx-auto mb-1.5 w-5 border-t border-white/[0.08]" />
              }
              <ul className="space-y-0.5 px-2">
                {group.items.map((item) => {
                  const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={!showLabels ? item.labelEN : undefined}
                        className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-150 group relative ${isActive ? "bg-[#1A4FCC]/20 text-white" : "text-white/50 hover:bg-white/[0.05] hover:text-white/90"} ${!showLabels ? "justify-center" : ""}`}
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150 ${isActive ? "bg-[#1A4FCC] shadow-[0_0_12px_rgba(26,79,204,0.5)]" : "bg-transparent group-hover:bg-white/[0.06]"}`}>
                          <item.icon className={`w-[18px] h-[18px] ${isActive ? "text-white" : "text-white/60 group-hover:text-white/90"}`} strokeWidth={isActive ? 2.2 : 1.8} />
                        </div>
                        {showLabels && (
                          <>
                            <span className={`text-sm font-semibold flex-1 whitespace-nowrap ${isActive ? "text-white" : "text-white/60 group-hover:text-white/90"}`}>
                              {item.labelEN}
                            </span>
                            {item.badge > 0 && (
                              <span className="min-w-[20px] h-5 px-1.5 bg-[#1A4FCC] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                        {!showLabels && item.badge > 0 && (
                          <span className="absolute top-1 right-1 w-2 h-2 bg-[#1A4FCC] rounded-full border border-[#0B1929]" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className={`border-t border-white/[0.06] p-3 flex-shrink-0 ${!showLabels ? "flex justify-center" : ""}`}>
          <button
            onClick={handleLogout}
            title={!showLabels ? "Sign out" : undefined}
            className={`flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 group ${!showLabels ? "justify-center w-11" : "w-full"}`}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] group-hover:bg-red-500/10 flex-shrink-0 transition-colors">
              <LogOut className="w-[18px] h-[18px]" strokeWidth={1.8} />
            </div>
            {showLabels && <span className="text-sm font-semibold whitespace-nowrap">Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Desktop-only spacer — mobile sidebar is an overlay, takes no flow space */}
      <div
        className={`hidden lg:block flex-shrink-0 transition-all duration-300 ease-in-out ${collapsed ? "w-[72px]" : "w-[240px]"}`}
        aria-hidden="true"
      />
    </>
  );
}
