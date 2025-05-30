/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { describe, expect, it } from "vitest";

import {
  getArrayItem,
  isArrayOfFunctions,
  isArrayOfObjects,
} from "../src/utils.js";

describe("getArrayItem", () => {
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

describe("isArrayOfFunctions", () => {
  it("should return true for array of functions", () => {
    const funcs = [() => {}, function () {}, () => "test"];

    expect(isArrayOfFunctions(funcs)).toBe(true);
  });

  it("should return true for array with single function", () => {
    const funcs = [() => {}];

    expect(isArrayOfFunctions(funcs)).toBe(true);
  });

  it("should return false for empty array", () => {
    const arr: any[] = [];

    expect(isArrayOfFunctions(arr)).toBe(false);
  });

  it("should return false for array with non-functions", () => {
    const arr = [1, 2, 3];

    expect(isArrayOfFunctions(arr)).toBe(false);
  });

  it("should return false for array with mixed types", () => {
    const arr = [() => {}, "string", 123];

    expect(isArrayOfFunctions(arr)).toBe(false);
  });

  it("should return false for non-array values", () => {
    expect(isArrayOfFunctions(null)).toBe(false);
    expect(isArrayOfFunctions(undefined)).toBe(false);
    expect(isArrayOfFunctions("string")).toBe(false);
    expect(isArrayOfFunctions(123)).toBe(false);
    expect(isArrayOfFunctions({})).toBe(false);
    expect(isArrayOfFunctions(() => {})).toBe(false);
  });

  it("should handle different function types", () => {
    const arrow = () => {};
    const regular = function () {};
    const async = async () => {};
    const generator = function* () {};

    expect(isArrayOfFunctions([arrow, regular])).toBe(true);
    expect(isArrayOfFunctions([async, generator])).toBe(true);
  });
});

describe("isArrayOfObjects", () => {
  it("should return true for array of objects", () => {
    const objects = [{ a: 1 }, { b: 2 }, { c: 3 }];

    expect(isArrayOfObjects(objects)).toBe(true);
  });

  it("should return true for array with single object", () => {
    const objects = [{ a: 1 }];

    expect(isArrayOfObjects(objects)).toBe(true);
  });

  it("should return true for array with different object types", () => {
    const objects = [{}, { a: 1 }, [], new Date(), new RegExp("test")];

    expect(isArrayOfObjects(objects)).toBe(true);
  });

  it("should return false for empty array", () => {
    const arr: any[] = [];

    expect(isArrayOfObjects(arr)).toBe(false);
  });

  it("should return false for array with primitives", () => {
    const arr = [1, "string", true];

    expect(isArrayOfObjects(arr)).toBe(false);
  });

  it("should return false for array with mixed types", () => {
    const arr = [{ a: 1 }, "string", 123];

    expect(isArrayOfObjects(arr)).toBe(false);
  });

  it("should return false for non-array values", () => {
    expect(isArrayOfObjects(null)).toBe(false);
    expect(isArrayOfObjects(undefined)).toBe(false);
    expect(isArrayOfObjects("string")).toBe(false);
    expect(isArrayOfObjects(123)).toBe(false);
    expect(isArrayOfObjects({})).toBe(false);
    expect(isArrayOfObjects(() => {})).toBe(false);
  });

  it("should handle null values in array", () => {
    const arr = [{ a: 1 }, null, { b: 2 }];

    expect(isArrayOfObjects(arr)).toBe(true);
  });

  it("should handle arrays as objects", () => {
    const arr = [[], new Date(), new RegExp("test")];

    expect(isArrayOfObjects(arr)).toBe(true);
  });

  it("should return false for array containing functions", () => {
    const arr = [{ a: 1 }, () => {}, { b: 2 }];

    expect(isArrayOfObjects(arr)).toBe(false);
  });
});
