import { describe, expect, it } from "vitest";

import { loadTexPackages, resolveTexPackages, texPackages } from "../src/tex/index.js";

describe(resolveTexPackages, () => {
  it("uses the default packages with base", () => {
    expect(resolveTexPackages()).toStrictEqual(["base", ...texPackages]);
  });

  it("keeps HTML-related TeX packages out of the defaults", () => {
    expect(texPackages).not.toContain("html");
    expect(texPackages).not.toContain("texhtml");
  });

  it("adds base before explicit packages", () => {
    expect(resolveTexPackages(["ams"])).toStrictEqual(["base", "ams"]);
  });

  it("honors explicitly configured HTML-related TeX packages", () => {
    expect(resolveTexPackages(["ams", "html", "texhtml"])).toStrictEqual([
      "base",
      "ams",
      "html",
      "texhtml",
    ]);
  });

  it("uses an explicit package list as-is when html is enabled", () => {
    expect(resolveTexPackages(["ams"], true)).toStrictEqual(["base", "ams"]);
  });

  it("adds HTML-related TeX packages to the default list when html is enabled", () => {
    expect(resolveTexPackages(undefined, true)).toStrictEqual([
      "base",
      ...texPackages,
      "html",
      "texhtml",
    ]);
  });

  it("deduplicates packages", () => {
    expect(resolveTexPackages(["ams", "ams", "html"])).toStrictEqual(["base", "ams", "html"]);
  });
});

describe(loadTexPackages, () => {
  it("loads the default packages when called without arguments", async () => {
    await expect(loadTexPackages()).resolves.toBeUndefined();
  });
});
