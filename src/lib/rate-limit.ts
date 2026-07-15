type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
};

const buckets = new Map<string, number[]>();

/**
 * Minimal in-memory limiter (per serverless instance). Good enough to stop
 * casual abuse of the public demo endpoints without external infrastructure.
 */
export function isRateLimited(key: string, { windowMs, maxRequests }: RateLimitOptions): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs);

  if (recent.length >= maxRequests) {
    buckets.set(key, recent);
    return true;
  }

  recent.push(now);
  buckets.set(key, recent);
  return false;
}

export function clientIpFrom(request: Request): string {
  return (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
}
