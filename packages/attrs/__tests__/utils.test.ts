import { describe, expect, it } from "vitest";

import { getArrayItem } from "../src/utils.js";

describe(getArrayItem, () => {
  it("should get item by positive index", () => {
    const arr = ["a", "b", "c", "d"];

    expect(getArrayItem(arr, 0)).toBe("a");
    expect(getArrayItem(arr, 1)).toBe("b");
    expect(getArrayItem(arr, 2)).toBe("c");
    expect(getArrayItem(arr, 3)).toBe("d");
  });

  it("should get item by negative index", () => {
    const arr = ["a", "b", "c", "d"];

    expect(getArrayItem(arr, -1)).toBe("d");
    expect(getArrayItem(arr, -2)).toBe("c");
    expect(getArrayItem(arr, -3)).toBe("b");
    expect(getArrayItem(arr, -4)).toBe("a");
  });

  it("should handle empty array", () => {
    const arr: string[] = [];

    expect(getArrayItem(arr, 0)).toBeUndefined();
    expect(getArrayItem(arr, -1)).toBeUndefined();
  });

  it("should handle single item array", () => {
    const arr = ["single"];

    expect(getArrayItem(arr, 0)).toBe("single");
    expect(getArrayItem(arr, -1)).toBe("single");
  });

  it("should work with different types", () => {
    const numbers = [1, 2, 3];
    const objects = [{ a: 1 }, { b: 2 }];

    expect(getArrayItem(numbers, 1)).toBe(2);
    expect(getArrayItem(numbers, -1)).toBe(3);
    expect(getArrayItem(objects, 0)).toEqual({ a: 1 });
    expect(getArrayItem(objects, -1)).toEqual({ b: 2 });
  });

  it("should handle out of bounds positive index", () => {
    const arr = ["a", "b", "c"];

    expect(getArrayItem(arr, 5)).toBeUndefined();
    expect(getArrayItem(arr, 10)).toBeUndefined();
  });

  it("should handle out of bounds negative index", () => {
    const arr = ["a", "b", "c"];

    expect(getArrayItem(arr, -5)).toBeUndefined();
    expect(getArrayItem(arr, -10)).toBeUndefined();
  });

  it("should handle zero index on empty array", () => {
    const arr: number[] = [];

    expect(getArrayItem(arr, 0)).toBeUndefined();
  });
});
