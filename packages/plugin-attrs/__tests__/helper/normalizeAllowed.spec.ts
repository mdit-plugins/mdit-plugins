import { describe, expect, it } from "vitest";

import { normalizeAllowed } from "../../src/helper/normalizeAllowed.js";

describe("normalizeAllowed - simple format", () => {
  it("should return null for empty array", () => {
    expect(normalizeAllowed([])).toBeNull();
  });

  it("should filter by string name (match)", () => {
    const filter = normalizeAllowed(["class", "id"]);

    expect(filter).not.toBeNull();
    expect(filter!("class", "test-class")).toBe(true);
    expect(filter!("id", "test-id")).toBe(true);
  });

  it("should filter by string name (no match)", () => {
    const filter = normalizeAllowed(["class", "id"]);

    expect(filter!("data-x", "value")).toBe(false);
  });

  it("should filter by regex name (match)", () => {
    const filter = normalizeAllowed([/^data-/]);

    expect(filter!("data-x", "value")).toBe(true);
    expect(filter!("data-y", "value")).toBe(true);
  });

  it("should filter by regex name (no match)", () => {
    const filter = normalizeAllowed([/^data-/]);

    expect(filter!("class", "value")).toBe(false);
  });

  it("should filter by mixed string and regex names", () => {
    const filter = normalizeAllowed(["class", /^data-/]);

    expect(filter!("class", "test")).toBe(true);
    expect(filter!("data-x", "test")).toBe(true);
    expect(filter!("id", "test")).toBe(false);
  });
});

describe("normalizeAllowed - entry format (AllowedAttrEntry[])", () => {
  it("should filter by string name without value constraint", () => {
    const filter = normalizeAllowed([{ name: "class" }, { name: "id" }]);

    expect(filter).not.toBeNull();
    expect(filter!("class", "anything")).toBe(true);
    expect(filter!("id", "anything")).toBe(true);
  });

  it("should filter by string name (no match)", () => {
    const filter = normalizeAllowed([{ name: "class" }]);

    expect(filter!("data-x", "value")).toBe(false);
  });

  it("should filter by string name with string value (match)", () => {
    const filter = normalizeAllowed([{ name: "class", value: ["foo", "bar"] }]);

    expect(filter!("class", "foo")).toBe(true);
    expect(filter!("class", "bar")).toBe(true);
  });

  it("should filter by string name with string value (no match)", () => {
    const filter = normalizeAllowed([{ name: "class", value: ["foo", "bar"] }]);

    expect(filter!("class", "baz")).toBe(false);
  });

  it("should filter by string name with regex value (match)", () => {
    const filter = normalizeAllowed([{ name: "class", value: [/^bg-/] }]);

    expect(filter!("class", "bg-red")).toBe(true);
    expect(filter!("class", "bg-blue")).toBe(true);
  });

  it("should filter by string name with regex value (no match)", () => {
    const filter = normalizeAllowed([{ name: "class", value: [/^bg-/] }]);

    expect(filter!("class", "text-red")).toBe(false);
  });

  it("should filter by string name with mixed string and regex values", () => {
    const filter = normalizeAllowed([{ name: "class", value: ["primary", /^bg-/] }]);

    expect(filter!("class", "primary")).toBe(true);
    expect(filter!("class", "bg-red")).toBe(true);
    expect(filter!("class", "secondary")).toBe(false);
  });

  it("should filter by regex name without value constraint", () => {
    const filter = normalizeAllowed([{ name: /^data-/ }]);

    expect(filter!("data-x", "anything")).toBe(true);
    expect(filter!("data-y", "anything")).toBe(true);
  });

  it("should filter by regex name (no match)", () => {
    const filter = normalizeAllowed([{ name: /^data-/ }]);

    expect(filter!("class", "value")).toBe(false);
  });

  it("should filter by regex name with string value (match)", () => {
    const filter = normalizeAllowed([{ name: /^data-/, value: ["json", "xml"] }]);

    expect(filter!("data-type", "json")).toBe(true);
    expect(filter!("data-type", "xml")).toBe(true);
  });

  it("should filter by regex name with string value (no match)", () => {
    const filter = normalizeAllowed([{ name: /^data-/, value: ["json", "xml"] }]);

    expect(filter!("data-type", "html")).toBe(false);
  });

  it("should filter by regex name with regex value (match)", () => {
    const filter = normalizeAllowed([{ name: /^data-/, value: [/^[a-z]+$/] }]);

    expect(filter!("data-type", "json")).toBe(true);
  });

  it("should filter by regex name with regex value (no match)", () => {
    const filter = normalizeAllowed([{ name: /^data-/, value: [/^[a-z]+$/] }]);

    expect(filter!("data-type", "JSON")).toBe(false);
  });

  it("should handle mixed entry types (string name + regex name)", () => {
    const filter = normalizeAllowed([
      { name: "class", value: ["primary"] },
      { name: /^data-/, value: [/^val-/] },
    ]);

    expect(filter!("class", "primary")).toBe(true);
    expect(filter!("class", "secondary")).toBe(false);
    expect(filter!("data-x", "val-1")).toBe(true);
    expect(filter!("data-x", "other")).toBe(false);
    expect(filter!("id", "anything")).toBe(false);
  });

  it("should handle empty value array (allow any value)", () => {
    const filter = normalizeAllowed([{ name: "class", value: [] }]);

    expect(filter!("class", "anything")).toBe(true);
  });

  it("should handle multiple entries matching same name", () => {
    const filter = normalizeAllowed([
      { name: "class", value: ["foo"] },
      { name: "class", value: ["bar"] },
    ]);

    // First matching entry wins: class=foo matches the first entry
    expect(filter!("class", "foo")).toBe(true);
    // class=bar also matches the first entry's name, but its value filter rejects it.
    // The loop does not fall through to the second entry — first name match short-circuits.
    expect(filter!("class", "bar")).toBe(false);
  });
});
