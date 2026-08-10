import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { addAttrs } from "../../src/helper/addAttrs.js";
import { normalizeAllowed } from "../../src/helper/normalizeAllowed.js";
import type { DelimiterRange } from "../../src/rules/types.js";

const { Token } = MarkdownIt;

describe(addAttrs, () => {
  it("should add class attribute", () => {
    const token = new Token("p", "p", 1);
    const content = "{.test-class}";
    const range: DelimiterRange = [1, content.length - 1];

    addAttrs(token, content, range, null);

    expect(token.attrGet("class")).toBe("test-class");
  });

  it("should merge multiple class attributes", () => {
    const token = new Token("p", "p", 1);

    token.attrSet("class", "existing-class");

    const content = "{.new-class}";
    const range: DelimiterRange = [1, content.length - 1];

    addAttrs(token, content, range, null);

    expect(token.attrGet("class")).toBe("existing-class new-class");
  });

  it("should add id attribute", () => {
    const token = new Token("p", "p", 1);
    const content = "{#test-id}";
    const range: DelimiterRange = [1, content.length - 1];

    addAttrs(token, content, range, null);

    expect(token.attrGet("id")).toBe("test-id");
  });

  it("should add css-module attribute", () => {
    const token = new Token("p", "p", 1);
    const content = "{..module-name}";
    const range: DelimiterRange = [1, content.length - 1];

    addAttrs(token, content, range, null);

    expect(token.attrGet("css-module")).toBe("module-name");
  });

  it("should add custom attributes", () => {
    const token = new Token("p", "p", 1);
    const content = "{data-test=value}";
    const range: DelimiterRange = [1, content.length - 1];

    addAttrs(token, content, range, null);

    expect(token.attrGet("data-test")).toBe("value");
  });

  it("should handle quoted values", () => {
    const token = new Token("p", "p", 1);
    const content = '{data-test="complex value"}';
    const range: DelimiterRange = [1, content.length - 1];

    addAttrs(token, content, range, null);

    expect(token.attrGet("data-test")).toBe("complex value");
  });

  it("should handle multiple attributes", () => {
    const token = new Token("p", "p", 1);
    const content = "{.test-class #test-id data-attr=test-value}";
    const range: DelimiterRange = [1, content.length - 1];

    addAttrs(token, content, range, null);

    expect(token.attrGet("class")).toBe("test-class");
    expect(token.attrGet("id")).toBe("test-id");
    expect(token.attrGet("data-attr")).toBe("test-value");
  });

  it("should filter attributes based on allowed list", () => {
    const token = new Token("p", "p", 1);
    const content = "{.test-class #test-id data-attr=test-value}";
    const range: DelimiterRange = [1, content.length - 1];
    const filter = normalizeAllowed(["class", "id"]);

    addAttrs(token, content, range, filter);

    expect(token.attrGet("class")).toBe("test-class");
    expect(token.attrGet("id")).toBe("test-id");
    expect(token.attrGet("data-attr")).toBeNull();
  });

  it("should handle regex in allowed list", () => {
    const token = new Token("p", "p", 1);
    const content = "{.test-class #test-id data-attr=test-value}";
    const range: DelimiterRange = [1, content.length - 1];
    const filter = normalizeAllowed([/^data-/]);

    addAttrs(token, content, range, filter);

    expect(token.attrGet("class")).toBeNull();
    expect(token.attrGet("id")).toBeNull();
    expect(token.attrGet("data-attr")).toBe("test-value");
  });

  it("should do nothing if token is null", () => {
    const content = "{.test-class}";
    const range: DelimiterRange = [1, content.length - 1];

    // Should not throw and do nothing
    expect(() => {
      addAttrs(null, content, range, null);
    }).not.toThrow();
  });
});
