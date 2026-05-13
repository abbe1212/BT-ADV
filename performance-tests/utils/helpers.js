/**
 * BT ADV — Shared k6 Utilities
 * ─────────────────────────────────────────────────────────────────────────────
 * Usage: import { getCsrfToken, thinkTime, weightedPage, randomBookingPayload }
 *          from '../utils/helpers.js';
 */

import http  from 'k6/http';
import { sleep } from 'k6';
import { randomIntBetween, randomString } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { BASE_URL, MEETING_TYPES, BUDGETS, TIME_SLOTS, PAGE_WEIGHTS } from '../config.js';

// ─── CSRF Token Extraction ───────────────────────────────────────────────────
/**
 * Hits a page to trigger middleware CSRF cookie generation.
 * Returns { jar, token } ready for use in POST requests.
 *
 * The middleware sets `csrf-token` cookie on first GET to non-API routes.
 * The client must echo it as `X-CSRF-Token` request header.
 */
export function getCsrfToken(path = '/booking') {
  const jar = http.cookieJar();
  const pageRes = http.get(`${BASE_URL}${path}`, { jar, tags: { name: 'csrf_prefetch' } });

  // Primary: read from Set-Cookie response header (catches fresh cookie reliably)
  let token = '';
  const setCookie = pageRes.headers['Set-Cookie'] || pageRes.headers['set-cookie'] || '';
  const match = setCookie.match(/csrf-token=([^;]+)/);
  if (match) {
    token = match[1];
  } else {
    // Fallback: read from VU cookie jar (works if cookie was already set on prev request)
    const cookies = jar.cookiesForURL(`${BASE_URL}${path}`);
    const csrfArr = cookies['csrf-token'];
    // k6 cookiesForURL returns arrays of STRINGS — use arr[0] directly, not arr[0].value
    token = csrfArr && csrfArr.length > 0 ? csrfArr[0] : '';
  }

  if (!token) {
    console.warn(`[getCsrfToken] No csrf-token for ${path} — middleware may not have set it (cookie already existed).`);
  }

  return { jar, token };
}

// ─── Think Time ───────────────────────────────────────────────────────────────
/**
 * Realistic user pause between actions.
 * @param {number} minSec - minimum seconds (default 1)
 * @param {number} maxSec - maximum seconds (default 5)
 */
export function thinkTime(minSec = 1, maxSec = 5) {
  sleep(randomIntBetween(minSec * 10, maxSec * 10) / 10);
}

// ─── Weighted Page Selector ───────────────────────────────────────────────────
/**
 * Randomly selects a page based on traffic weights defined in config.
 * Simulates real-world page visit distribution.
 */
export function weightedPage() {
  const roll = randomIntBetween(1, 100);
  let cumulative = 0;
  for (const page of PAGE_WEIGHTS) {
    cumulative += page.weight;
    if (roll <= cumulative) return page;
  }
  return PAGE_WEIGHTS[0];
}

// ─── Random Booking Payload ───────────────────────────────────────────────────
/**
 * Generates a realistic booking form payload.
 * Varies meeting type, budget, and time slot to simulate real diversity.
 */
export function randomBookingPayload() {
  const vu   = __VU   || 0;
  const iter = __ITER || 0;
  const uid  = randomString(6);

  return {
    name:             `Load Test User ${uid}`,
    email:            `lt_${uid}_${vu}_${iter}@perf.btadv.test`,
    phone:            `+2010${randomIntBetween(10000000, 99999999)}`,
    time_slot:        TIME_SLOTS[randomIntBetween(0, TIME_SLOTS.length - 1)],
    type:             MEETING_TYPES[randomIntBetween(0, MEETING_TYPES.length - 1)],
    estimated_budget: BUDGETS[randomIntBetween(0, BUDGETS.length - 1)],
    company_name:     `Test Co ${uid}`,
    industry:         'Technology',
    notes:            'Automated k6 performance test — not a real booking.',
  };
}

// ─── Random Contact Payload ────────────────────────────────────────────────────
export function randomContactPayload() {
  const uid = randomString(6);
  return {
    name:    `Contact Test ${uid}`,
    email:   `contact_${uid}@perf.btadv.test`,
    phone:   `+2010${randomIntBetween(10000000, 99999999)}`,
    message: 'This is an automated k6 performance test message. Please ignore.',
  };
}

// ─── JSON POST Helper ──────────────────────────────────────────────────────────
/**
 * Sends a JSON POST with CSRF token and correct headers.
 */
export function jsonPost(url, payload, jar, csrfToken, tags = {}) {
  return http.post(url, JSON.stringify(payload), {
    jar,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    tags,
  });
}

// ─── Check Response Helper ──────────────────────────────────────────────────────
/**
 * Logs failures with context for debugging.
 * Returns true if all checks pass.
 */
export function logFailure(res, scenario, expected) {
  if (res.status !== expected && res.status !== 429) {
    console.error(
      `[${scenario}] FAIL | status=${res.status} | url=${res.url} | body=${res.body.slice(0, 300)}`
    );
    return false;
  }
  return true;
}
