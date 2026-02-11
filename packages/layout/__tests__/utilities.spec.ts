import { describe, expect, it } from "vitest";

import { buildStyleString, parseNumber, resolveUtility } from "../src/utilities.js";

describe(resolveUtility, () => {
  describe("static utilities", () => {
    it("should resolve flex direction utilities", () => {
      expect(resolveUtility("flex-row")).toBe("flex-direction:row");
      expect(resolveUtility("flex-col")).toBe("flex-direction:column");
      expect(resolveUtility("flex-row-reverse")).toBe("flex-direction:row-reverse");
      expect(resolveUtility("flex-col-reverse")).toBe("flex-direction:column-reverse");
    });

    it("should resolve flex wrap utilities", () => {
      expect(resolveUtility("flex-wrap")).toBe("flex-wrap:wrap");
      expect(resolveUtility("flex-nowrap")).toBe("flex-wrap:nowrap");
      expect(resolveUtility("flex-wrap-reverse")).toBe("flex-wrap:wrap-reverse");
    });

    it("should resolve flex shorthand utilities", () => {
      expect(resolveUtility("flex-1")).toBe("flex:1 1 0%");
      expect(resolveUtility("flex-auto")).toBe("flex:1 1 auto");
      expect(resolveUtility("flex-initial")).toBe("flex:0 1 auto");
      expect(resolveUtility("flex-none")).toBe("flex:none");
    });

    it("should resolve grow and shrink utilities", () => {
      expect(resolveUtility("grow")).toBe("flex-grow:1");
      expect(resolveUtility("grow-0")).toBe("flex-grow:0");
      expect(resolveUtility("shrink")).toBe("flex-shrink:1");
      expect(resolveUtility("shrink-0")).toBe("flex-shrink:0");
    });

    it("should resolve order special values", () => {
      expect(resolveUtility("order-first")).toBe("order:-9999");
      expect(resolveUtility("order-last")).toBe("order:9999");
      expect(resolveUtility("order-none")).toBe("order:0");
    });

    it("should resolve justify utilities", () => {
      expect(resolveUtility("justify-center")).toBe("justify-content:center");
      expect(resolveUtility("justify-between")).toBe("justify-content:space-between");
      expect(resolveUtility("justify-items-center")).toBe("justify-items:center");
      expect(resolveUtility("justify-self-end")).toBe("justify-self:end");
    });

    it("should resolve align utilities", () => {
      expect(resolveUtility("items-center")).toBe("align-items:center");
      expect(resolveUtility("content-center")).toBe("align-content:center");
      expect(resolveUtility("self-center")).toBe("align-self:center");
    });

    it("should resolve place utilities", () => {
      expect(resolveUtility("place-content-center")).toBe("place-content:center");
      expect(resolveUtility("place-items-start")).toBe("place-items:start");
      expect(resolveUtility("place-self-end")).toBe("place-self:end");
    });

    it("should resolve aspect ratio utilities", () => {
      expect(resolveUtility("aspect-auto")).toBe("aspect-ratio:auto");
      expect(resolveUtility("aspect-square")).toBe("aspect-ratio:1 / 1");
      expect(resolveUtility("aspect-video")).toBe("aspect-ratio:16 / 9");
    });

    it("should resolve grid auto flow utilities", () => {
      expect(resolveUtility("grid-flow-row")).toBe("grid-auto-flow:row");
      expect(resolveUtility("grid-flow-col")).toBe("grid-auto-flow:column");
      expect(resolveUtility("grid-flow-dense")).toBe("grid-auto-flow:dense");
      expect(resolveUtility("grid-flow-row-dense")).toBe("grid-auto-flow:row dense");
      expect(resolveUtility("grid-flow-col-dense")).toBe("grid-auto-flow:column dense");
    });

    it("should resolve grid auto columns/rows utilities", () => {
      expect(resolveUtility("auto-cols-fr")).toBe("grid-auto-columns:minmax(0,1fr)");
      expect(resolveUtility("auto-rows-min")).toBe("grid-auto-rows:min-content");
    });

    it("should resolve col/row span full", () => {
      expect(resolveUtility("col-span-full")).toBe("grid-column:1 / -1");
      expect(resolveUtility("row-span-full")).toBe("grid-row:1 / -1");
    });

    it("should resolve grid template none values", () => {
      expect(resolveUtility("grid-cols-none")).toBe("grid-template-columns:none");
      expect(resolveUtility("grid-rows-none")).toBe("grid-template-rows:none");
    });

    it("should resolve gap pixel values", () => {
      expect(resolveUtility("gap-px")).toBe("gap:1px");
      expect(resolveUtility("gap-x-px")).toBe("column-gap:1px");
      expect(resolveUtility("gap-y-px")).toBe("row-gap:1px");
    });

    it("should resolve break utilities", () => {
      expect(resolveUtility("break-inside-avoid")).toBe("break-inside:avoid");
      expect(resolveUtility("break-before-column")).toBe("break-before:column");
      expect(resolveUtility("break-after-page")).toBe("break-after:page");
    });
  });

  describe("parameterized utilities", () => {
    it("should resolve gap-{n}", () => {
      expect(resolveUtility("gap-4")).toBe("gap:1rem");
      expect(resolveUtility("gap-0")).toBe("gap:0rem");
      expect(resolveUtility("gap-8")).toBe("gap:2rem");
    });

    it("should resolve gap-x-{n} and gap-y-{n}", () => {
      expect(resolveUtility("gap-x-4")).toBe("column-gap:1rem");
      expect(resolveUtility("gap-y-2")).toBe("row-gap:0.5rem");
    });

    it("should resolve grid-cols-{n}", () => {
      expect(resolveUtility("grid-cols-3")).toBe(
        "grid-template-columns:repeat(3,minmax(0,1fr))",
      );
      expect(resolveUtility("grid-cols-12")).toBe(
        "grid-template-columns:repeat(12,minmax(0,1fr))",
      );
    });

    it("should resolve grid-rows-{n}", () => {
      expect(resolveUtility("grid-rows-2")).toBe(
        "grid-template-rows:repeat(2,minmax(0,1fr))",
      );
    });

    it("should resolve col-span-{n}", () => {
      expect(resolveUtility("col-span-2")).toBe("grid-column:span 2 / span 2");
    });

    it("should resolve col-start-{n} and col-end-{n}", () => {
      expect(resolveUtility("col-start-2")).toBe("grid-column-start:2");
      expect(resolveUtility("col-end-4")).toBe("grid-column-end:4");
    });

    it("should resolve row-span-{n}", () => {
      expect(resolveUtility("row-span-3")).toBe("grid-row:span 3 / span 3");
    });

    it("should resolve row-start-{n} and row-end-{n}", () => {
      expect(resolveUtility("row-start-1")).toBe("grid-row-start:1");
      expect(resolveUtility("row-end-3")).toBe("grid-row-end:3");
    });

    it("should resolve columns-{n}", () => {
      expect(resolveUtility("columns-3")).toBe("columns:3");
    });

    it("should resolve order-{n}", () => {
      expect(resolveUtility("order-2")).toBe("order:2");
      expect(resolveUtility("order-0")).toBe("order:0");
    });
  });

  describe("invalid/unrecognized utilities", () => {
    it("should return empty string for unrecognized utilities", () => {
      expect(resolveUtility("unknown-class")).toBe("");
      expect(resolveUtility("text-center")).toBe("");
      expect(resolveUtility("bg-red")).toBe("");
    });

    it("should return empty string for parameterized utilities with non-numeric values", () => {
      expect(resolveUtility("gap-abc")).toBe("");
      expect(resolveUtility("grid-cols-abc")).toBe("");
      expect(resolveUtility("col-span-xyz")).toBe("");
      expect(resolveUtility("order-abc")).toBe("");
    });
  });
});

