export const escapeHtml = (unsafeHTML: string): string =>
  unsafeHTML
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;")
    .replace(/'/gu, "&#39;");

/**
 * Escapes special characters in string s such that the string
 * can be used in `new RegExp`. For example "[" becomes "\\[".
 */
export const escapeRegExp = (regexp: string): string =>
  regexp.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
