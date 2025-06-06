import Token from "markdown-it/lib/token.mjs";
import { describe, expect, it } from "vitest";

import { addAttrs } from "../../src/helper/addAttrs.js";
import type { Attr } from "../../src/helper/types.js";

describe("addAttrs", () => {
  it("should add class attribute", () => {
    const token = new Token("p", "p", 1);
    const attrs: Attr[] = [["class", "test-class"]];

    addAttrs(attrs, token);

    expect(token.attrGet("class")).toBe("test-class");
  });

  it("should merge multiple class attributes", () => {
    const token = new Token("p", "p", 1);

    token.attrSet("class", "existing-class");
    const attrs: Attr[] = [["class", "new-class"]];

    addAttrs(attrs, token);

    expect(token.attrGet("class")).toBe("existing-class new-class");
  });

  it("should add id attribute", () => {
    const token = new Token("p", "p", 1);
    const attrs: Attr[] = [["id", "test-id"]];

    addAttrs(attrs, token);

    expect(token.attrGet("id")).toBe("test-id");
  });

  it("should add custom attributes", () => {
    const token = new Token("p", "p", 1);
    const attrs: Attr[] = [["data-test", "value"]];

    addAttrs(attrs, token);

    expect(token.attrGet("data-test")).toBe("value");
  });

  it("should handle multiple attributes", () => {
    const token = new Token("p", "p", 1);
    const attrs: Attr[] = [
      ["class", "test-class"],
      ["id", "test-id"],
      ["data-attr", "test-value"],
    ];

    addAttrs(attrs, token);

    expect(token.attrGet("class")).toBe("test-class");
    expect(token.attrGet("id")).toBe("test-id");
    expect(token.attrGet("data-attr")).toBe("test-value");
  });
});