describe(buildStyleString, () => {
  it("should build style from utilities with base display", () => {
    expect(buildStyleString(["gap-4", "items-center"], "display:flex")).toBe(
      "display:flex;gap:1rem;align-items:center",
    );
  });

  it("should build style from utilities without base display", () => {
    expect(buildStyleString(["gap-4", "items-center"], "")).toBe(
      "gap:1rem;align-items:center",
    );
  });

  it("should return base display only when no utilities resolve", () => {
    expect(buildStyleString([], "display:grid")).toBe("display:grid");
  });

  it("should return empty string when no base display and no utilities", () => {
    expect(buildStyleString([], "")).toBe("");
  });

  it("should skip unrecognized utilities", () => {
    expect(buildStyleString(["unknown", "gap-4"], "display:flex")).toBe(
      "display:flex;gap:1rem",
    );
  });

  it("should handle all unrecognized utilities with base display", () => {
    expect(buildStyleString(["unknown", "nope"], "display:flex")).toBe(
      "display:flex",
    );
  });

  it("should handle all unrecognized utilities without base display", () => {
    expect(buildStyleString(["unknown", "nope"], "")).toBe("");
  });
});

describe(parseNumber, () => {
  it("should parse valid numbers", () => {
    expect(parseNumber("123", 0, 3)).toBe(123);
    expect(parseNumber("0", 0, 1)).toBe(0);
    expect(parseNumber("42", 0, 2)).toBe(42);
  });

  it("should parse numbers from a substring", () => {
    expect(parseNumber("gap-4", 4, 5)).toBe(4);
    expect(parseNumber("grid-cols-12", 10, 12)).toBe(12);
  });

  it("should return -1 for empty range", () => {
    expect(parseNumber("abc", 2, 2)).toBe(-1);
    expect(parseNumber("abc", 3, 2)).toBe(-1);
  });

  it("should return -1 for non-numeric characters", () => {
    expect(parseNumber("abc", 0, 3)).toBe(-1);
    expect(parseNumber("12a", 0, 3)).toBe(-1);
  });
});
