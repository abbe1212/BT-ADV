# BT ADV — Performance Test Report
**Date:** _______________  
**Tester:** _______________  
**Environment:** ☐ Production  ☐ Staging  
**Base URL:** _______________  
**Supabase Plan:** ☐ Free  ☐ Pro  ☐ Team  
**Vercel Plan:** ☐ Hobby  ☐ Pro  ☐ Enterprise  
**k6 Version:** _______________

---

## 1. Test Execution Summary

| Test | Script | Status | Duration | Notes |
|---|---|---|---|---|
| Smoke Test | 08_smoke.js | ☐ PASS ☐ FAIL | ~2 min | |
| Load Test | 01_load.js | ☐ PASS ☐ FAIL | 15 min | |
| Stress Test | 02_stress.js | ☐ PASS ☐ FAIL | 40 min | |
| Spike Test | 03_spike.js | ☐ PASS ☐ FAIL | 12 min | |
| Soak Test | 04_soak.js | ☐ PASS ☐ FAIL | 3 hours | |
| Rate Limit | 05_rate_limit.js | ☐ PASS ☐ FAIL | 5 min | |
| Slot Race | 06_concurrent_slots.js | ☐ PASS ☐ FAIL | 2 min | |
| DB Direct | 07_db_load.js | ☐ PASS ☐ FAIL | 15 min | |

---

## 2. Load Test Results (01_load.js)

### Response Time — Public Pages

| Page | p50 (ms) | p95 (ms) | p99 (ms) | Max (ms) | Target p95 | Status |
|---|---|---|---|---|---|---|
| Homepage `/` | | | | | < 2,500ms | ☐ ✅ ☐ ❌ |
| Works `/works` | | | | | < 2,500ms | ☐ ✅ ☐ ❌ |
| Pricing `/pricing` | | | | | < 2,500ms | ☐ ✅ ☐ ❌ |
| About `/about` | | | | | < 2,500ms | ☐ ✅ ☐ ❌ |
| Booking `/booking` | | | | | < 2,500ms | ☐ ✅ ☐ ❌ |
| Contact `/contact` | | | | | < 2,500ms | ☐ ✅ ☐ ❌ |

### Response Time — API Endpoints

| Endpoint | p50 (ms) | p95 (ms) | p99 (ms) | Max (ms) | Target p95 | Status |
|---|---|---|---|---|---|---|
| POST /api/booking | | | | | < 5,000ms | ☐ ✅ ☐ ❌ |
| GET /api/booking/slots | | | | | < 800ms | ☐ ✅ ☐ ❌ |
| POST /api/contact | | | | | < 2,000ms | ☐ ✅ ☐ ❌ |
| GET /admin (middleware) | | | | | < 600ms | ☐ ✅ ☐ ❌ |

### Error Rates — Load Test

| Metric | Measured | Target | Status |
|---|---|---|---|
| Global HTTP error rate | | < 1% | ☐ ✅ ☐ ❌ |
| Booking error rate | | < 3% | ☐ ✅ ☐ ❌ |
| Contact error rate | | < 2% | ☐ ✅ ☐ ❌ |
| Rate limit hits (429) | | N/A (informational) | — |
| Total booking attempts | | N/A (informational) | — |

### Throughput — Load Test

| Metric | Value |
|---|---|
| Peak RPS (requests/second) | |
| Average RPS during steady state | |
| Total requests served | |
| Data received (MB) | |

---

## 3. Stress Test Results (02_stress.js)

### Breaking Point Analysis

| VU Count | Error Rate | p95 (ms) | p99 (ms) | DB Connections | Status |
|---|---|---|---|---|---|
| 50 VUs | | | | | ☐ OK ☐ WARN ☐ FAIL |
| 100 VUs | | | | | ☐ OK ☐ WARN ☐ FAIL |
| 150 VUs | | | | | ☐ OK ☐ WARN ☐ FAIL |
| 200 VUs | | | | | ☐ OK ☐ WARN ☐ FAIL |
| 300 VUs | | | | | ☐ OK ☐ WARN ☐ FAIL |
| 500 VUs | | | | | ☐ OK ☐ WARN ☐ FAIL |

