import { describe, expect, it } from "vitest";

import { removeDelimiter } from "../../src/helper/removeDelimiter.js";

describe("removeDelimiter", () => {
  it("should remove delimiters from end of string", () => {
    expect(removeDelimiter("text {.class}", "{", "}")).toBe("text");
    expect(removeDelimiter("text{.class}", "{", "}")).toBe("text");
    expect(removeDelimiter("text {#id}", "{", "}")).toBe("text");
  });

  it("should remove delimiters with space before", () => {
    expect(removeDelimiter("text {.class}", "{", "}")).toBe("text");
    expect(removeDelimiter("text\n{.class}", "{", "}")).toBe("text");
  });

  it("should return original string if no delimiter found", () => {
    expect(removeDelimiter("text", "{", "}")).toBe("text");
    expect(removeDelimiter("text {incomplete", "{", "}")).toBe(
      "text {incomplete",
    );
    expect(removeDelimiter("incomplete} text", "{", "}")).toBe(
      "incomplete} text",
    );
  });

  it("should work with custom delimiters", () => {
    expect(removeDelimiter("text [.class]", "[", "]")).toBe("text");
    expect(removeDelimiter("text [[.class]]", "[[", "]]")).toBe("text");
  });

  it("should handle empty strings", () => {
    expect(removeDelimiter("", "{", "}")).toBe("");
    expect(removeDelimiter("{.class}", "{", "}")).toBe("");
  });

  it("should handle multiple delimiters correctly", () => {
    expect(removeDelimiter("text {.first} middle {.second}", "{", "}")).toBe(
      "text {.first} middle",
    );
  });

  it("should handle special regex characters in delimiters", () => {
    expect(removeDelimiter("text $.class$", "$", "$")).toBe("text");
    expect(removeDelimiter("text (.class)", "(", ")")).toBe("text");
  });

  it("should preserve content when delimiters are not at the end", () => {
    expect(removeDelimiter("text {.class} more", "{", "}")).toBe(
      "text {.class} more",
    );
  });
});
