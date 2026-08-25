/** Generic IP rate limit for public forms / cron-adjacent endpoints. */
const hits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  opts?: { windowMs?: number; max?: number },
): { ok: boolean; retryAfterSec?: number } {
  const windowMs = opts?.windowMs ?? 15 * 60 * 1000;
  const max = opts?.max ?? 8;
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (entry.count >= max) {
    return {
      ok: false,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
    };
  }
  entry.count += 1;
  return { ok: true };
}
