import { describe, expect, it } from "vitest";

import { NEWLINE_RE, UNESCAPE_RE } from "../src/index.js";

describe("NEWLINE_RE", () => {
  it("should match different newline characters", () => {
    const text = "line1\nline2\rline3\r\nline4";
    const matches = text.match(NEWLINE_RE);

    expect(matches).toEqual(["\n", "\r", "\r\n"]);
  });
});

describe("UNESCAPE_RE", () => {
  it("should unescape special characters", () => {
    const text =
      "\\!\\@\\#\\$\\%\\^\\&\\*\\(\\)\\_\\+\\-\\=\\{\\}\\[\\]\\|\\;\\:\\'\\\"\\,\\.\\/\\<\\>\\?\\`\\~";
    const unescaped = text.replace(UNESCAPE_RE, "$1");

    expect(unescaped).toBe("!@#$%^&*()_+-={}[]|;:'\",./<>?`~");
  });
});
