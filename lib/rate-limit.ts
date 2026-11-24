/**
 * Fixed-window rate limiter kept in memory.
 *
 * shortcut: counts are per server instance, so a client spread across
 * instances gets more than `limit`; move to a Vercel firewall rule or a
 * shared store (e.g. Upstash) if the public PDF endpoint is actually abused.
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function allow(key: string, now = Date.now()): boolean {
    const entry = hits.get(key);
    if (!entry || now >= entry.resetAt) {
      // Drop expired entries so the map can't grow without bound.
      if (hits.size > 10_000) {
        for (const [k, v] of hits) if (now >= v.resetAt) hits.delete(k);
      }
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    entry.count += 1;
    return entry.count <= limit;
  };
}

/** Client IP as Vercel reports it; falls back to one shared bucket. */
export function clientIp(request: Request): string {
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
