const ESCAPE_REGEXP = /[-/\\^$*+?.()|[\]{}]/g;
const REPLACE_WITH = String.raw`\$&`;

/**
 * Escapes html content
 *
 * @param unsafeHTML The html content to escape.
 * @returns The escaped html content.
 */

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
 *
 * @param regexp The string to escape.
 * @returns The escaped string.
 */
export const escapeRegExp = (regexp: string): string =>
  regexp.replaceAll(ESCAPE_REGEXP, REPLACE_WITH);
