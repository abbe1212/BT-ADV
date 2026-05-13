# BT ADV — Performance Test Suite

Complete k6 performance testing suite for **Next.js (Vercel) + Supabase** production system.

---

## Prerequisites

### 1. Install k6
```powershell
# Windows (winget)
winget install k6 --source winget

# Or via Chocolatey
choco install k6

# Verify
k6 version
```

### 2. Set Environment Variables
```powershell
# Windows PowerShell
$env:BASE_URL     = "https://btadv.agency"
$env:SUPABASE_URL  = "https://YOUR_PROJECT.supabase.co"
$env:SUPABASE_ANON = "your_anon_key_here"
```

> Get `SUPABASE_URL` and `SUPABASE_ANON` from:  
> Supabase Dashboard → Settings → API

---

## Test Scripts

| # | Script | Purpose | Duration | VUs |
|---|---|---|---|---|
| 08 | `08_smoke.js` | CI/CD gate — run after every deploy | ~2 min | 1 |
| 01 | `01_load.js` | Normal production traffic simulation | ~15 min | 50 |
| 02 | `02_stress.js` | Find system breaking point | ~40 min | 50–500 |
| 03 | `03_spike.js` | Viral traffic burst simulation | ~12 min | 0→300 |
| 04 | `04_soak.js` | Memory leak / connection drain detection | 3 hours | 25 |
| 05 | `05_rate_limit.js` | Validate Upstash rate limiting + CSRF | ~5 min | 1 |
| 06 | `06_concurrent_slots.js` | Booking race condition test | ~2 min | 20 |
| 07 | `07_db_load.js` | Direct Supabase DB load (bypass Vercel) | ~15 min | 100 |

---

## Quick Start — Run Order

### Step 1: Smoke Test (always first)
```powershell
k6 run -e BASE_URL=https://btadv.agency `
  performance-tests/scripts/08_smoke.js
```
**Stop if this fails.** Do not run further tests.

---

### Step 2: Security Validation
```powershell
k6 run -e BASE_URL=https://btadv.agency `
  performance-tests/scripts/05_rate_limit.js
```

---

### Step 3: Race Condition Test
```powershell
k6 run -e BASE_URL=https://btadv.agency `
  -e TEST_DATE=2026-12-15 `
  performance-tests/scripts/06_concurrent_slots.js
```
> Use a future date with no real bookings. Results show the slot conflict bug status.

---

### Step 4: Load Test (Baseline)
```powershell
k6 run -e BASE_URL=https://btadv.agency `
  --out json=performance-tests/reports/load_results.json `
  performance-tests/scripts/01_load.js
```

---

### Step 5: Database Direct Load Test
```powershell
k6 run `
  -e SUPABASE_URL=https://YOUR_PROJECT.supabase.co `
  -e SUPABASE_ANON=your_anon_key `
  --out json=performance-tests/reports/db_results.json `
  performance-tests/scripts/07_db_load.js
```

---

### Step 6: Stress Test (find breaking point)
```powershell
k6 run -e BASE_URL=https://btadv.agency `
  --out json=performance-tests/reports/stress_results.json `
  performance-tests/scripts/02_stress.js
```
> ⚠️ This will cause real load on production. Run during off-hours (e.g., 2–4 AM Cairo time).

---

### Step 7: Spike Test
```powershell
k6 run -e BASE_URL=https://btadv.agency `
  --out json=performance-tests/reports/spike_results.json `
  performance-tests/scripts/03_spike.js
```

---

### Step 8: Soak Test (3-hour run)
```powershell
k6 run -e BASE_URL=https://btadv.agency `
  --out json=performance-tests/reports/soak_results.json `
  performance-tests/scripts/04_soak.js

# Shorter 30-minute validation run:
k6 run -e BASE_URL=https://btadv.agency -e DURATION=30m `
  performance-tests/scripts/04_soak.js
```

---

## Real-Time Dashboard

View live metrics while any test runs:
```powershell
k6 run --out web-dashboard `
  -e BASE_URL=https://btadv.agency `
  performance-tests/scripts/01_load.js
# Then open: http://localhost:5665
```

---

## CI/CD Integration (GitHub Actions)

Add to `.github/workflows/performance.yml`:

```yaml
name: Performance Smoke Test

on:
  deployment_status:

