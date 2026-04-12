"use client";

import React, { useState, useCallback } from "react";
import { CalendarDays, AlertCircle, TrendingUp, Mail } from "lucide-react";
import type { Booking, ContactMessage, Work } from "@/lib/supabase/types";
import type { DashboardStats } from "@/lib/supabase/queries";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { StatCard } from "@/components/admin/ui/StatCard";
import { QuickStatsChart } from "@/components/admin/home/QuickStatsChart";
import { RecentBookingsWidget } from "@/components/admin/home/RecentBookingsWidget";
import { RecentMessagesWidget } from "@/components/admin/home/RecentMessagesWidget";
import { LatestWorksWidget } from "@/components/admin/home/LatestWorksWidget";

interface AdminDashboardProps {
  stats: DashboardStats;
  recentBookings: Booking[];
  recentMessages: ContactMessage[];
  recentWorks: Work[];
}

export function AdminDashboard({ stats: initialStats, recentBookings: initialBookings, recentMessages: initialMessages, recentWorks }: AdminDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [stats, setStats] = useState<DashboardStats>(initialStats);

  useRealtimeSubscription<Booking>({
    table: 'bookings',
    onInsert: useCallback((newBooking: Booking) => {
      setBookings(prev => [newBooking, ...prev].slice(0, 5));
      setStats(prev => ({
        ...prev,
        totalBookings: prev.totalBookings + 1,
        pendingBookings: newBooking.status === 'pending' ? prev.pendingBookings + 1 : prev.pendingBookings,
        thisMonthBookings: prev.thisMonthBookings + 1,
        bookingsByType: {
          ...prev.bookingsByType,
          [newBooking.type]: prev.bookingsByType[newBooking.type] + 1,
        },
      }));
    }, []),
    onUpdate: useCallback((updatedBooking: Booking) => {
      setBookings(prev => {
        const oldBooking = prev.find(b => b.id === updatedBooking.id);
        if (!oldBooking) return prev;
        if (oldBooking.status !== updatedBooking.status) {
          setStats(prevStats => {
            let pendingDelta = 0;
            if (oldBooking.status === 'pending') pendingDelta--;
            if (updatedBooking.status === 'pending') pendingDelta++;
            return { ...prevStats, pendingBookings: prevStats.pendingBookings + pendingDelta };
          });
        }
        return prev.map(b => b.id === updatedBooking.id ? updatedBooking : b);
      });
    }, []),
    onDelete: useCallback(({ id }: { id: string }) => {
      setBookings(prev => {
        const booking = prev.find(b => b.id === id);
        if (booking) {
          setStats(prevStats => ({
            ...prevStats,
            totalBookings: prevStats.totalBookings - 1,
            pendingBookings: booking.status === 'pending' ? prevStats.pendingBookings - 1 : prevStats.pendingBookings,
            bookingsByType: {
              ...prevStats.bookingsByType,
              [booking.type]: prevStats.bookingsByType[booking.type] - 1,
            },
          }));
        }
        return prev.filter(b => b.id !== id);
      });
    }, []),
  });

  useRealtimeSubscription<ContactMessage>({
    table: 'contact_messages',
    onInsert: useCallback((newMessage: ContactMessage) => {
      setMessages(prev => [newMessage, ...prev].slice(0, 5));
      if (!newMessage.is_read) {
        setStats(prev => ({ ...prev, newMessages: prev.newMessages + 1 }));
      }
    }, []),
    onUpdate: useCallback((updatedMessage: ContactMessage) => {
      setMessages(prev => {
        const oldMessage = prev.find(m => m.id === updatedMessage.id);
        if (!oldMessage) return prev;
        if (oldMessage.is_read !== updatedMessage.is_read) {
          setStats(prevStats => ({
            ...prevStats,
            newMessages: updatedMessage.is_read ? Math.max(0, prevStats.newMessages - 1) : prevStats.newMessages + 1,
          }));
        }
        return prev.map(m => m.id === updatedMessage.id ? updatedMessage : m);
      });
    }, []),
    onDelete: useCallback(({ id }: { id: string }) => {
      setMessages(prev => {
        const message = prev.find(m => m.id === id);
        if (message && !message.is_read) {
          setStats(prevStats => ({ ...prevStats, newMessages: Math.max(0, prevStats.newMessages - 1) }));
        }
        return prev.filter(m => m.id !== id);
      });
    }, []),
  });

  const monthlyChange = stats.lastMonthBookings > 0 
    ? Math.round(((stats.thisMonthBookings - stats.lastMonthBookings) / stats.lastMonthBookings) * 100)
    : stats.thisMonthBookings > 0 ? 100 : 0;
  const monthlyChangeStr = monthlyChange >= 0 ? `+${monthlyChange}%` : `${monthlyChange}%`;

  const totalByType = stats.bookingsByType.phone + stats.bookingsByType.zoom + stats.bookingsByType.onsite;
  const phonePercent = totalByType > 0 ? Math.round((stats.bookingsByType.phone / totalByType) * 100) : 0;
  const zoomPercent = totalByType > 0 ? Math.round((stats.bookingsByType.zoom / totalByType) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ROW 1: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={CalendarDays} number={stats.totalBookings.toLocaleString()} labelAR="إجمالي الحجوزات" labelEN="Total Bookings" />
        <StatCard icon={AlertCircle} number={stats.pendingBookings.toString()} labelAR="حجوزات معلقة" labelEN="Pending Bookings" iconColor="text-amber-400" />
        <StatCard icon={TrendingUp} number={monthlyChangeStr} labelAR="الشهر الحالي" labelEN="This Month" />
        <StatCard icon={Mail} number={stats.newMessages.toString()} labelAR="رسائل جديدة" labelEN="New Messages" hasIndicator={stats.newMessages > 0} />
      </div>

      {/* ROW 2: Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <RecentBookingsWidget bookings={bookings} />
        <QuickStatsChart phonePercent={phonePercent} zoomPercent={zoomPercent} totalByType={totalByType} />
      </div>

      {/* ROW 3: Messages & Works */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentMessagesWidget messages={messages} />
        <LatestWorksWidget recentWorks={recentWorks} />
      </div>
    </div>
  );
}
