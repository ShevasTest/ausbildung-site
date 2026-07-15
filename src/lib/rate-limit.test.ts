import { describe, expect, it } from "vitest";
import { createMemoryRateLimiter } from "./rate-limit";

describe("memory rate limiter", () => {
  it("blocks after the configured request count", () => {
    const limiter = createMemoryRateLimiter();
    const options = { windowMs: 1_000, maxRequests: 2 };

    expect(limiter.check("visitor", options, 0)).toBe(false);
    expect(limiter.check("visitor", options, 100)).toBe(false);
    expect(limiter.check("visitor", options, 200)).toBe(true);
  });

  it("allows requests again after the window expires", () => {
    const limiter = createMemoryRateLimiter();
    const options = { windowMs: 1_000, maxRequests: 1 };

    expect(limiter.check("visitor", options, 0)).toBe(false);
    expect(limiter.check("visitor", options, 500)).toBe(true);
    expect(limiter.check("visitor", options, 1_001)).toBe(false);
  });
});
