/**
 * BT ADV — Shared k6 Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * Usage: import { CONFIG, THRESHOLDS, TAGS } from '../config.js';
 *
 * Set BASE_URL at runtime:
 *   k6 run -e BASE_URL=https://btadv.agency scripts/load.js
 *
 * Or export it in your shell:
 *   export BASE_URL=https://btadv.agency
 */

// ─── Base URL ────────────────────────────────────────────────────────────────
export const BASE_URL = __ENV.BASE_URL || 'https://btadv.agency';

// ─── Supabase direct (for DB load tests) ────────────────────────────────────
export const SUPABASE_URL  = __ENV.SUPABASE_URL  || '';  // your project URL
export const SUPABASE_ANON = __ENV.SUPABASE_ANON || '';  // anon public key

// ─── Route Map ───────────────────────────────────────────────────────────────
export const ROUTES = {
  // Public pages
  home:     '/',
  works:    '/works',
  pricing:  '/pricing',
  about:    '/about',
  bts:      '/bts',
  teamwork: '/teamwork',
  careers:  '/careers',
  contact:  '/contact',
  booking:  '/booking',
  clients:  '/clients',

  // API routes
  apiBooking:  '/api/booking',
  apiSlots:    '/api/booking/slots',
  apiContact:  '/api/contact',
  apiUpload:   '/api/upload',

  // Admin
  adminLogin:    '/admin/login',
  adminDash:     '/admin',
  adminBookings: '/admin/bookings',
  adminWorks:    '/admin/works',
  adminMessages: '/admin/messages',
};

// ─── Page traffic weights (must sum to 100) ──────────────────────────────────
export const PAGE_WEIGHTS = [
  { path: ROUTES.home,     name: 'Homepage',  weight: 35 },
  { path: ROUTES.works,    name: 'Works',     weight: 22 },
  { path: ROUTES.pricing,  name: 'Pricing',   weight: 16 },
  { path: ROUTES.about,    name: 'About',     weight: 10 },
  { path: ROUTES.booking,  name: 'Booking',   weight: 8  },
  { path: ROUTES.bts,      name: 'BTS',       weight: 4  },
  { path: ROUTES.teamwork, name: 'Team',      weight: 3  },
  { path: ROUTES.careers,  name: 'Careers',   weight: 2  },
];

// ─── Global Thresholds ────────────────────────────────────────────────────────
export const THRESHOLDS = {
  // HTTP baselines
  http_req_failed:   ['rate<0.02'],
  http_req_duration: ['p(95)<3000', 'p(99)<6000'],

  // Page loads
  page_load_ms: ['p(95)<2500', 'p(99)<4000'],

  // Booking API (includes email dispatch ~800ms)
  booking_duration_ms: ['p(95)<5000', 'p(99)<8000'],
  booking_error_rate:  ['rate<0.03'],

  // Slot availability
  slot_query_ms: ['p(95)<800', 'p(99)<1500'],

  // Contact form
  contact_duration_ms: ['p(95)<2000'],
  contact_error_rate:  ['rate<0.02'],

  // Admin middleware — p(95)<700 accounts for Vercel cold start on /admin edge route
  middleware_ms: ['p(95)<700', 'p(99)<1200'],
};

// ─── Booking test payloads ────────────────────────────────────────────────────
export const MEETING_TYPES = ['zoom', 'phone', 'onsite'];
export const BUDGETS = [
  '50000-100000',
  '100000-150000',
  '150000-250000',
  '300000-400000',
  '500000+',
];
export const TIME_SLOTS = [
  '10am-12pm',
  '12pm-2pm',
  '2pm-4pm',
  '4pm-6pm',
];

// ─── Tags ────────────────────────────────────────────────────────────────────
export const TAGS = {
  booking:    { scenario: 'booking'    },
  contact:    { scenario: 'contact'    },
  browsing:   { scenario: 'browsing'   },
  admin:      { scenario: 'admin'      },
  slots:      { scenario: 'slots'      },
  db:         { scenario: 'db_direct'  },
  rateLimit:  { scenario: 'ratelimit'  },
};
