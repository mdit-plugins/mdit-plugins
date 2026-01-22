export const escapeHtml = (unsafeHTML: string): string =>
  unsafeHTML
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

/**
 * Escapes special characters in string s such that the string
 * can be used in `new RegExp`. For example "[" becomes "\\[".
 */
export const escapeRegExp = (regexp: string): string =>
  regexp.replaceAll(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
