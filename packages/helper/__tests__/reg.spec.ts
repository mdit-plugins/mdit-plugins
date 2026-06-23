import { describe, expect, it } from "vitest";

import { NEWLINE_RE, UNESCAPE_RE } from "../src/index.js";

describe("replace new line", () => {
  it("should match different newline characters", () => {
    const text = "line1\nline2\rline3\r\nline4";
    const matches = text.match(NEWLINE_RE);

    expect(matches).toStrictEqual(["\n", "\r", "\r\n"]);
  });
});

describe("unescape special characters", () => {
  it("should unescape special characters", () => {
    const text =
      "\\!\\@\\#\\$\\%\\^\\&\\*\\(\\)\\_\\+\\-\\=\\{\\}\\[\\]\\|\\;\\:\\'\\\"\\,\\.\\/\\<\\>\\?\\`\\~";
    const unescaped = text.replace(UNESCAPE_RE, "$<char>");

    expect(unescaped).toBe("!@#$%^&*()_+-={}[]|;:'\",./<>?`~");
  });
});
