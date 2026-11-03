import { describe, expect, it } from "vitest";

import { scanProps } from "../src/scanProps.js";

describe("scanProps()", () => {
  it("should scan keys, bare values and quoted values", () => {
    const src = "a=1 b c='x y'";

    expect(scanProps(src, 0, src.length)).toStrictEqual({
      props: { a: "1", b: true, c: "x y" },
      end: src.length,
      lastHidden: 10,
      sawClose: false,
    });
  });

  it("should report a `]` read as content", () => {
    const src = "a=']' b";

    expect(scanProps(src, 0, src.length)).toStrictEqual({
      props: { a: "]", b: true },
      end: src.length,
      lastHidden: 3,
      sawClose: true,
    });
  });

  it("should report escaped whitespaces and `]`", () => {
    const src = String.raw`a=b\]c d=e\ f`;

    expect(scanProps(src, 0, src.length)).toStrictEqual({
      props: { a: "b]c", d: "e f" },
      end: src.length,
      lastHidden: 11,
      sawClose: true,
    });
  });

  it("should report an empty value at the end of the range", () => {
    expect(scanProps("a=", 0, 2)).toStrictEqual({
      props: { a: "" },
      end: 2,
      lastHidden: -1,
      sawClose: false,
    });
  });

  it("should reject an empty key", () => {
    expect(scanProps("a=1 =b", 0, 6)).toStrictEqual({
      props: null,
      end: 4,
      lastHidden: -1,
      sawClose: false,
    });
  });

  it("should reject a dangling escape", () => {
    expect(scanProps("a=b\\", 0, 4)).toStrictEqual({
      props: null,
      end: 3,
      lastHidden: -1,
      sawClose: false,
    });
  });

  it("should reject an unterminated quoted value", () => {
    // the scan consumes the whole range, the `end` stays at `max`
    expect(scanProps('a="x y', 0, 6)).toStrictEqual({
      props: null,
      end: 6,
      lastHidden: 4,
      sawClose: false,
    });
  });

  it("should reject a line break", () => {
    // props never span a line break, the `end` reports where the scan stopped
    expect(scanProps("a=1\nb=2", 0, 7)).toStrictEqual({
      props: null,
      end: 3,
      lastHidden: -1,
      sawClose: false,
    });
    expect(scanProps("a\\\nb", 0, 4)).toStrictEqual({
      props: null,
      end: 1,
      lastHidden: -1,
      sawClose: false,
    });
  });
});
