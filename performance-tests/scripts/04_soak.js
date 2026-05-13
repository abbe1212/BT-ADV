/**
 * BT ADV — Soak (Endurance) Test
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs steady moderate load for 3 hours to detect:
 *   - Supabase connection pool drift (gradual exhaustion)
 *   - Memory leaks in Vercel serverless functions
 *   - Upstash Redis key expiry issues
 *   - Response time degradation over time (p95 creep)
 *   - Error rate drift (starts OK, worsens over time)
 *
 * Run (3-hour test):
 *   k6 run -e BASE_URL=https://btadv.agency performance-tests/scripts/04_soak.js
 *
 * Run shorter version for validation (30 min):
 *   k6 run -e BASE_URL=https://btadv.agency -e DURATION=30m performance-tests/scripts/04_soak.js
 *
 * WHAT TO WATCH:
 *   1. Supabase Dashboard → Database → "Connections" graph — should stay flat
 *   2. Vercel Dashboard → Functions → Error rate — should stay near 0%
 *   3. k6 p95 trend — should not increase over time
 *   4. Upstash console → Request count (free tier: 10k/day)
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

import { BASE_URL, ROUTES, TAGS }                from '../config.js';
import { getCsrfToken, thinkTime, weightedPage,
         randomBookingPayload, randomContactPayload,
         jsonPost }                             from '../utils/helpers.js';

// ─── Runtime config ───────────────────────────────────────────────────────────
const SOAK_DURATION = __ENV.DURATION || '3h';

// ─── Custom Metrics ───────────────────────────────────────────────────────────
const soakErrorRate  = new Rate('soak_error_rate');
const soakPageMs     = new Trend('soak_page_ms',    true);
const soakBookingMs  = new Trend('soak_booking_ms', true);
const soakContactMs  = new Trend('soak_contact_ms', true);
const soakRLHits     = new Counter('soak_rate_limit_hits');
const soakDbErrors   = new Counter('soak_db_errors');

// ─── Options ─────────────────────────────────────────────────────────────────
export const options = {
  scenarios: {
    soak_browsing: {
      executor: 'constant-vus',
      vus: 18,                    // 18 VUs browsing
      duration: SOAK_DURATION,
      exec: 'soakBrowsing',
    },

    soak_booking: {
      executor: 'constant-vus',
      vus: 5,                     // 5 VUs booking (realistic low rate)
      duration: SOAK_DURATION,
      exec: 'soakBooking',
    },

    soak_contact: {
      executor: 'constant-vus',
      vus: 2,                     // 2 VUs contact form
      duration: SOAK_DURATION,
      exec: 'soakContact',
    },
  },

  thresholds: {
    soak_error_rate:   ['rate<0.01'],   // Soak must stay very clean
    http_req_failed:   ['rate<0.01'],
    http_req_duration: ['p(95)<3000', 'p(99)<5000'],
    soak_page_ms:      ['p(95)<2500'],
    soak_booking_ms:   ['p(95)<5000'],
    soak_contact_ms:   ['p(95)<2000'],
  },
};

// ─── Scenario: Soak Browsing ───────────────────────────────────────────────────
export function soakBrowsing() {
  const page = weightedPage();

  const start = Date.now();
  const res = http.get(`${BASE_URL}${page.path}`, {
    tags: { ...TAGS.browsing, name: `soak_${page.name}` },
  });
  soakPageMs.add(Date.now() - start);

  const isErr = res.status >= 500;
  soakErrorRate.add(isErr ? 1 : 0);
  if (isErr) soakDbErrors.add(1);

  check(res, {
    [`soak ${page.name}: 200`]:    (r) => r.status === 200,
    [`soak ${page.name}: has body`]:(r) => r.body.length > 500,
  });

  thinkTime(3, 10); // Normal browsing pace
}

// ─── Scenario: Soak Booking ────────────────────────────────────────────────────
export function soakBooking() {
  // Check slots first (simulates realistic UX)
  group('Soak: Slot Check', () => {
    const res = http.get(`${BASE_URL}${ROUTES.apiSlots}`, { tags: TAGS.slots });
    check(res, { 'soak slots: 200': (r) => r.status === 200 });
  });

  thinkTime(2, 5);

  group('Soak: Booking Page', () => {
    http.get(`${BASE_URL}${ROUTES.booking}`, { tags: TAGS.booking });
  });

  thinkTime(8, 20); // Long think time — realistic form fill

  group('Soak: Booking Submit', () => {
    const { jar, token } = getCsrfToken(ROUTES.booking);

    const start = Date.now();
    const res = jsonPost(
      `${BASE_URL}${ROUTES.apiBooking}`,
      randomBookingPayload(),
      jar,
      token,
      { ...TAGS.booking, name: 'soak_booking' }
    );
    soakBookingMs.add(Date.now() - start);

    if (res.status === 429) { soakRLHits.add(1); soakErrorRate.add(0); return; }
    if (res.status >= 500)  { soakDbErrors.add(1); soakErrorRate.add(1); return; }

    soakErrorRate.add(res.status >= 400 ? 1 : 0);
    check(res, { 'soak booking: 200': (r) => r.status === 200 });
  });

  thinkTime(10, 30); // Long cool-down between bookings
}

// ─── Scenario: Soak Contact ────────────────────────────────────────────────────
export function soakContact() {
  group('Soak: Contact Page', () => {
    http.get(`${BASE_URL}${ROUTES.contact}`, { tags: TAGS.contact });
  });

  thinkTime(5, 15);

  group('Soak: Contact Submit', () => {
    const { jar, token } = getCsrfToken(ROUTES.contact);

    const start = Date.now();
    const res = jsonPost(
      `${BASE_URL}${ROUTES.apiContact}`,
      randomContactPayload(),
      jar,
      token,
      { ...TAGS.contact, name: 'soak_contact' }
    );
    soakContactMs.add(Date.now() - start);

    if (res.status === 429) { soakRLHits.add(1); soakErrorRate.add(0); return; }
    soakErrorRate.add(res.status >= 400 ? 1 : 0);
  });

  thinkTime(15, 40); // Very infrequent contact submissions
}
