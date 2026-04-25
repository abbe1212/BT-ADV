"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, LogOut, User, Menu } from "lucide-react";
import { useContext } from "react";
import { SidebarContext } from "@/components/admin/layout/AdminSidebar";
import { createClient } from "@/lib/supabase/client";

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };
  
  const getPageTitle = () => {
    switch(pathname) {
      case "/admin": return "Dashboard";
      case "/admin/bookings": return "Bookings";
      case "/admin/works": return "Works";
      case "/admin/pricing": return "Pricing";
      case "/admin/services": return "Services";
      case "/admin/team": return "Team";
      case "/admin/careers": return "Careers";
      case "/admin/messages": return "Messages";
      case "/admin/settings": return "Settings";
      case "/admin/bts": return "BTS";
      case "/admin/clients": return "Clients";
      case "/admin/admins": return "Admin Users";
      case "/admin/diagnostics": return "Diagnostics";
      default: return "Dashboard";
    }
  };

  const getInitials = () => {
    if (!userEmail) return 'A';
    return userEmail.charAt(0).toUpperCase();
  };

  const { setMobileOpen } = useContext(SidebarContext);

  return (
    <header className="h-[64px] bg-[#020F1C]/80 backdrop-blur-md border-b border-[#0A1F33] flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          className="lg:hidden p-2 -ml-1 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white font-['Cairo']">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Search */}
        <div className="relative group hidden md:block">
          <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#FFEE34] transition-colors" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-[#061520] text-sm text-white border border-[#0A1F33] rounded-full pl-10 pr-4 py-1.5 w-64 focus:outline-none focus:border-[#FFEE34] focus:ring-1 focus:ring-[#FFEE34] transition-all placeholder-white/40"
          />
        </div>

        {/* Notifications */}
        <button className="relative text-white/70 hover:text-[#FFEE34] transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FFEE34] rounded-full border-2 border-[#020F1C]"></span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-8 h-8 rounded-full border border-[#0A1F33] overflow-hidden cursor-pointer hover:border-[#FFEE34] transition-colors bg-[#FFEE34] flex items-center justify-center font-bold text-[#00203C] text-sm"
          >
            {getInitials()}
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-[#0A1F33] border border-[#14304A] rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-4 border-b border-[#14304A]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFEE34] flex items-center justify-center font-bold text-[#00203C]">
                      {getInitials()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{userEmail || 'Admin User'}</p>
                      <p className="text-white/50 text-xs">Administrator</p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      router.push('/admin/settings');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-white/80 hover:bg-[#14304A] hover:text-white rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">Profile Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      router.push('/admin/diagnostics');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-white/80 hover:bg-[#14304A] hover:text-white rounded-lg transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    <span className="text-sm">Diagnostics</span>
                  </button>
                </div>

                <div className="p-2 border-t border-[#14304A]">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-bold">Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
