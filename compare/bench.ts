/* oxlint-disable no-await-in-loop -- samples are measured sequentially by design */
import { performance } from "node:perf_hooks";

import type { Measurement, ScalingPoint } from "./types.ts";

/** Options of a measurement */
export interface MeasureOptions {
  /** Target duration of one sample in milliseconds */
  readonly targetMs?: number;
  /** Number of samples */
  readonly samples?: number;
  /** Number of warmup iterations */
  readonly warmup?: number;
}

/** A calibrated benchmark function */
interface BenchPlan {
  /** Iterations per sample */
  readonly iterations: number;
  /** Whether the function returns a promise */
  readonly async: boolean;
}

const DEFAULT_TARGET_MS = 150;
const DEFAULT_SAMPLES = 5;
const DEFAULT_WARMUP = 2;
const MAX_ITERATIONS = 1_000_000;
const MIN_DURATION_MS = 0.001;

/**
 * Get the median of a list of numbers
 *
 * @param values - Numbers
 * @returns The median
 */
export const median = (values: readonly number[]): number => {
  const sorted = [...values].sort((valueA, valueB) => valueA - valueB);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2
    : (sorted[middle] ?? 0);
};

/**
 * Run a synchronous function several times
 *
 * @param fn - Function to run
 * @param iterations - Number of iterations
 * @returns Elapsed milliseconds
 */
const runSync = (fn: () => unknown, iterations: number): number => {
  const start = performance.now();

  for (let index = 0; index < iterations; index++) fn();

  return performance.now() - start;
};

/**
 * Run an asynchronous function several times
 *
 * @param fn - Function to run
 * @param iterations - Number of iterations
 * @returns Elapsed milliseconds
 */
const runAsync = async (fn: () => Promise<unknown>, iterations: number): Promise<number> => {
  const start = performance.now();

  for (let index = 0; index < iterations; index++) await fn();

  return performance.now() - start;
};

/**
 * Warm up a function and calibrate the number of iterations per sample
 *
 * @param fn - Function to benchmark
 * @param targetMs - Target duration of one sample
 * @param warmup - Number of warmup iterations
 * @returns The calibrated benchmark plan
 */
const prepare = async (fn: () => unknown, targetMs: number, warmup: number): Promise<BenchPlan> => {
  for (let index = 0; index < warmup; index++) await fn();

  const probe = fn();
  const isAsync = probe instanceof Promise;

  if (isAsync) await probe;

  let iterations = 1;
  let elapsed = isAsync ? await runAsync(fn as () => Promise<unknown>, 1) : runSync(fn, 1);

  while (elapsed < targetMs / 20 && iterations < MAX_ITERATIONS) {
    iterations *= 2;
    elapsed = isAsync
      ? await runAsync(fn as () => Promise<unknown>, iterations)
      : runSync(fn, iterations);
  }

  const perIteration = Math.max(elapsed / iterations, MIN_DURATION_MS / 1000);

  return {
    iterations: Math.max(1, Math.min(MAX_ITERATIONS, Math.round(targetMs / perIteration))),
    async: isAsync,
  };
};

/**
 * Measure one sample
 *
 * @param fn - Function to benchmark
 * @param plan - Calibrated benchmark plan
 * @returns Milliseconds per operation
 */
const sample = async (fn: () => unknown, plan: BenchPlan): Promise<number> => {
  const elapsed = plan.async
    ? await runAsync(fn as () => Promise<unknown>, plan.iterations)
    : runSync(fn, plan.iterations);

  return elapsed / plan.iterations;
};

/**
 * Build a measurement from raw samples
 *
 * @param samples - Milliseconds per operation of every sample
 * @returns The measurement
 */
const toMeasurement = (samples: readonly number[]): Measurement => {
  const meanMs = median(samples);

  return {
    opsPerSec: 1000 / Math.max(meanMs, MIN_DURATION_MS),
    meanMs,
    samples,
  };
};

/**
 * Measure the current and the reference implementation in the same process
 *
 * Samples are interleaved so that CPU frequency changes and background load affect both sides
 * equally.
 *
 * @param currentFn - Current implementation
 * @param referenceFn - Reference implementation
 * @param options - Measurement options
 * @returns Both measurements
 */
export const measurePair = async (
  currentFn: () => unknown,
  referenceFn: () => unknown,
  options: MeasureOptions = {},
): Promise<{ current: Measurement; reference: Measurement }> => {
  const {
    targetMs = DEFAULT_TARGET_MS,
    samples = DEFAULT_SAMPLES,
    warmup = DEFAULT_WARMUP,
  } = options;

  const currentPlan = await prepare(currentFn, targetMs, warmup);
  const referencePlan = await prepare(referenceFn, targetMs, warmup);
  const currentSamples: number[] = [];
  const referenceSamples: number[] = [];

  for (let index = 0; index < samples; index++) {
    if (index % 2 === 0) {
      currentSamples.push(await sample(currentFn, currentPlan));
      referenceSamples.push(await sample(referenceFn, referencePlan));
    } else {
      referenceSamples.push(await sample(referenceFn, referencePlan));
      currentSamples.push(await sample(currentFn, currentPlan));
    }
  }

  return {
    current: toMeasurement(currentSamples),
    reference: toMeasurement(referenceSamples),
  };
};

/**
 * Fit the growth exponent of a scaling series with a least squares fit on log-log axes
 *
 * An exponent close to 1 means linear growth, an exponent close to 2 means quadratic growth.
 *
 * @param points - Scaling points
 * @returns The fitted exponent, or `Number.NaN` when fewer than two points are given
 */
export const fitExponent = (points: readonly ScalingPoint[]): number => {
  if (points.length < 2) return Number.NaN;

  const xs = points.map((point) => Math.log2(point.size));
  const ys = points.map((point) => Math.log2(Math.max(point.ms, MIN_DURATION_MS)));
  const meanX = xs.reduce((sum, value) => sum + value, 0) / xs.length;
  const meanY = ys.reduce((sum, value) => sum + value, 0) / ys.length;
  let numerator = 0;
  let denominator = 0;

  for (let index = 0; index < xs.length; index++) {
    const deltaX = (xs[index] ?? 0) - meanX;

    numerator += deltaX * ((ys[index] ?? 0) - meanY);
    denominator += deltaX * deltaX;
  }

  return denominator === 0 ? Number.NaN : numerator / denominator;
};

/**
 * Measure a scaling series
 *
 * @param currentFn - Function receiving the input size
 * @param referenceFn - Function receiving the input size
 * @param sizes - Measured sizes
 * @param options - Measurement options
 * @returns Scaling points of both sides
 */
export const measureScaling = async (
  currentFn: (size: number) => unknown,
  referenceFn: (size: number) => unknown,
  sizes: readonly number[],
  options: MeasureOptions = {},
): Promise<{
  current: ScalingPoint[];
  reference: ScalingPoint[];
}> => {
  const current: ScalingPoint[] = [];
  const reference: ScalingPoint[] = [];

  for (const size of sizes) {
    const result = await measurePair(
      () => currentFn(size),
      () => referenceFn(size),
      { targetMs: 80, samples: 3, warmup: 1, ...options },
    );

    current.push({ size, ms: result.current.meanMs });
    reference.push({ size, ms: result.reference.meanMs });
  }

  return { current, reference };
};
