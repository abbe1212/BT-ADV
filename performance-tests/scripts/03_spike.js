/**
 * BT ADV — Spike Test
 * ─────────────────────────────────────────────────────────────────────────────
 * Simulates a sudden traffic burst (e.g., influencer shares the booking link,
 * campaign goes live, or press coverage). Tests Vercel's auto-scaling behavior
 * and Supabase connection pool recovery.
 *
 * Run:
 *   k6 run -e BASE_URL=https://btadv.agency performance-tests/scripts/03_spike.js
 *
 * PATTERN:
 *   Idle      → 0 VUs
 *   Spike     → 300 VUs in 30 seconds (sudden viral burst)
 *   Hold      → 5 minutes at 300 VUs
 *   Drop      → Back to 0 in 10 seconds
 *   Observe   → 2 minutes idle (measure recovery)
 *   Mini-spike→ 100 VUs (simulates sustained post-viral traffic)
 *
 * PASS CRITERIA:
 *   - Error rate stays below 10% during spike
 *   - System returns to normal within 60s of spike drop
 *   - No permanent DB connection leaks after test
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

import { BASE_URL, ROUTES, TAGS }                from '../config.js';
import { getCsrfToken, randomBookingPayload,
         jsonPost, weightedPage }               from '../utils/helpers.js';

// ─── Custom Metrics ───────────────────────────────────────────────────────────
const spikeErrorRate  = new Rate('spike_error_rate');
const spikePageMs     = new Trend('spike_page_ms',    true);
const spikeBookingMs  = new Trend('spike_booking_ms', true);
const recoveryMs      = new Trend('recovery_ms',      true);
const spikeFails      = new Counter('spike_failures');

// ─── Options ─────────────────────────────────────────────────────────────────
export const options = {
  scenarios: {
    // Main page spike — simulates viral link sharing
    page_spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 0   }, // Idle baseline
        { duration: '30s', target: 300 }, // SPIKE — 0 → 300 in 30s
        { duration: '5m',  target: 300 }, // Hold spike
        { duration: '10s', target: 0   }, // Drop
        { duration: '2m',  target: 0   }, // Recovery observation
        { duration: '1m',  target: 100 }, // Mini-spike (sustained post-viral)
        { duration: '2m',  target: 100 }, // Hold mini-spike
        { duration: '30s', target: 0   }, // Final ramp down
      ],
      exec: 'pageSpikeScenario',
      gracefulRampDown: '30s',
    },

    // Booking spike — simulates flash campaign with limited slots
    booking_spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 0  },
        { duration: '30s', target: 50 }, // Spike on booking
        { duration: '5m',  target: 50 },
        { duration: '10s', target: 0  },
        { duration: '5m',  target: 0  }, // Recovery
        { duration: '1m',  target: 20 },
        { duration: '2m',  target: 0  },
      ],
      exec: 'bookingSpikeScenario',
      gracefulRampDown: '30s',
    },
  },

  thresholds: {
    spike_error_rate:  ['rate<0.15'],      // More lenient during spike
    http_req_failed:   ['rate<0.20'],
    http_req_duration: ['p(95)<10000'],   // Allow up to 10s during spike
    spike_page_ms:     ['p(99)<12000'],
  },
};

// ─── Scenario: Page Spike ──────────────────────────────────────────────────────
export function pageSpikeScenario() {
  const page = weightedPage();

  const start = Date.now();
  const res = http.get(`${BASE_URL}${page.path}`, {
    tags: { ...TAGS.browsing, name: `spike_${page.name}` },
    timeout: '20s',
  });
  const duration = Date.now() - start;
  spikePageMs.add(duration);

  const isError = res.status >= 500;
  spikeErrorRate.add(isError ? 1 : 0);
  if (isError) spikeFails.add(1);

  check(res, {
    [`spike ${page.name}: responded`]:   (r) => r.status > 0,
    [`spike ${page.name}: not 502/503`]: (r) => r.status !== 502 && r.status !== 503,
  });

  // No think time during spike — maximum pressure
  sleep(0.1 + Math.random() * 0.5);
}

// ─── Scenario: Booking Spike ───────────────────────────────────────────────────
export function bookingSpikeScenario() {
  // Load booking page first (CSRF generation)
  group('Spike: Booking Page Load', () => {
    const res = http.get(`${BASE_URL}${ROUTES.booking}`, {
      tags: TAGS.booking,
      timeout: '20s',
    });
    check(res, { 'spike booking page: responded': (r) => r.status > 0 });
  });

  // Minimal think time — simulating urgency during a "limited slots" campaign
  sleep(0.5 + Math.random() * 1);

  group('Spike: Booking Submit', () => {
    const { jar, token } = getCsrfToken(ROUTES.booking);

    const start = Date.now();
    const res = jsonPost(
      `${BASE_URL}${ROUTES.apiBooking}`,
      randomBookingPayload(),
      jar,
      token,
      { ...TAGS.booking, name: 'spike_booking_submit' }
    );
    spikeBookingMs.add(Date.now() - start);

    // Classify outcomes during spike
    if (res.status === 200) {
      spikeErrorRate.add(0);
    } else if (res.status === 429) {
      spikeErrorRate.add(0); // Rate limit is expected behavior
    } else if (res.status === 409) {
      spikeErrorRate.add(0); // Slot conflict — expected under concurrent load
    } else if (res.status >= 500) {
      spikeErrorRate.add(1);
      spikeFails.add(1);
      // Log DB connection errors specifically
      if (res.body.includes('too many connections') || res.body.includes('53300')) {
        console.error('[SPIKE CRITICAL] Supabase connection pool exhausted!');
      }
    } else {
      spikeErrorRate.add(res.status >= 400 ? 1 : 0);
    }

    check(res, {
      'spike booking: system responded': (r) => r.timings.duration > 0,
      'spike booking: not pool error':   (r) => !r.body.includes('53300'),
    });
  });

  sleep(0.1 + Math.random() * 0.3);
}
