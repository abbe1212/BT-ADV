import { z } from 'zod';

// ─── Booking status schema (admin side — status updates) ──────────────────────

export const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled'] as const;
export const BOOKING_TYPES = ['phone', 'onsite', 'zoom'] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export type BookingType = (typeof BOOKING_TYPES)[number];

// Zod v4: use z.union of z.literal() instead of z.enum() for readonly tuples
const statusLiterals = BOOKING_STATUSES.map((s) => z.literal(s)) as [
  z.ZodLiteral<'pending'>,
  z.ZodLiteral<'confirmed'>,
  z.ZodLiteral<'cancelled'>,
];
const statusSchema = z.union(statusLiterals);

const typeLiterals = BOOKING_TYPES.map((t) => z.literal(t)) as [
  z.ZodLiteral<'phone'>,
  z.ZodLiteral<'onsite'>,
  z.ZodLiteral<'zoom'>,
];
const typeSchema = z.union(typeLiterals);

export const bookingStatusSchema = z.object({
  status: statusSchema,
});

export type BookingStatusFormValues = z.infer<typeof bookingStatusSchema>;

// ─── Booking filter schema (used by the filter bar) ───────────────────────────

export const bookingFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.union([statusSchema, z.literal('')]).optional(),
  type: z.union([typeSchema, z.literal('')]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type BookingFiltersValues = z.infer<typeof bookingFiltersSchema>;
