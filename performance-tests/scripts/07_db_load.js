/**
 * BT ADV — Database Direct Load Test (Supabase REST API)
 * ─────────────────────────────────────────────────────────────────────────────
 * Bypasses Next.js entirely and hits Supabase REST API directly.
 * This isolates DB performance from Vercel cold start / serverless overhead.
 *
 * Run:
 *   k6 run \
 *     -e SUPABASE_URL=https://YOUR_PROJECT.supabase.co \
 *     -e SUPABASE_ANON=your_anon_key_here \
 *     performance-tests/scripts/07_db_load.js
 *
 * HOW TO GET YOUR VALUES:
 *   SUPABASE_URL  → Supabase Dashboard → Settings → API → Project URL
 *   SUPABASE_ANON → Supabase Dashboard → Settings → API → anon public key
 *
 * WHAT THIS MEASURES:
 *   1. Read throughput — public SELECT queries (works, pricing, team, etc.)
 *   2. Write throughput — public INSERT (bookings, contact_messages)
 *   3. RLS overhead — queries with RLS policies active
 *   4. Connection pooling — max concurrent connections before saturation
 *   5. Index effectiveness — with/without indexed columns
 *
 * IMPORTANT NOTES:
 *   - Uses anon key (same as frontend) — tests real RLS policies
 *   - INSERT tests may create real records — use a test/staging Supabase project
 *   - Supabase free plan: 60 connections max; Pro: 200 connections max
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { randomIntBetween, randomString } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// ─── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL  = __ENV.SUPABASE_URL  || '';
const SUPABASE_ANON = __ENV.SUPABASE_ANON || '';

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error(
    'Missing env vars. Run with: -e SUPABASE_URL=... -e SUPABASE_ANON=...'
  );
}

const REST_BASE = `${SUPABASE_URL}/rest/v1`;
const HEADERS = {
  'apikey':        SUPABASE_ANON,
  'Authorization': `Bearer ${SUPABASE_ANON}`,
  'Content-Type':  'application/json',
  'Prefer':        'return=representation',
};

// ─── Custom Metrics ───────────────────────────────────────────────────────────
const readMs        = new Trend('db_read_ms',   true);
const writeMs       = new Trend('db_write_ms',  true);
const rlsMs         = new Trend('db_rls_ms',    true);
const dbErrorRate   = new Rate('db_error_rate');
const readRPS       = new Counter('db_reads_total');
const writeRPS      = new Counter('db_writes_total');

// ─── Options ─────────────────────────────────────────────────────────────────
export const options = {
  scenarios: {
    // Read-heavy (70% of traffic)
    db_reads: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 30 },
        { duration: '5m', target: 70 },
        { duration: '3m', target: 100 },  // Peak read load
        { duration: '3m', target: 100 },
        { duration: '2m', target: 0   },
      ],
      exec: 'dbReadScenario',
      gracefulRampDown: '30s',
    },

    // Write operations (30% of traffic)
    db_writes: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 5  },
        { duration: '5m', target: 15 },
        { duration: '3m', target: 30 },  // Peak write load
        { duration: '3m', target: 30 },
        { duration: '2m', target: 0  },
      ],
      exec: 'dbWriteScenario',
      gracefulRampDown: '30s',
    },
  },

  thresholds: {
    db_error_rate: ['rate<0.02'],
    db_read_ms:    ['p(95)<300', 'p(99)<600'],  // DB reads should be fast
    db_write_ms:   ['p(95)<500', 'p(99)<1000'],
    db_rls_ms:     ['p(95)<400'],               // RLS overhead target
    http_req_failed: ['rate<0.02'],
  },
};

// ─── Helper: Supabase GET ──────────────────────────────────────────────────────
function supabaseGet(table, query = '', tags = {}) {
  return http.get(
    `${REST_BASE}/${table}${query ? `?${query}` : ''}`,
    { headers: HEADERS, tags }
  );
}

// ─── Helper: Supabase POST (INSERT) ───────────────────────────────────────────
function supabaseInsert(table, payload, tags = {}) {
  return http.post(
    `${REST_BASE}/${table}`,
    JSON.stringify(payload),
    { headers: HEADERS, tags }
  );
}

// ─── Scenario: DB Reads ────────────────────────────────────────────────────────
export function dbReadScenario() {
  const readTests = [
    // Test 1: Public works SELECT (uses category + order_index index)
    () => {
      group('DB: works SELECT (indexed)', () => {
        const start = Date.now();
        const res = supabaseGet(
          'works',
          'select=id,title_en,category,image_url,featured&order=order_index.asc&limit=20',
          { name: 'db_works_select' }
        );
        readMs.add(Date.now() - start);
        readRPS.add(1);
        dbErrorRate.add(res.status >= 400 ? 1 : 0);
        check(res, {
          'works: 200':           (r) => r.status === 200,
          'works: returns array': (r) => {
            try { return Array.isArray(JSON.parse(r.body)); } catch { return false; }
          },
          'works: < 300ms':       (r) => r.timings.duration < 300,
        });
      });
    },

    // Test 2: Featured works (partial index test)
    () => {
      group('DB: works featured filter', () => {
        const start = Date.now();
        const res = supabaseGet(
          'works',
          'select=*&featured=eq.true&order=order_index.asc',
          { name: 'db_works_featured' }
        );
        readMs.add(Date.now() - start);
        readRPS.add(1);
        dbErrorRate.add(res.status >= 400 ? 1 : 0);
        check(res, { 'featured works: 200': (r) => r.status === 200 });
      });
    },

    // Test 3: Pricing SELECT (small table, should be very fast)
    () => {
      group('DB: pricing SELECT', () => {
        const start = Date.now();
        const res = supabaseGet(
          'pricing',
          'select=*&order=order_index.asc',
          { name: 'db_pricing_select' }
        );
        readMs.add(Date.now() - start);
        readRPS.add(1);
        dbErrorRate.add(res.status >= 400 ? 1 : 0);
        check(res, {
          'pricing: 200':     (r) => r.status === 200,
          'pricing: < 150ms': (r) => r.timings.duration < 150,
        });
      });
    },

    // Test 4: Booking slots availability (date-indexed query)
    () => {
      group('DB: bookings slots check (date index)', () => {
        const start = Date.now();
        const res = supabaseGet(
          'bookings',
          'select=date,time_slot&status=neq.cancelled&order=date.asc',
          { name: 'db_booking_slots' }
        );
        rlsMs.add(Date.now() - start); // RLS active on bookings
        readRPS.add(1);
        // Bookings might return 401 (RLS requires auth for SELECT)
        dbErrorRate.add(res.status >= 500 ? 1 : 0);
        check(res, {
          'slots: not 500': (r) => r.status !== 500,
        });
      });
    },

    // Test 5: Team SELECT
    () => {
      group('DB: team SELECT', () => {
        const start = Date.now();
        const res = supabaseGet(
          'team',
          'select=*&order=order_index.asc',
          { name: 'db_team_select' }
        );
        readMs.add(Date.now() - start);
        readRPS.add(1);
        dbErrorRate.add(res.status >= 400 ? 1 : 0);
        check(res, { 'team: 200': (r) => r.status === 200 });
      });
    },

    // Test 6: Careers open filter
    () => {
      group('DB: careers open filter', () => {
        const start = Date.now();
        const res = supabaseGet(
          'careers',
          'select=*&is_open=eq.true',
          { name: 'db_careers_open' }
        );
        readMs.add(Date.now() - start);
        readRPS.add(1);
        dbErrorRate.add(res.status >= 400 ? 1 : 0);
        check(res, { 'careers: 200': (r) => r.status === 200 });
      });
    },
  ];

  // Execute a random read test
  const test = readTests[randomIntBetween(0, readTests.length - 1)];
  test();

  sleep(0.2 + Math.random() * 0.8);
}

// ─── Scenario: DB Writes ───────────────────────────────────────────────────────
export function dbWriteScenario() {
  const uid = randomString(8);

  const writeTests = [
    // Test 1: INSERT into contact_messages (public INSERT allowed)
    () => {
      group('DB: contact_messages INSERT', () => {
        const start = Date.now();
        const res = supabaseInsert(
          'contact_messages',
          {
            name:    `DB Load Test ${uid}`,
            email:   `dbtest_${uid}@perf.test`,
            phone:   `+2010${randomIntBetween(10000000, 99999999)}`,
            message: 'Automated DB load test message. Please disregard.',
          },
          { name: 'db_contact_insert' }
        );
        writeMs.add(Date.now() - start);
        writeRPS.add(1);
        dbErrorRate.add(res.status >= 500 ? 1 : 0);
        check(res, {
          'contact insert: 200 or 201': (r) => r.status === 200 || r.status === 201,
          'contact insert: < 500ms':    (r) => r.timings.duration < 500,
        });
      });
    },

    // Test 2: INSERT into bookings (public INSERT allowed, unique constraint test)
    () => {
      group('DB: bookings INSERT', () => {
        // Generate unique time to avoid conflict
        const uniqueSlot = `${randomIntBetween(6, 22)}:${randomIntBetween(0,1) === 0 ? '00' : '30'}`;
        const futureDate = `2026-${String(randomIntBetween(8, 12)).padStart(2,'0')}-${String(randomIntBetween(1, 28)).padStart(2,'0')}`;

        const start = Date.now();
        const res = supabaseInsert(
          'bookings',
          {
            ref_code:  `DB-${uid.toUpperCase()}`,
            name:      `DB Load Test ${uid}`,
            email:     `dbtest_${uid}@perf.test`,
            phone:     `+2010${randomIntBetween(10000000, 99999999)}`,
            date:      futureDate,
            time_slot: uniqueSlot,
            type:      'zoom',
            status:    'pending',
          },
          { name: 'db_booking_insert' }
        );
        writeMs.add(Date.now() - start);
        writeRPS.add(1);

        // 23505 (unique violation) is expected occasionally — not a real error
        const is23505 = res.status === 409 ||
          (res.body && res.body.includes('23505'));

        dbErrorRate.add(res.status >= 500 && !is23505 ? 1 : 0);

        check(res, {
          'booking insert: not 500': (r) =>
            r.status !== 500 || (r.body && r.body.includes('23505')),
          'booking insert: < 800ms': (r) => r.timings.duration < 800,
        });
      });
    },
  ];

  const test = writeTests[randomIntBetween(0, writeTests.length - 1)];
  test();

  sleep(0.5 + Math.random() * 1.5);
}
