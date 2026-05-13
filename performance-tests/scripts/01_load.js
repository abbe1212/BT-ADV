/**
 * BT ADV — Load Test
 * ─────────────────────────────────────────────────────────────────────────────
 * Simulates normal production traffic across all public pages + booking funnel.
 *
 * Run:
 *   k6 run -e BASE_URL=https://btadv.agency performance-tests/scripts/01_load.js
 *
 * With dashboard:
 *   k6 run --out web-dashboard -e BASE_URL=https://btadv.agency performance-tests/scripts/01_load.js
 *
 * With JSON output:
 *   k6 run --out json=performance-tests/reports/load_results.json \
 *     -e BASE_URL=https://btadv.agency performance-tests/scripts/01_load.js
 *
 * Stages:
 *   0:00 – 2:00  → Ramp from 0 to 20 VUs   (warm up)
 *   2:00 – 7:00  → Hold at 50 VUs           (baseline load)
 *   7:00 – 12:00 → Hold at 50 VUs           (continued steady)
 *   12:00– 15:00 → Ramp down to 0           (cool down)
 */

import http            from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

import { BASE_URL, ROUTES, THRESHOLDS, TAGS }                from '../config.js';
import { getCsrfToken, thinkTime, weightedPage,
         randomBookingPayload, randomContactPayload,
         jsonPost, logFailure }                              from '../utils/helpers.js';

// ─── Custom Metrics ───────────────────────────────────────────────────────────
const pageLoadMs      = new Trend('page_load_ms',        true);
const bookingMs       = new Trend('booking_duration_ms', true);
const slotMs          = new Trend('slot_query_ms',       true);
const contactMs       = new Trend('contact_duration_ms', true);
const middlewareMs    = new Trend('middleware_ms',        true);
const bookingErrRate  = new Rate('booking_error_rate');
const contactErrRate  = new Rate('contact_error_rate');
const bookings        = new Counter('total_bookings_attempted');
const rateLimitHits   = new Counter('rate_limit_hits');

// ─── Options ─────────────────────────────────────────────────────────────────
export const options = {
  scenarios: {
    // 70% of load — realistic page browsing
    browsing: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m',  target: 14 },
        { duration: '5m',  target: 35 },
        { duration: '5m',  target: 35 },
        { duration: '3m',  target: 0  },
      ],
      exec: 'browsingScenario',
      gracefulRampDown: '30s',
    },

    // 20% of load — booking flow
    booking_funnel: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m',  target: 4  },
        { duration: '5m',  target: 10 },
        { duration: '5m',  target: 10 },
        { duration: '3m',  target: 0  },
      ],
      exec: 'bookingScenario',
      gracefulRampDown: '30s',
    },

    // 5% of load — contact form
    contact_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m',  target: 1 },
        { duration: '8m',  target: 3 },
        { duration: '5m',  target: 0 },
      ],
      exec: 'contactScenario',
      gracefulRampDown: '30s',
    },

    // 5% of load — admin middleware cost (unauthenticated probes)
    admin_probe: {
      executor: 'constant-vus',
      vus: 2,
      duration: '15m',
      exec: 'adminProbeScenario',
    },
  },

  thresholds: {
    ...THRESHOLDS,
    // Load-test-specific (tighter than stress)
    http_req_failed:   ['rate<0.01'],
    // p(99) relaxed to 6s — p(95) is the real gate; p(99) tail is Vercel cold starts
    http_req_duration: ['p(95)<2500', 'p(99)<6000'],
  },
};

