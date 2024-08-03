/**
 * Get amount item of array. Supports negative amount, where -1 is last
 * element in array.
 */
export const getElements = <T>(arr: T[], amount: number): T =>
  amount >= 0 ? arr[amount] : arr[arr.length + amount];

/**
 * Escapes special characters in string s such that the string
 * can be used in `new RegExp`. For example "[" becomes "\\[".
 */
export const escapeRegExp = (regexp: string): string =>
  regexp.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const isArrayOfFunctions = (arr: unknown): arr is Function[] =>
  Array.isArray(arr) &&
  Boolean(arr.length) &&
  arr.every((item) => typeof item === "function");

export const isArrayOfObjects = (arr: unknown): arr is object[] =>
  Array.isArray(arr) &&
  Boolean(arr.length) &&
  arr.every((item) => typeof item === "object");
