import React from "react";
import Link from "next/link";
import { CalendarDays, Phone, Video, MapPin, Clock, LucideIcon } from "lucide-react";
import type { Booking } from "@/lib/supabase/types";
import { BookingStatusBadge } from "@/components/admin/bookings/BookingStatusBadge";

const typeIcons: Record<string, LucideIcon> = {
  phone: Phone,
  zoom: Video,
  onsite: MapPin,
};

export function RecentBookingsWidget({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="bg-surface rounded-xl border border-border-input p-5 flex flex-col">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Recent Bookings</h2>
          <p className="text-xs text-white/50 uppercase tracking-wide">أحدث الحجوزات</p>
        </div>
        <Link href="/admin/bookings" className="text-sm text-yellow hover:underline font-semibold">
          View All
        </Link>
      </div>

      <div className="overflow-x-auto">
        {bookings.length === 0 ? (
          <div className="text-center py-12 text-white/50">
            <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No bookings yet</p>
          </div>
        ) : (
          <table className="w-full min-w-[640px] text-sm text-left">
            <thead className="text-xs text-white/60 uppercase bg-surface-deep border-y border-border-input">
              <tr>
                <th className="px-4 py-3 font-medium">Ref</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Preferred Time</th>
                <th className="px-4 py-3 font-medium">Project Type</th>
                <th className="px-4 py-3 font-medium">Budget</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14304A]">
              {bookings.map((booking) => {
                const typeLabel = booking.type === 'phone' ? 'Phone Call' : booking.type === 'onsite' ? 'On-Site' : 'Zoom';
                const budgetDisplay = (() => {
                  const n = Number(booking.estimated_budget);
                  if (!booking.estimated_budget || isNaN(n)) return booking.estimated_budget?.toUpperCase() ?? '—';
                  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
                  if (n >= 1_000)     return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}k`;
                  return String(n);
                })();
                return (
                  <tr key={booking.ref_code} className="hover:bg-[#0d2538] transition-colors group relative cursor-pointer">
                    <td className="px-4 py-3 font-mono text-white/80 group-hover:text-yellow transition-colors">
                      <div className="absolute left-0 top-0 bottom-0 w-0 group-hover:w-1 bg-yellow transition-all shadow-[0_0_10px_#FFEE34]" />
                      <Link href={`/admin/bookings/${booking.id}`} className="hover:underline">
                        {booking.ref_code}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-white">
                      <Link href={`/admin/bookings/${booking.id}`} className="block">
                        <span className="block">{booking.name}</span>
                        {booking.company_name && (
                          <span className="text-xs text-white/50">{booking.company_name}</span>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-yellow font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{booking.time_slot || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-white/80 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" /> {typeLabel}
                        </span>
                        {booking.project_type && (
                          <span className="text-xs text-white/50 truncate max-w-[140px]">{booking.project_type}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/80 font-medium">{budgetDisplay}</td>
                    <td className="px-4 py-3">
                      <BookingStatusBadge status={booking.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
