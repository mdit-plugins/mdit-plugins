import { describe, expect, it } from "vitest";

import { parseAttributes } from "../src/directive.js";

describe(parseAttributes, () => {
  it("should stop parsing on unexpected character", () => {
    const result = parseAttributes("!unexpected", 0, 11);

    expect(result).toEqual({ classes: [], id: "", utilities: [] });
  });
});
