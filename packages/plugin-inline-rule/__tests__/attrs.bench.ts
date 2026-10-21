import { describe, expect, test } from "vitest";

const STATIC_ATTRS: [string, string][] = [
  ["class", "custom"],
  ["tabindex", "-1"],
];

// Mirrors the internal handling of a static attrs template: the outer array and every inner tuple
// are copied so tokens never share attribute arrays.
const cloneAttrs = (attrs: [string, string][]): [string, string][] =>
  attrs.map(([key, value]): [string, string] => [key, value]);

// Mirrors a factory function: a fresh literal array is created for every token.
const createAttrs = (): [string, string][] => [
  ["class", "custom"],
  ["tabindex", "-1"],
];

const bench = (name: string, fn: () => void): void => {
  test(name, async ({ bench: benchmark }) => {
    await expect(benchmark(name, fn).run()).resolves.toBeDefined();
  });
};

describe("attrs cost per token", () => {
  bench("static array (cloned per token)", () => {
    cloneAttrs(STATIC_ATTRS);
  });

  bench("factory function (fresh literal per token)", () => {
    createAttrs();
  });
});
