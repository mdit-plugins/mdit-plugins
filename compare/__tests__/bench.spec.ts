import { describe, expect, it } from "vitest";

import { fitExponent, measurePair, median } from "../bench.ts";

describe("median calculation", () => {
  it("returns the middle value of an odd list", () => {
    expect(median([3, 1, 2])).toBe(2);
  });

  it("returns the average of the two middle values of an even list", () => {
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });
});

describe("growth exponent fitting", () => {
  it("returns 1 for linear growth", () => {
    const points = [1, 2, 4, 8].map((size) => ({ size, ms: size }));

    expect(fitExponent(points)).toBeCloseTo(1, 5);
  });

  it("returns 2 for quadratic growth", () => {
    const points = [1, 2, 4, 8].map((size) => ({ size, ms: size * size }));

    expect(fitExponent(points)).toBeCloseTo(2, 5);
  });

  it("returns NaN when fewer than two points are given", () => {
    expect(fitExponent([{ size: 1, ms: 1 }])).toBeNaN();
  });

  it("returns NaN when all sizes are identical", () => {
    expect(
      fitExponent([
        { size: 1, ms: 1 },
        { size: 1, ms: 2 },
      ]),
    ).toBeNaN();
  });
});

describe("paired measurement", () => {
  it("measures a synchronous function", async () => {
    const result = await measurePair(
      () => "a".repeat(100),
      () => "a".repeat(100),
      { targetMs: 20, samples: 2, warmup: 1 },
    );

    expect(result.current.opsPerSec).toBeGreaterThan(0);
    expect(result.reference.opsPerSec).toBeGreaterThan(0);
    expect(result.current.samples).toHaveLength(2);
    expect(result.reference.samples).toHaveLength(2);
  });

  it("measures an asynchronous function", async () => {
    const result = await measurePair(
      () => Promise.resolve("a".repeat(100)),
      () => Promise.resolve("a".repeat(100)),
      { targetMs: 20, samples: 2, warmup: 1 },
    );

    expect(result.current.opsPerSec).toBeGreaterThan(0);
    expect(result.reference.opsPerSec).toBeGreaterThan(0);
  });
});
