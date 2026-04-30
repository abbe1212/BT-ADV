/**
 * Real-time Subscription Hook
 * Subscribe to Supabase table changes for live updates
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type TableName = 
  | 'bookings' 
  | 'contact_messages' 
  | 'site_settings'
  | 'works'
  | 'team'
  | 'pricing'
  | 'services'
  | 'careers'
  | 'bts'
  | 'client_logos'
  | 'clients'
  | 'reviews';

type EventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface UseRealtimeOptions<T = any> {
  table: TableName;
  event?: EventType;
  filter?: string; // e.g., "status=eq.pending"
  onInsert?: (payload: T) => void;
  onUpdate?: (payload: T) => void;
  onDelete?: (payload: { id: string }) => void;
  onChange?: (payload: RealtimePostgresChangesPayload<{ [key: string]: unknown }>) => void;
  enabled?: boolean;
}

/**
 * Hook to subscribe to real-time database changes
 * 
 * @example
 * // Subscribe to all booking changes
 * useRealtimeSubscription({
 *   table: 'bookings',
 *   onInsert: (booking) => setBookings(prev => [booking, ...prev]),
 *   onUpdate: (booking) => setBookings(prev => prev.map(b => b.id === booking.id ? booking : b)),
 *   onDelete: ({ id }) => setBookings(prev => prev.filter(b => b.id !== id)),
 * });
 * 
 * @example
 * // Subscribe only to pending bookings
 * useRealtimeSubscription({
 *   table: 'bookings',
 *   filter: 'status=eq.pending',
 *   onChange: (payload) => console.log('Change:', payload),
 * });
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useRealtimeSubscription<T extends { id: string } = any>({
  table,
  event = '*',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
  enabled = true,
}: UseRealtimeOptions<T>) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  // FIX: Store the client instance so unsubscribe uses the SAME instance that created the channel.
  // Previously, unsubscribe called createClient() which returned a different instance,
  // causing removeChannel() to silently fail and the channel to leak.
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  // Stable callback refs to avoid re-subscribing on every render
  const onInsertRef = useRef(onInsert);
  const onUpdateRef = useRef(onUpdate);
  const onDeleteRef = useRef(onDelete);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onInsertRef.current = onInsert;
    onUpdateRef.current = onUpdate;
    onDeleteRef.current = onDelete;
    onChangeRef.current = onChange;
  }, [onInsert, onUpdate, onDelete, onChange]);

  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();
    supabaseRef.current = supabase;

    const uniqueId = Math.random().toString(36).substring(2, 9);
    const channelName = `realtime:${table}:${filter || 'all'}:${uniqueId}`;

    const subscriptionConfig: {
      event: EventType;
      schema: string;
      table: string;
      filter?: string;
    } = { event, schema: 'public', table };

    if (filter) subscriptionConfig.filter = filter;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        subscriptionConfig,
        (payload: RealtimePostgresChangesPayload<{ [key: string]: unknown }>) => {
          onChangeRef.current?.(payload);

          switch (payload.eventType) {
            case 'INSERT':
              if (payload.new && onInsertRef.current) {
                onInsertRef.current(payload.new as T);
              }
              break;
            case 'UPDATE':
              if (payload.new && onUpdateRef.current) {
                onUpdateRef.current(payload.new as T);
              }
              break;
            case 'DELETE':
              if (payload.old && onDeleteRef.current) {
                onDeleteRef.current({ id: (payload.old as { id: string }).id });
              }
              break;
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.error(`[Realtime] Error subscribing to ${table}`);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current && supabaseRef.current) {
        supabaseRef.current.removeChannel(channelRef.current);
        channelRef.current = null;
        supabaseRef.current = null;
      }
    };
  }, [table, event, filter, enabled]);

  // FIX: Uses the stored supabaseRef — not a freshly created client instance.
  const unsubscribe = useCallback(() => {
    if (channelRef.current && supabaseRef.current) {
      supabaseRef.current.removeChannel(channelRef.current);
      channelRef.current = null;
      supabaseRef.current = null;
    }
  }, []);

  return { unsubscribe };
}

/**
 * Hook to subscribe to multiple tables at once.
 *
 * FIX: Serialises subscriptions to a stable JSON string as the useEffect dependency.
 * Previously the raw `subscriptions` array was used — since arrays are objects,
 * a new reference on every render caused infinite subscribe/unsubscribe churn
 * that hammered Supabase with repeated connect/disconnect cycles.
 */
export function useRealtimeSubscriptions(
  subscriptions: UseRealtimeOptions<Record<string, unknown>>[],
  enabled = true
) {
  // Only re-run the effect when table/event/filter values actually change.
  const stableKey = JSON.stringify(
    subscriptions.map(({ table, event, filter }) => ({ table, event, filter }))
  );

  useEffect(() => {
    if (!enabled || subscriptions.length === 0) return;

    const supabase = createClient();
    const channels: RealtimeChannel[] = [];

    subscriptions.forEach(({ table, event = '*', filter, onInsert, onUpdate, onDelete, onChange }) => {
      const uniqueId = Math.random().toString(36).substring(2, 9);
      const channelName = `realtime:${table}:${filter || 'all'}:${uniqueId}`;

      const subscriptionConfig: {
        event: EventType;
        schema: string;
        table: string;
        filter?: string;
      } = { event, schema: 'public', table };

      if (filter) subscriptionConfig.filter = filter;

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          subscriptionConfig,
          (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
            onChange?.(payload);

            switch (payload.eventType) {
              case 'INSERT':
                if (payload.new) onInsert?.(payload.new as Record<string, unknown>);
                break;
              case 'UPDATE':
                if (payload.new) onUpdate?.(payload.new as Record<string, unknown>);
                break;
              case 'DELETE':
                if (payload.old) onDelete?.({ id: (payload.old as { id: string }).id });
                break;
            }
          }
        )
        .subscribe();

      channels.push(channel);
    });

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableKey, enabled]); // stableKey replaces the unstable raw array reference
}

export default useRealtimeSubscription;
