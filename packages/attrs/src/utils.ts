/**
 * Get index item of array. Supports negative index, where -1 is last
 * element in array.
 */
export const getArrayItem = <T>(arr: T[], index: number): T =>
  index >= 0 ? arr[index] : arr[arr.length + index];

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const isArrayOfFunctions = (arr: unknown): arr is Function[] =>
  Array.isArray(arr) &&
  Boolean(arr.length) &&
  arr.every((item) => typeof item === "function");

export const isArrayOfObjects = (arr: unknown): arr is object[] =>
  Array.isArray(arr) &&
  Boolean(arr.length) &&
  arr.every((item) => typeof item === "object");