**Breaking Point (VU count where error rate exceeded 10%):** ___________  
**Primary failure mode:** ☐ DB connection exhaustion  ☐ Vercel timeout  ☐ Upstash rate limit  ☐ Other: _____  
**Test auto-aborted at:** ___________ VUs  

### Error Classification

| Error Type | Count | % of Total |
|---|---|---|
| HTTP 500 (Server Error) | | |
| HTTP 502/503 (Gateway/Unavailable) | | |
| HTTP 504 (Gateway Timeout) | | |
| HTTP 429 (Rate Limited) | | |
| Connection timeout | | |
| DB unique constraint (23505) | | |
| DB connection pool exhausted (53300) | | |

---

## 4. Spike Test Results (03_spike.js)

| Metric | Value | Target | Status |
|---|---|---|---|
| Peak error rate during spike | | < 15% | ☐ ✅ ☐ ❌ |
| p95 during spike hold | | < 10,000ms | ☐ ✅ ☐ ❌ |
| Time to recover after spike drop | | < 60s | ☐ ✅ ☐ ❌ |
| DB connection pool error during spike | | 0 | ☐ ✅ ☐ ❌ |

**Recovery observation:** _______________________________________________  
**Vercel auto-scaling behavior:** _______________________________________  

---

## 5. Soak Test Results (04_soak.js) — 3 Hour Run

### Connection Pool Monitoring (check Supabase dashboard every 30 min)

| Time | DB Connections | Error Rate | p95 Response | Notes |
|---|---|---|---|---|
| T+00:30 | | | | |
| T+01:00 | | | | |
| T+01:30 | | | | |
| T+02:00 | | | | |
| T+02:30 | | | | |
| T+03:00 (end) | | | | |

**Connection drift detected:** ☐ Yes (connections increased over time) ☐ No (stable)  
**Error rate drift detected:** ☐ Yes (error rate crept up) ☐ No (stable)  
**p95 drift detected:** ☐ Yes (latency increased over time) ☐ No (stable)  
**Memory leak indicators:** _______________________________________________  

---

## 6. Security Validation Results (05_rate_limit.js)

| Check | Expected | Actual | Status |
|---|---|---|---|
| Request 1–5: not rate limited | HTTP ≠ 429 | | ☐ ✅ ☐ ❌ |
| Request 6+: rate limited | HTTP 429 | | ☐ ✅ ☐ ❌ |
| Retry-After header present on 429 | Present | | ☐ ✅ ☐ ❌ |
| No CSRF token: rejected | HTTP 403 | | ☐ ✅ ☐ ❌ |
| Tampered CSRF token: rejected | HTTP 403 | | ☐ ✅ ☐ ❌ |
| Empty payload: rejected | HTTP 400 | | ☐ ✅ ☐ ❌ |
| Invalid email: rejected | HTTP 400 | | ☐ ✅ ☐ ❌ |

---

## 7. Concurrent Slot Race Condition (06_concurrent_slots.js)

**Test date used:** _______________  
**VUs fired:** 20  

| Metric | Count | Expected | Status |
|---|---|---|---|
| Successful bookings (HTTP 200) | | 1 | ☐ ✅ ☐ ❌ |
| Conflict errors (HTTP 409) | | ~19 | ☐ ✅ ☐ ❌ |
| Server errors (HTTP 500) | | 0 | ☐ ✅ ☐ ❌ |
| Rate limited (HTTP 429) | | 0–5 (ok) | — |

**Bug status:** ☐ Fixed (500s = 0, 409s = ~19) ☐ Present (500s > 0)  
**Notes:** _______________________________________________  

---

## 8. Database Direct Load Results (07_db_load.js)

