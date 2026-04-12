"use client";

import React, { useState, useCallback } from "react";
import { 
  Search, Filter, CalendarDays, MoreVertical, 
  CheckCircle, XCircle, Trash2, Download, AlertTriangle, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Booking } from "@/lib/supabase/types";
import { updateBookingStatus, deleteBooking } from "@/lib/supabase/mutations";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { toast } from "sonner";
import { useConfirm } from "@/providers/ConfirmProvider";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { BookingsFilterBar } from "./BookingsFilterBar";
import { BookingsTable } from "./BookingsTable";
import { PaginationControls } from "./PaginationControls";

interface BookingsPageProps {
  initialBookings: Booking[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

export function BookingsPage({ initialBookings, totalCount, currentPage, pageSize }: BookingsPageProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [bookings, setBookings] = useState(initialBookings);

  React.useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const { confirm } = useConfirm();
  const isAdmin = true; // "SUPER ADMIN"
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    
    // Reset to page 1 on filter change
    if (key !== 'page') params.set('page', '1');
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    handleFilterChange('page', String(newPage));
  };

  // Real-time subscription for bookings
  useRealtimeSubscription<Booking>({
    table: 'bookings',
    onInsert: useCallback((newBooking: Booking) => {
      setBookings(prev => [newBooking, ...prev]);
      router.refresh();
    }, []),
    onUpdate: useCallback((updatedBooking: Booking) => {
      setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
      router.refresh();
    }, []),
    onDelete: useCallback(({ id }: { id: string }) => {
      setBookings(prev => prev.filter(b => b.id !== id));
      setSelectedRows(prev => prev.filter(ref => {
        const booking = bookings.find(b => b.id === id);
        return booking ? ref !== booking.ref_code : true;
      }));
      router.refresh();
    }, [bookings, router]),
  });

  // Helper to add/remove loading state
  const setLoading = (id: string, isLoading: boolean) => {
    setLoadingIds(prev => {
      const next = new Set(prev);
      if (isLoading) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleConfirm = async (booking: Booking) => {
    setLoading(booking.id, true);
    const { error } = await updateBookingStatus(booking.id, 'confirmed');
    setLoading(booking.id, false);
    if (error) {
      toast.error(`Failed to confirm booking: ${error}`);
    } else {
      toast.success(`Booking ${booking.ref_code} confirmed`);
    }
    // Real-time subscription will update the UI
  };

  const handleCancel = async (booking: Booking) => {
    setLoading(booking.id, true);
    const { error } = await updateBookingStatus(booking.id, 'cancelled');
    setLoading(booking.id, false);
    if (error) {
      toast.error(`Failed to cancel booking: ${error}`);
    } else {
      toast.success(`Booking ${booking.ref_code} cancelled`);
    }
  };

  const handleDelete = async (booking: Booking) => {
    const isConfirmed = await confirm({
      title: 'Delete Booking',
      message: `Are you sure you want to delete booking ${booking.ref_code}? This action cannot be undone.`,
      confirmText: 'Delete',
      isDestructive: true
    });
    if (!isConfirmed) return;
    
    setLoading(booking.id, true);
    const { error } = await deleteBooking(booking.id);
    setLoading(booking.id, false);
    if (error) {
      toast.error(`Failed to delete booking: ${error}`);
    } else {
      toast.success(`Booking ${booking.ref_code} deleted`);
    }
  };

  const handleBulkConfirm = async () => {
    const toConfirm = bookings.filter(b => selectedRows.includes(b.ref_code) && b.status === 'pending');
    let successCount = 0;
    for (const booking of toConfirm) {
      const { error } = await updateBookingStatus(booking.id, 'confirmed');
      if (!error) successCount++;
    }
    toast.success(`Confirmed ${successCount} bookings successfully`);
    setSelectedRows([]);
  };

  const handleBulkDelete = async () => {
    const isConfirmed = await confirm({
      title: 'Bulk Delete Bookings',
      message: `Are you sure you want to delete ${selectedRows.length} bookings? This action cannot be undone.`,
      confirmText: 'Delete All',
      isDestructive: true
    });
    if (!isConfirmed) return;
    
    let successCount = 0;
    const toDelete = bookings.filter(b => selectedRows.includes(b.ref_code));
    for (const booking of toDelete) {
      const { error } = await deleteBooking(booking.id);
      if (!error) successCount++;
    }
    
    toast.success(`Deleted ${successCount} bookings successfully`);
    setSelectedRows([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(bookings.map(b => b.ref_code));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (ref_code: string) => {
    if (selectedRows.includes(ref_code)) {
      setSelectedRows(selectedRows.filter(id => id !== ref_code));
    } else {
      setSelectedRows([...selectedRows, ref_code]);
    }
  };

  return (
    <div className="space-y-6">
      <BookingsFilterBar 
        search={searchParams.get('search') || ''}
        status={searchParams.get('status') || ''}
        type={searchParams.get('type') || ''}
        dateFrom={searchParams.get('dateFrom') || ''}
        dateTo={searchParams.get('dateTo') || ''}
        onFilterChange={handleFilterChange}
      />

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedRows.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#FFEE34] text-[#00203C] p-3 rounded-lg flex items-center justify-between shadow-[0_4px_20px_rgba(255,238,52,0.15)]"
          >
            <div className="flex items-center gap-3 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>{selectedRows.length} bookings selected</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleBulkConfirm}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00203C] text-white rounded text-xs font-bold hover:bg-[#0A1F33] transition-colors border border-transparent"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Confirm Selected
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-[#00203C] text-[#00203C] rounded text-xs font-bold hover:bg-[#00203C]/10 transition-colors">
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
              {isAdmin && (
                <button 
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-600 rounded text-xs font-bold hover:bg-red-500/20 transition-colors border border-red-500/50 ml-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Area */}
      <div className="bg-[#0A1F33] rounded-xl border border-[#14304A] overflow-hidden flex flex-col">
        <BookingsTable 
          bookings={bookings}
          selectedRows={selectedRows}
          loadingIds={loadingIds}
          isAdmin={isAdmin}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onDelete={handleDelete}
        />
        <PaginationControls 
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
