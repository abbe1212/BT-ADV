/**
 * BT ADV — Concurrent Booking Slot Race Condition Test
 * ─────────────────────────────────────────────────────────────────────────────
 * 20 VUs simultaneously attempt to book the EXACT same (date, time_slot).
 * This exposes the race condition in the booking API:
 *
 *   CURRENT BEHAVIOR (BUG):
 *     - PostgreSQL throws error 23505 (unique_violation)
 *     - API returns HTTP 500 instead of HTTP 409
 *     - Client sees "Internal Server Error" instead of "Slot unavailable"
 *
 *   EXPECTED BEHAVIOR (AFTER FIX):
 *     - 1 request succeeds (HTTP 200 + ref_code)
 *     - All others get HTTP 409 with message "This slot is already booked"
 *
 * Run:
 *   k6 run -e BASE_URL=https://btadv.agency \
 *     -e TEST_DATE=2026-07-01 \
 *     performance-tests/scripts/06_concurrent_slots.js
 *
 * IMPORTANT: Use a FUTURE date that has no real bookings.
 * Set TEST_DATE in env or it defaults to a safe future date.
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

import { BASE_URL, ROUTES, TAGS } from '../config.js';
import { getCsrfToken, jsonPost }  from '../utils/helpers.js';

// ─── Custom Metrics ───────────────────────────────────────────────────────────
const successCount   = new Counter('slot_race_success');    // Should be exactly 1
const conflictCount  = new Counter('slot_race_conflict');   // Should be 19
const errorCount     = new Counter('slot_race_error_500'); // Should be 0 (BUG if > 0)
const raceErrRate    = new Rate('slot_race_error_rate');

// ─── Options ─────────────────────────────────────────────────────────────────
const TEST_DATE = __ENV.TEST_DATE || '2026-12-15'; // Far future — no real bookings

import { isSuccessful } from 'k6/http';

// Accept 200, 409 (expected conflict), 429 (expected rate limit) as non-failed
// This prevents rate-limited VUs from polluting the http_req_failed metric
export const options = {
  scenarios: {
    concurrent_slot_test: {
      executor: 'per-vu-iterations',
      vus: 20,
      iterations: 1,
      maxDuration: '2m',
      exec: 'concurrentSlotScenario',
    },
  },

  // Override which HTTP statuses count as "failed"
  // 429 = rate limited (expected), 409 = slot conflict (expected)
  httpDebug: 'full',

  thresholds: {
    // ✅ No 500 errors — zero tolerance (any 500 = race condition bug)
    slot_race_error_500: ['count==0'],
    // ✅ Zero real errors (rate limit and conflicts are NOT errors)
    slot_race_error_rate: ['rate==0'],
    // ✅ At most 1 successful booking for the same slot
    // If > 1, the DB has no UNIQUE constraint (slot double-booking bug)
    slot_race_success: ['count<=1'],
    // Relax http_req_failed — 429s are expected from rate limiting
    http_req_failed: ['rate<0.50'],
  },
};


// ─── Setup: All VUs get their CSRF tokens before the race ─────────────────────
export function setup() {
  console.log(`=== Concurrent Slot Race Condition Test ===`);
  console.log(`Target date: ${TEST_DATE}, slot: 10am-12pm`);
  console.log(`20 VUs will attempt to book the same slot simultaneously.`);
  console.log(`Expected: 1 success (HTTP 200), 19 conflicts (HTTP 409, not 500)`);
  console.log(`A 500 error indicates the race condition BUG is present.`);
  return { testDate: TEST_DATE };
}

// ─── Scenario: Concurrent Slot Booking ────────────────────────────────────────
export function concurrentSlotScenario(data) {
  // Each VU gets its own CSRF token (required per VU)
  const { jar, token } = getCsrfToken(ROUTES.booking);

  // All VUs use the EXACT SAME date and time_slot — this creates the race
  const payload = {
    name:             `Race Tester VU-${__VU}`,
    email:            `race_vu${__VU}@perf.btadv.test`,
    phone:            `+20101234${String(__VU).padStart(4, '0')}`,
    date:             data.testDate,
    time_slot:        '10am-12pm',
    type:             'zoom',
    estimated_budget: '100000-150000',
    notes:            `Concurrent slot race test VU ${__VU}`,
  };

  // Small random jitter (0–100ms) to simulate real-world near-simultaneous requests
  sleep(Math.random() * 0.1);

  const res = jsonPost(
    `${BASE_URL}${ROUTES.apiBooking}`,
    payload,
    jar,
    token,
    { ...TAGS.booking, name: 'concurrent_slot_race' }
  );

  // Classify each response
  switch (res.status) {
    case 200:
      successCount.add(1);
      raceErrRate.add(0);
      console.log(`[VU ${__VU}] SUCCESS: Got ref_code. This VU won the race.`);
      check(res, {
        'winner: has ref_code': (r) => {
          try { return !!JSON.parse(r.body).ref_code; } catch { return false; }
        },
      });
      break;

    case 409:
      conflictCount.add(1);
      raceErrRate.add(0);
      console.log(`[VU ${__VU}] EXPECTED CONFLICT (409): Slot already taken.`);
      check(res, {
        'conflict: has error message': (r) => {
          try { return !!JSON.parse(r.body).error; } catch { return false; }
        },
      });
      break;

    case 429:
      raceErrRate.add(0);
      console.log(`[VU ${__VU}] RATE LIMITED (429): Upstash blocked this VU.`);
      break;

    case 500:
      errorCount.add(1);
      raceErrRate.add(1);
      // Detect specific DB unique constraint error
      const isUniqueViolation = res.body.includes('23505') ||
                                res.body.includes('unique') ||
                                res.body.includes('duplicate');
      console.error(
        `[VU ${__VU}] BUG DETECTED: Got 500 instead of 409. ` +
        `UniqueViolation=${isUniqueViolation}. ` +
        `Body: ${res.body.slice(0, 200)}`
      );
      check(res, {
        'BUG: 500 should be 409': () => false, // Always fails — flags the bug
      });
      break;

    default:
      raceErrRate.add(1);
      console.warn(`[VU ${__VU}] Unexpected status ${res.status}: ${res.body.slice(0, 100)}`);
  }
}

// ─── Teardown: Print Summary ──────────────────────────────────────────────────
export function teardown(data) {
  console.log('\n=== Race Condition Test Summary ===');
  console.log(`Test date used: ${data.testDate}`);
  console.log(`Check the metrics above for:`);
  console.log(`  slot_race_success   → should be 1`);
  console.log(`  slot_race_conflict  → should be ~19 (minus any rate-limited)`);
  console.log(`  slot_race_error_500 → MUST be 0 (any value = BUG present)`);
}