// ─── Scenario: Browsing ────────────────────────────────────────────────────────
export function browsingScenario() {
  const page = weightedPage();

  group(`Browse: ${page.name}`, () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}${page.path}`, {
      tags: { ...TAGS.browsing, page: page.name },
    });
    pageLoadMs.add(Date.now() - start);

    check(res, {
      [`${page.name} status 200`]:       (r) => r.status === 200,
      [`${page.name} has body`]:         (r) => r.body.length > 500,
      [`${page.name} no server error`]:  (r) => !r.body.includes('Internal Server Error'),
    });
  });

  thinkTime(2, 8);
}

// ─── Scenario: Booking Funnel ─────────────────────────────────────────────────
export function bookingScenario() {
  // Step 1: Check available slots — requires ?date=YYYY-MM-DD or the API returns 400
  group('Booking: Slot Availability', () => {
    // Pick a random future date (1-30 days out) to simulate real availability checks
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + randomIntBetween(1, 30));
    const dateStr = futureDate.toISOString().slice(0, 10); // YYYY-MM-DD

    const start = Date.now();
    const res = http.get(`${BASE_URL}${ROUTES.apiSlots}?date=${dateStr}`, {
      tags: TAGS.slots,
    });
    slotMs.add(Date.now() - start);

    check(res, {
      'slots: 200':          (r) => r.status === 200,
      'slots: JSON body':    (r) => {
        try { JSON.parse(r.body); return true; } catch { return false; }
      },
    });
  });

  thinkTime(1, 3); // User looks at available dates

  // Step 2: Load booking page (triggers CSRF cookie)
  group('Booking: Load Page', () => {
    const res = http.get(`${BASE_URL}${ROUTES.booking}`, { tags: TAGS.booking });
    check(res, { 'booking page 200': (r) => r.status === 200 });
  });

  thinkTime(5, 15); // User fills the form

  // Step 3: Submit booking
  group('Booking: Submit', () => {
    const { jar, token } = getCsrfToken(ROUTES.booking);
    const payload = randomBookingPayload();
    bookings.add(1);

    const start = Date.now();
    const res = jsonPost(
      `${BASE_URL}${ROUTES.apiBooking}`,
      payload,
      jar,
      token,
      { ...TAGS.booking, name: 'BookingSubmit' }
    );
    bookingMs.add(Date.now() - start);

    if (res.status === 429) {
      rateLimitHits.add(1);
      bookingErrRate.add(0); // 429 is expected, not an error
      return;
    }

    const ok = check(res, {
      'booking: 200':           (r) => r.status === 200,
      'booking: has ref_code':  (r) => {
        try { return !!JSON.parse(r.body).ref_code; } catch { return false; }
      },
      'booking: no db error':   (r) => !r.body.includes('duplicate'),
    });

    bookingErrRate.add(ok ? 0 : 1);
    if (!ok) logFailure(res, 'BookingSubmit', 200);
  });

  thinkTime(3, 6);
}

// ─── Scenario: Contact Flow ────────────────────────────────────────────────────
export function contactScenario() {
  group('Contact: Load Page', () => {
    const res = http.get(`${BASE_URL}${ROUTES.contact}`, { tags: TAGS.contact });
    check(res, { 'contact page 200': (r) => r.status === 200 });
  });

  thinkTime(3, 10);

  group('Contact: Submit Form', () => {
    const { jar, token } = getCsrfToken(ROUTES.contact);
    const payload = randomContactPayload();

    const start = Date.now();
    const res = jsonPost(
      `${BASE_URL}${ROUTES.apiContact}`,
      payload,
      jar,
      token,
      { ...TAGS.contact, name: 'ContactSubmit' }
    );
    contactMs.add(Date.now() - start);

    if (res.status === 429) { rateLimitHits.add(1); contactErrRate.add(0); return; }

    const ok = check(res, {
      'contact: 200 or 201': (r) => r.status === 200 || r.status === 201,
    });
    contactErrRate.add(ok ? 0 : 1);
    if (!ok) logFailure(res, 'ContactSubmit', 200);
  });

  thinkTime(5, 10);
}

// ─── Scenario: Admin Middleware Probe ─────────────────────────────────────────
export function adminProbeScenario() {
  group('Admin: Middleware Auth Cost', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}${ROUTES.adminDash}`, {
      redirects: 0,
      tags: { ...TAGS.admin, name: 'AdminMiddleware' },
    });
    middlewareMs.add(Date.now() - start);

    check(res, {
      'admin: redirects to login':     (r) => r.status === 302 || r.status === 307,
      'admin: Location has /login':    (r) =>
        (r.headers['Location'] || r.headers['location'] || '').includes('/login'),
    });
  });

  thinkTime(2, 5);
}
