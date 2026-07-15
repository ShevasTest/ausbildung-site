type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
};

export function createMemoryRateLimiter() {
  const buckets = new Map<string, number[]>();

  return {
    check(
      key: string,
      { windowMs, maxRequests }: RateLimitOptions,
      now = Date.now(),
    ): boolean {
      const recent = (buckets.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs);

      if (recent.length >= maxRequests) {
        buckets.set(key, recent);
        return true;
      }

      recent.push(now);
      buckets.set(key, recent);
      return false;
    },
    clear() {
      buckets.clear();
    },
  };
}

const limiter = createMemoryRateLimiter();

/**
 * Minimal in-memory limiter (per serverless instance). Good enough to stop
 * casual abuse of the public demo endpoints without external infrastructure.
 */
export function isRateLimited(key: string, { windowMs, maxRequests }: RateLimitOptions): boolean {
  return limiter.check(key, { windowMs, maxRequests });
}

export function clientIpFrom(request: Request): string {
  return (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
}
