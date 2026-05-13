/**
 * BT ADV — Stress Test
 * ─────────────────────────────────────────────────────────────────────────────
 * Pushes system beyond expected capacity to find the breaking point.
 * VUs ramp from 50 → 500 in stages. Test auto-stops when thresholds breach.
 *
 * Run:
 *   k6 run -e BASE_URL=https://btadv.agency performance-tests/scripts/02_stress.js
 *
 * With JSON output:
 *   k6 run --out json=performance-tests/reports/stress_results.json \
 *     -e BASE_URL=https://btadv.agency performance-tests/scripts/02_stress.js
 *
 * EXPECTED BEHAVIOR:
 *   Stage 1  (50 VUs)  → Baseline — should be green
 *   Stage 2  (100 VUs) → Comfortable — minor latency increase
 *   Stage 3  (150 VUs) → Approaching limit — watch DB connections
 *   Stage 4  (200 VUs) → Likely degradation start (Supabase pool pressure)
 *   Stage 5  (300 VUs) → Expected partial failures
 *   Stage 6  (500 VUs) → Expected connection exhaustion
 *   Stage 7  (0 VUs)   → Recovery observation
 *
 * NOTE: The test will automatically ABORT if error rate exceeds 10%
 * thanks to the abortOnFail threshold below.
 */

import http         from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

import { BASE_URL, ROUTES, TAGS }                from '../config.js';
import { getCsrfToken, thinkTime, weightedPage,
         randomBookingPayload, jsonPost }        from '../utils/helpers.js';

// ─── Custom Metrics ───────────────────────────────────────────────────────────
const errorRate      = new Rate('stress_error_rate');
const pageMs         = new Trend('stress_page_ms',    true);
const bookingMs      = new Trend('stress_booking_ms', true);
const dbErrors       = new Counter('db_errors');
const connectionErrs = new Counter('connection_errors');

// ─── Options ─────────────────────────────────────────────────────────────────
export const options = {
  scenarios: {
    stress_browsing: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '3m',  target: 50  }, // Stage 1 — baseline
        { duration: '5m',  target: 50  }, // Hold
        { duration: '3m',  target: 100 }, // Stage 2
        { duration: '5m',  target: 100 }, // Hold
        { duration: '3m',  target: 150 }, // Stage 3
        { duration: '5m',  target: 150 }, // Hold
        { duration: '3m',  target: 200 }, // Stage 4 — likely degradation start
        { duration: '5m',  target: 200 }, // Hold
        { duration: '3m',  target: 300 }, // Stage 5
        { duration: '5m',  target: 300 }, // Hold
        { duration: '3m',  target: 500 }, // Stage 6 — expected failure zone
        { duration: '5m',  target: 500 }, // Hold
        { duration: '5m',  target: 0   }, // Recovery
      ],
      exec: 'stressBrowsing',
      gracefulRampDown: '60s',
    },

    stress_booking: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '3m',  target: 5  },
        { duration: '5m',  target: 5  },
        { duration: '3m',  target: 10 },
        { duration: '5m',  target: 10 },
        { duration: '3m',  target: 20 },
        { duration: '5m',  target: 20 },
        { duration: '3m',  target: 30 },
        { duration: '13m', target: 30 },
        { duration: '5m',  target: 0  },
      ],
      exec: 'stressBooking',
      gracefulRampDown: '60s',
    },
  },

  thresholds: {
    stress_error_rate: [
      {
        threshold: 'rate<0.10',
        abortOnFail: true,       // AUTO-STOP if error rate exceeds 10%
        delayAbortEval: '30s',   // Wait 30s to confirm it's not a transient spike
      },
    ],
    http_req_failed:   ['rate<0.15'],
    http_req_duration: ['p(99)<15000'],
    stress_page_ms:    ['p(99)<8000'],
  },
};

// ─── Scenario: Stress Browsing ────────────────────────────────────────────────
export function stressBrowsing() {
  const page = weightedPage();

  const start = Date.now();
  const res = http.get(`${BASE_URL}${page.path}`, {
    tags: { ...TAGS.browsing, name: page.name },
    timeout: '15s',
  });
  pageMs.add(Date.now() - start);

  const isErr = res.status >= 500;
  errorRate.add(isErr ? 1 : 0);

  if (res.status === 503 || res.status === 502) {
    connectionErrs.add(1);
  }

  check(res, {
    [`${page.name}: not 5xx`]:        (r) => r.status < 500,
    [`${page.name}: responded`]:      (r) => r.status > 0,
  });

  // Under stress, reduce think time to maximize pressure
  sleep(0.5 + Math.random() * 1.5);
}

// ─── Scenario: Stress Booking API ─────────────────────────────────────────────
export function stressBooking() {
  const { jar, token } = getCsrfToken(ROUTES.booking);

  const start = Date.now();
  const res = jsonPost(
    `${BASE_URL}${ROUTES.apiBooking}`,
    randomBookingPayload(),
    jar,
    token,
    { ...TAGS.booking, name: 'StressBooking' }
  );
  bookingMs.add(Date.now() - start);

  // Classify errors
  if (res.status === 500) {
    dbErrors.add(1);
    errorRate.add(1);
    // Check if it's the unique constraint race condition
    if (res.body.includes('23505') || res.body.includes('unique')) {
      console.warn('[RACE CONDITION] Unique constraint violation on booking slot');
    }
  } else if (res.status === 503 || res.status === 502) {
    connectionErrs.add(1);
    errorRate.add(1);
  } else if (res.status === 429) {
    errorRate.add(0); // Rate limiting is expected, not an error
  } else {
    errorRate.add(res.status >= 400 ? 1 : 0);
  }

  check(res, {
    'stress booking: not 5xx':          (r) => r.status < 500 || r.status === 429,
    'stress booking: response received': (r) => r.timings.duration > 0,
  });

  sleep(0.2 + Math.random() * 0.8);
}
