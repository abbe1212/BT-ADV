import React from "react";
import { CalendarDays, CheckCircle, XCircle, Trash2, MoreVertical, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Booking } from "@/lib/supabase/types";
import { BookingStatusBadge } from "./BookingStatusBadge";

interface BookingsTableProps {
  bookings: Booking[];
  selectedRows: string[];
  loadingIds: Set<string>;
  isAdmin: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (ref_code: string) => void;
  onConfirm: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
}

export function BookingsTable({
  bookings,
  selectedRows,
  loadingIds,
  isAdmin,
  onSelectAll,
  onSelectRow,
  onConfirm,
  onCancel,
  onDelete,
}: BookingsTableProps) {
  const router = useRouter();

  const handleRowClick = (id: string, e: React.MouseEvent) => {
    // If the click is on an input or button, don't navigate
    if ((e.target as HTMLElement).closest('button, input, a')) return;
    router.push(`/admin/bookings/${id}`);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-[11px] text-white/50 uppercase tracking-wider bg-[#061520] border-b border-[#14304A]">
          <tr>
            <th className="px-4 py-3 cursor-pointer">
              <input 
                type="checkbox" 
                onChange={(e) => onSelectAll(e.target.checked)}
                checked={selectedRows.length === bookings.length && bookings.length > 0}
                className="accent-[#FFEE34] w-4 h-4 rounded cursor-pointer"
              />
            </th>
            <th className="px-4 py-3 font-medium">Ref</th>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Contact</th>
            <th className="px-4 py-3 font-medium">Date & Time</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Budget</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#14304A]">
          {bookings.length > 0 ? (
            bookings.map((booking) => {
              const isSelected = selectedRows.includes(booking.ref_code);
              const isLoading = loadingIds.has(booking.id);
              const typeLabel = booking.type === 'phone' ? 'Phone Call' : booking.type === 'onsite' ? 'On-Site' : 'Zoom';

              return (
                <tr 
                  key={booking.ref_code}
                  onClick={(e) => handleRowClick(booking.id, e)} 
                  className={`transition-colors group min-h-[64px] cursor-pointer ${
                    isSelected ? "bg-[#FFEE34]/5" : "hover:bg-[#0d2538]"
                  } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <td className="px-4 py-3">
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => onSelectRow(booking.ref_code)}
                      className="accent-[#FFEE34] w-4 h-4 rounded cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-white group-hover:text-[#FFEE34] transition-colors">
                    {booking.ref_code}
                  </td>
                  <td className="px-4 py-3 text-white font-bold">{booking.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-white/80">{booking.phone}</span>
                      <span className="text-xs text-white/50">{booking.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/80">{booking.date} @ {booking.time_slot}</td>
                  <td className="px-4 py-3 text-white/80">{typeLabel}</td>
                  <td className="px-4 py-3 text-white/80">{booking.estimated_budget?.toUpperCase() ?? '—'}</td>
                  <td className="px-4 py-3">
                    <BookingStatusBadge status={booking.status} isLoading={isLoading} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {booking.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => onConfirm(booking)}
                            disabled={isLoading}
                            className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded transition-colors disabled:opacity-50" 
                            title="Confirm"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => onCancel(booking)}
                            disabled={isLoading}
                            className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors disabled:opacity-50" 
                            title="Cancel"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {isAdmin && (
                        <button 
                          onClick={() => onDelete(booking)}
                          disabled={isLoading}
                          className="p-1.5 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors ml-1 disabled:opacity-50" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); router.push(`/admin/bookings/${booking.id}`); }}
                        className="p-1.5 text-white/40 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors ml-1" 
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={9} className="py-20 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-[#061520] rounded-full flex items-center justify-center mb-4">
                    <CalendarDays className="w-8 h-8 text-[#14304A]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">لا توجد حجوزات بعد</h3>
                  <p className="text-white/50 text-sm">No bookings found.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
