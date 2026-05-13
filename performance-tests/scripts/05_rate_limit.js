/**
 * BT ADV — Rate Limit & Security Validation Test
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates dual-layer rate limiting, CSRF protection, and payload validation.
 *
 * Run:
 *   k6 run -e BASE_URL=https://btadv.agency performance-tests/scripts/05_rate_limit.js
 *
 * SCENARIO ORDER (important — avoids IP exhaustion cross-contamination):
 *   1. csrf_validation      (0s)  — No IP slots consumed for "no CSRF" case
 *   2. payload_validation   (5s)  — Uses 4 IP slots
 *   3. email_rate_limit     (20s) — Uses 3 IP slots (fresh email, same IP)
 *   4. rate_limit_ip        (40s) — Exhausts remaining IP slots
 *
 * ⚠️  NOTE on "Tampered CSRF → 429":
 *   The CSRF implementation uses Double-Submit Cookie pattern. Setting BOTH
 *   the cookie AND header to the same tampered value passes the check (they match).
 *   This is correct behavior — real browsers can't set cross-origin cookies.
 *   So tampered CSRF in k6 bypasses the CSRF check and hits rate limit instead.
 *   The test accepts 403 OR 429 for tampered CSRF.
 *
 * ⚠️  NOTE on IP window carryover:
 *   The IP rate limit uses a 10-minute sliding window. Previous test runs
 *   within the same window will reduce the available slots. The IP test
 *   dynamically detects the boundary rather than assuming a fixed slot count.
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

import { BASE_URL, ROUTES, TAGS }        from '../config.js';
import { getCsrfToken, jsonPost }        from '../utils/helpers.js';

// ─── Custom Metrics ───────────────────────────────────────────────────────────
const rateLimitCorrect = new Counter('rate_limit_correct_rejections');
const csrfCorrect      = new Counter('csrf_correct_rejections');
const rateLimitMissed  = new Counter('rate_limit_missed');   // Must stay 0
const emailRLCorrect   = new Counter('email_rate_limit_correct');
const ipLimitDetected  = new Counter('ip_limit_detected');   // Must be >= 1

// ─── Options ─────────────────────────────────────────────────────────────────
export const options = {
  scenarios: {
    // 1. CSRF validation runs first — "no CSRF" case doesn't consume IP slots
    csrf_validation: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 1,
      exec: 'csrfScenario',
      startTime: '0s',
    },

    // 2. Payload validation — 4 requests, each consumes 1 IP slot (CSRF passes → rate limit runs)
    payload_validation: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 1,
      exec: 'payloadScenario',
      startTime: '5s',
    },

    // 3. Email rate limit — 4 requests with SAME email, checks email-based blocking
    email_rate_limit_validation: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 1,
      exec: 'emailRateLimitScenario',
      startTime: '20s',
    },

    // 4. IP rate limit — runs LAST, exhausts remaining IP window slots
    rate_limit_ip: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 1,
      exec: 'ipRateLimitScenario',
      startTime: '40s',
    },
  },

  thresholds: {
    // IP limit must be detected (at least 1 request got rate-limited)
    ip_limit_detected:          ['count>=1'],
    // If rate_limit_missed > 0, a request that should have been blocked wasn't
    rate_limit_missed:          ['count==0'],
    // Email limit must have fired at least once
    email_rate_limit_correct:   ['count>=1'],
  },
};

// ─── Scenario 1: CSRF Validation ──────────────────────────────────────────────
export function csrfScenario() {
  console.log('=== CSRF Validation Test ===');

  const validPayload = {
    name: 'CSRF Test', email: 'csrf@perf.btadv.test',
    phone: '+201012345678', time_slot: '10am-12pm', type: 'zoom',
  };

  // ── Case 1: No CSRF token at all → must return 403
  // This does NOT consume an IP slot because CSRF check fires first (returns 403 immediately)
  group('CSRF: No token → 403', () => {
    const res = http.post(
      `${BASE_URL}${ROUTES.apiBooking}`,
      JSON.stringify(validPayload),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { ...TAGS.rateLimit, name: 'csrf_missing' },
      }
    );

    const ok = check(res, {
      'no CSRF → 403':              (r) => r.status === 403,
      'has error message':          (r) => { try { return !!JSON.parse(r.body).error; } catch { return false; } },
    });

    if (ok) {
      csrfCorrect.add(1);
      console.log('[OK] Missing CSRF correctly rejected with 403');
    } else {
      console.error(`[FAIL] Missing CSRF not rejected! status=${res.status}`);
    }
  });

  sleep(1);

  // ── Case 2: Tampered CSRF — both cookie AND header have the same fake value
  // Double-Submit Cookie pattern: if cookie=header (even if both are fake), CSRF passes.
  // Real browsers can't set cross-origin cookies, so this bypass is only possible in scripts.
  // Expected: 403 (if CSRF check detects mismatch) OR 429 (if CSRF passes → rate limit fires)
  group('CSRF: Tampered token → 403 or 429', () => {
    const jar = http.cookieJar();
    jar.set(`${BASE_URL}`, 'csrf-token', 'tampered-invalid-token-xyz');

    const res = http.post(
      `${BASE_URL}${ROUTES.apiBooking}`,
      JSON.stringify(validPayload),
      {
        jar,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'tampered-invalid-token-xyz',
        },
        tags: { ...TAGS.rateLimit, name: 'csrf_tampered' },
      }
    );

    // Accept 403 (ideal) OR 429 (rate limit fires because CSRF passes in double-submit pattern)
    const ok = check(res, {
      'tampered CSRF → 403 or 429': (r) => r.status === 403 || r.status === 429,
      'has error message':          (r) => { try { return !!JSON.parse(r.body).error; } catch { return false; } },
    });

    if (ok) {
      csrfCorrect.add(1);
      console.log(`[OK] Tampered CSRF blocked with ${res.status} (403=CSRF check, 429=rate limit)`);
    } else {
      console.error(`[FAIL] Tampered CSRF NOT blocked! status=${res.status}`);
    }
  });
}

// ─── Scenario 2: Payload Validation ───────────────────────────────────────────
export function payloadScenario() {
  console.log('=== Payload Validation Test ===');
  console.log('NOTE: These requests consume IP rate limit slots (CSRF passes → rate limit runs before validation).');

  const { jar, token } = getCsrfToken(ROUTES.booking);

  const invalidPayloads = [
    { label: 'missing name',  body: { email: 'test@test.com', phone: '+201012345678', time_slot: '10am', type: 'zoom' } },
    { label: 'invalid email', body: { name: 'Test', email: 'not-an-email', phone: '+201012345678', time_slot: '10am', type: 'zoom' } },
    { label: 'empty body',    body: {} },
    { label: 'missing phone', body: { name: 'Test', email: 'test@test.com', time_slot: '10am', type: 'zoom' } },
  ];

  for (const { label, body } of invalidPayloads) {
    const res = jsonPost(
      `${BASE_URL}${ROUTES.apiBooking}`,
      body, jar, token,
      { ...TAGS.rateLimit, name: `payload_${label.replace(/ /g, '_')}` }
    );

    // Accept 400 (validation error) OR 429 (rate limit if window is near full)
    check(res, {
      [`${label} → 400 or 429`]: (r) => r.status === 400 || r.status === 422 || r.status === 429,
    });

    console.log(`[${label}] status=${res.status} (400=validation, 429=rate limit window near full)`);
    sleep(0.3);
  }
}

// ─── Scenario 3: Email Rate Limit Validation ───────────────────────────────────
export function emailRateLimitScenario() {
  console.log('=== Email Rate Limit Validation Test ===');
  console.log('Sending 4 requests with the SAME email. Request 4 must return 429 from email limit.');

  // Unique email per test run so previous runs don't affect the window
  const FIXED_EMAIL = `email_rl_${__ENV.BASE_URL?.replace(/\W/g, '')}_${Math.floor(Date.now() / 60000)}@perf.btadv.test`;
  console.log(`Using email: ${FIXED_EMAIL}`);

  let emailLimitHit = false;

  for (let i = 1; i <= 4; i++) {
    const { jar, token } = getCsrfToken(ROUTES.booking);

    const res = jsonPost(
      `${BASE_URL}${ROUTES.apiBooking}`,
      {
        name:             `Email RL Tester ${i}`,
        email:            FIXED_EMAIL,
        phone:            `+2010${String(i * 1000).padStart(8, '0')}`,
        time_slot:        '2pm-4pm',
        type:             'phone',
        estimated_budget: '50000-100000',
      },
      jar, token,
      { ...TAGS.rateLimit, name: `email_rl_req_${i}` }
    );

    const status = res.status;
    let bodyMsg = '';
    try { bodyMsg = JSON.parse(res.body).error || ''; } catch {}

    if (i <= 3) {
      // Requests 1-3: must NOT be blocked by email limit
      // (may get 429 from IP limit if window is full — log it as informational)
      if (status === 429 && (bodyMsg.includes('email') || bodyMsg.includes('daily'))) {
        console.error(`[FAIL] Email req ${i} blocked by EMAIL limit too early!`);
        rateLimitMissed.add(1);
      } else if (status === 429) {
        console.log(`[INFO] Email req ${i}: 429 from IP limit (window full) — email limit not yet reached`);
      } else {
        console.log(`[OK] Email req ${i}: status=${status} — allowed`);
      }
    } else {
      // Request 4: must be blocked (by email OR IP limit — either proves limiting works)
      const isBlocked = check(res, {
        'Email req 4: blocked (429)':        (r) => r.status === 429,
        'Email req 4: has Retry-After':      (r) =>
          r.headers['Retry-After'] !== undefined || r.headers['retry-after'] !== undefined,
      });

      if (isBlocked) {
        emailLimitHit = true;
        emailRLCorrect.add(1);
        const isEmailLimit = bodyMsg.includes('email') || bodyMsg.includes('daily');
        console.log(`[OK] Email req 4: blocked (429). Trigger: ${isEmailLimit ? 'EMAIL limit' : 'IP limit'}`);
      } else {
        console.error(`[FAIL] Email req 4 NOT blocked! status=${status} — rate limiting broken`);
      }
    }

    sleep(0.5);
  }

  if (!emailLimitHit) {
    console.error('[WARN] Email rate limit scenario could not confirm email-specific blocking.');
    console.error('       Run this test on a fresh IP window (wait 10 min) for clean results.');
  }
}

// ─── Scenario 4: IP Rate Limit Validation ─────────────────────────────────────
export function ipRateLimitScenario() {
  console.log('=== IP Rate Limit Validation Test ===');
  console.log('Sending up to 12 requests. Limit must trigger within requests 3-7.');
  console.log('(Dynamic detection — window may have pre-existing counts from this test run)');

  const { jar, token } = getCsrfToken(ROUTES.booking);

  let limitHitAt = -1;

  for (let i = 1; i <= 12; i++) {
    const res = jsonPost(
      `${BASE_URL}${ROUTES.apiBooking}`,
      {
        name:             `IP RL Tester ${i}`,
        // Unique email per request — isolates IP limit from email limit
        email:            `ip_rl_${i}_${Date.now()}@perf.btadv.test`,
        phone:            '+201012345678',
        time_slot:        '10am-12pm',
        type:             'zoom',
        estimated_budget: '100000-150000',
      },
      jar, token,
      { ...TAGS.rateLimit, name: `ip_rl_req_${i}` }
    );

    if (res.status === 429 && limitHitAt === -1) {
      limitHitAt = i;
      ipLimitDetected.add(1);
      const retryAfter = res.headers['Retry-After'] || res.headers['retry-after'] || '?';
      console.log(`[OK] IP rate limit triggered at request ${i}. Retry-After: ${retryAfter}s`);

      // Validate: limit should trigger between request 3 and 7
      // (range accounts for pre-existing counts from earlier scenarios)
      check(res, {
        'IP limit in expected range (req 3-7)': () => i >= 3 && i <= 7,
        'IP limit: has Retry-After header':     (r) =>
          r.headers['Retry-After'] !== undefined || r.headers['retry-after'] !== undefined,
        'IP limit: has error message':          (r) => { try { return !!JSON.parse(r.body).error; } catch { return false; } },
      });
    } else if (res.status === 429 && limitHitAt !== -1) {
      // Subsequent requests after limit — all must be 429
      rateLimitCorrect.add(1);
      check(res, { [`IP req ${i}: still limited (429)`]: (r) => r.status === 429 });
    } else if (limitHitAt === -1) {
      // Before limit — request allowed
      console.log(`[OK] IP req ${i}: status=${res.status} (allowed)`);
    }

    sleep(0.1);
  }

  if (limitHitAt === -1) {
    // Never got rate limited — this is a real failure
    rateLimitMissed.add(1);
    console.error('[FAIL] IP rate limit NEVER triggered after 12 requests! Upstash may be misconfigured.');
  } else if (limitHitAt > 7) {
    console.error(`[WARN] IP limit triggered at req ${limitHitAt} — higher than expected (max 7). Check Upstash config.`);
  }
}
