import { describe, expect, it } from "vitest";

import { customEncodeBase64 } from "../src/customBase64.js";

describe("customBase64", () => {
  it("should encode empty string", () => {
    expect(customEncodeBase64("")).toBe("");
  });

  it("should encode single character", () => {
    expect(customEncodeBase64("A")).toBe("GG00");
  });

  it("should encode two characters", () => {
    expect(customEncodeBase64("AB")).toBe("GK80");
  });

  it("should encode three characters", () => {
    expect(customEncodeBase64("ABC")).toBe("GK93");
  });

  it("should encode PlantUML basic diagram content", () => {
    const content = "Bob -> Alice : hello";
    const encoded = customEncodeBase64(content);

    expect(encoded).toBe("GczY82q-845iQMDb83eWQ6LiR6y0");
  });

  it("should handle special characters", () => {
    expect(customEncodeBase64("@")).toBe("G000");
    expect(customEncodeBase64("#")).toBe("8m00");
    expect(customEncodeBase64("!")).toBe("8G00");
  });

  it("should encode numeric characters", () => {
    expect(customEncodeBase64("123")).toBe("CJ8p");
  });

  it("should encode lowercase letters", () => {
    expect(customEncodeBase64("abc")).toBe("OM9Z");
  });

  it("should encode uppercase letters", () => {
    expect(customEncodeBase64("XYZ")).toBe("M5bQ");
  });

  it("should handle whitespace characters", () => {
    expect(customEncodeBase64(" ")).toBe("8000");
    expect(customEncodeBase64("\n")).toBe("2W00");
    expect(customEncodeBase64("\t")).toBe("2G00");
  });

  it("should encode longer text correctly", () => {
    const content = "This is a test message for PlantUML encoding";
    const encoded = customEncodeBase64(content);

    // Verify it's a non-empty string with expected characters
    expect(encoded).toMatch(/^[0-9A-Za-z\-_]+$/);
    expect(encoded.length).toBeGreaterThan(0);
  });

  it("should produce consistent results", () => {
    const content = "Test content";
    const encoded1 = customEncodeBase64(content);
    const encoded2 = customEncodeBase64(content);

    expect(encoded1).toBe(encoded2);
  });

  it("should handle unicode characters", () => {
    const content = "Hello 世界";
    const encoded = customEncodeBase64(content);

    expect(encoded).toMatch(/^[0-9A-Za-z\-_]+$/);
    expect(encoded.length).toBeGreaterThan(0);
  });

  it("should use PlantUML character set (0-9A-Za-z-_)", () => {
    const content = "Sample text with various characters!@#$%^&*()";
    const encoded = customEncodeBase64(content);

    // Should only contain PlantUML Base64 characters
    expect(encoded).toMatch(/^[0-9A-Za-z\-_]*$/);
  });

  it("should handle exact 3-byte boundaries", () => {
    // Test strings of exact multiples of 3 bytes
    expect(customEncodeBase64("ABC")).toBe("GK93"); // 3 bytes
    expect(customEncodeBase64("ABCDEF")).toBe("GK93H4L6"); // 6 bytes
  });

  it("should handle strings requiring padding", () => {
    // Test strings that are not multiples of 3 bytes
    expect(customEncodeBase64("A")).toBe("GG00"); // 1 byte
    expect(customEncodeBase64("AB")).toBe("GK80"); // 2 bytes
    expect(customEncodeBase64("ABCD")).toBe("GK93H000"); // 4 bytes
    expect(customEncodeBase64("ABCDE")).toBe("GK93H4K0"); // 5 bytes
  });

  it("should encode common PlantUML syntax elements", () => {
    expect(customEncodeBase64("@startuml")).toMatch(/^[0-9A-Za-z\-_]+$/);
    expect(customEncodeBase64("@enduml")).toMatch(/^[0-9A-Za-z\-_]+$/);
    expect(customEncodeBase64("->")).toMatch(/^[0-9A-Za-z\-_]+$/);
    expect(customEncodeBase64("-->")).toMatch(/^[0-9A-Za-z\-_]+$/);
  });
});