| Query | p50 (ms) | p95 (ms) | p99 (ms) | Target p95 | Status |
|---|---|---|---|---|---|
| works SELECT | | | | < 300ms | ☐ ✅ ☐ ❌ |
| works featured filter | | | | < 300ms | ☐ ✅ ☐ ❌ |
| pricing SELECT | | | | < 150ms | ☐ ✅ ☐ ❌ |
| booking slots (RLS active) | | | | < 400ms | ☐ ✅ ☐ ❌ |
| team SELECT | | | | < 250ms | ☐ ✅ ☐ ❌ |
| careers open filter | | | | < 250ms | ☐ ✅ ☐ ❌ |
| contact_messages INSERT | | | | < 500ms | ☐ ✅ ☐ ❌ |
| bookings INSERT | | | | < 800ms | ☐ ✅ ☐ ❌ |

**DB Read p95 overhead vs full stack p95 (Vercel cold start impact):**  
`Full stack p95 - DB direct p95 = _______ ms` (this is your serverless overhead)

---

## 9. Capacity Estimation

Based on test results, fill in measured values:

### Conservative Estimate (Guaranteed Safe)
| Metric | Value |
|---|---|
| Safe concurrent users | |
| Safe RPS | |
| DB connections at safe load | |
| p95 at safe load | |

### Optimistic Estimate (With All Optimizations Applied)
| Metric | Value |
|---|---|
| Concurrent users (with pooler + JWT hook) | |
| RPS | |
| DB connections (pooler multiplexed) | |
| p95 | |

### Breaking Point (Measured from Stress Test)
| Metric | Value |
|---|---|
| VU count at breaking point | |
| Error rate at breaking point | |
| Primary bottleneck component | |
| Max RPS before degradation | |

---

## 10. Core Web Vitals (Run Lighthouse separately)

| Metric | Measured | Target | Status |
|---|---|---|---|
| LCP (Largest Contentful Paint) | | < 2.5s | ☐ ✅ ☐ ❌ |
| INP (Interaction to Next Paint) | | < 200ms | ☐ ✅ ☐ ❌ |
| CLS (Cumulative Layout Shift) | | < 0.1 | ☐ ✅ ☐ ❌ |
| TTFB (Time to First Byte) | | < 800ms | ☐ ✅ ☐ ❌ |
| Performance Score (Lighthouse) | | > 85 | ☐ ✅ ☐ ❌ |

---

## 11. Bottleneck Analysis

### Ranking (fill after tests)
| # | Component | Bottleneck Description | Severity | Fix Applied |
|---|---|---|---|---|
| 1 | | | 🔴 / 🟡 / 🟢 | ☐ Yes ☐ No |
| 2 | | | 🔴 / 🟡 / 🟢 | ☐ Yes ☐ No |
| 3 | | | 🔴 / 🟡 / 🟢 | ☐ Yes ☐ No |
| 4 | | | 🔴 / 🟡 / 🟢 | ☐ Yes ☐ No |

---

## 12. Go/No-Go Decision

| Gate | Criteria | Result | Decision |
|---|---|---|---|
| Smoke test | All checks pass | | ☐ GO ☐ NO-GO |
| Load test error rate | < 1% | | ☐ GO ☐ NO-GO |
| Booking API p95 | < 5,000ms | | ☐ GO ☐ NO-GO |
| Rate limit working | 429 on req 6+ | | ☐ GO ☐ NO-GO |
| CSRF protection | 403 without token | | ☐ GO ☐ NO-GO |
| Slot race condition | 0 HTTP 500s | | ☐ GO ☐ NO-GO |
| DB connections stable | < 80% of plan limit | | ☐ GO ☐ NO-GO |

**Overall Decision:** ☐ **GO — Deploy to production** ☐ **NO-GO — Fix issues first**

**Blocking issues (if NO-GO):**
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

## 13. Action Items

| Priority | Issue | Fix | Owner | Due |
|---|---|---|---|---|
| 🔴 | | | | |
| 🔴 | | | | |
| 🟡 | | | | |
| 🟡 | | | | |
| 🟢 | | | | |

---

*Report generated for BT ADV — Next.js + Supabase Performance Test*  
*Template version: 1.0*
