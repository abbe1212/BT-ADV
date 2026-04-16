/**
 * Client-side CSRF cookie reader
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads the `csrf-token` cookie set by the middleware and returns it.
 * Must only be called from client components ('use client').
 *
 * Usage:
 * ```ts
 * const csrfToken = getCsrfToken();
 * fetch('/api/booking', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'X-CSRF-Token': csrfToken,
 *   },
 *   body: JSON.stringify(payload),
 * });
 * ```
 */
export function getCsrfToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrf-token='));
  return match ? match.split('=')[1] : '';
}