jobs:
  smoke-test:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install k6
        run: |
          curl https://github.com/grafana/k6/releases/download/v0.52.0/k6-v0.52.0-linux-amd64.tar.gz -L | tar xvz --strip-components 1
          sudo mv k6 /usr/local/bin/

      - name: Run Smoke Test
        env:
          BASE_URL: ${{ secrets.PRODUCTION_URL }}
        run: |
          k6 run -e BASE_URL=$BASE_URL performance-tests/scripts/08_smoke.js
```

---

## Analyzing Results

### Read JSON output summary:
```powershell
# Show all failed thresholds:
Get-Content performance-tests/reports/load_results.json |
  ConvertFrom-Json |
  Where-Object { $_.type -eq "Point" -and $_.metric -match "error" }
```

### Key metrics to extract from k6 output:
```
http_req_duration............: avg=Xms   min=Xms   med=Xms   max=Xms   p(90)=Xms   p(95)=Xms
http_req_failed..............: X%        X out of X
booking_duration_ms..........: avg=Xms                                  p(95)=Xms   p(99)=Xms
slot_query_ms................: avg=Xms                                  p(95)=Xms
middleware_ms................: avg=Xms                                  p(95)=Xms
```

---

## Expected Pass/Fail Summary

| Test | Key Threshold | Pass Condition |
|---|---|---|
| Smoke | `checks rate` | = 100% |
| Load | `http_req_failed` | < 1% |
| Load | `booking_duration_ms p95` | < 5,000ms |
| Load | `slot_query_ms p95` | < 800ms |
| Stress | Auto-abort trigger | Error rate < 10% |
| Spike | Recovery time | < 60 seconds |
| Soak | Connection drift | DB connections stable over 3h |
| Rate Limit | `rate_limit_missed` | = 0 |
| CSRF | Rejection checks | All 403s returned |
| Slot Race | `slot_race_error_500` | = 0 |
| DB Direct | `db_read_ms p95` | < 300ms |

---

## Troubleshooting

### CSRF token not found
The middleware generates the cookie on first GET to non-API routes.  
Ensure `getCsrfToken()` hits a real page, not an API route.

### `SUPABASE_URL` error in 07_db_load.js
```powershell
# You must pass both env vars:
k6 run -e SUPABASE_URL=https://xxx.supabase.co -e SUPABASE_ANON=eyJxxx... scripts/07_db_load.js
```

### k6 import errors (config.js / helpers.js)
Run scripts from the **project root** (`bt-agency/`), not from inside `performance-tests/`:
```powershell
# Correct — from bt-agency/ directory:
cd h:\Demo\bt-agency
k6 run performance-tests/scripts/01_load.js

# Wrong — from inside performance-tests/:
cd performance-tests
k6 run scripts/01_load.js  # ❌ import paths break
```

### Rate limit interfering with load tests
The Upstash rate limiter (5 req/10 min per IP) will trigger during `01_load.js`.  
This is expected — the scripts treat 429 responses as non-errors.  
If you want to test without rate limiting, temporarily disable Upstash in staging.

---

## File Structure

```
performance-tests/
├── config.js                    # Shared config (URLs, routes, thresholds, weights)
├── utils/
│   └── helpers.js               # getCsrfToken, thinkTime, randomPayloads, etc.
├── scripts/
│   ├── 01_load.js               # Load test (50 VUs, 15 min)
│   ├── 02_stress.js             # Stress test (50→500 VUs, 40 min)
│   ├── 03_spike.js              # Spike test (0→300 VUs in 30s)
│   ├── 04_soak.js               # Soak test (25 VUs, 3 hours)
│   ├── 05_rate_limit.js         # Rate limit + CSRF validation
│   ├── 06_concurrent_slots.js   # Booking race condition (20 concurrent VUs)
│   ├── 07_db_load.js            # Direct Supabase REST load test
│   └── 08_smoke.js              # CI/CD smoke test (1 VU)
└── reports/
    ├── report_template.md        # Fill-in test report
    ├── load_results.json         # k6 JSON output (gitignored)
    ├── stress_results.json       # k6 JSON output (gitignored)
    ├── spike_results.json        # k6 JSON output (gitignored)
    ├── soak_results.json         # k6 JSON output (gitignored)
    └── db_results.json           # k6 JSON output (gitignored)
```
