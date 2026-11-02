/** Attributes of an HTML start tag / HTML 起始标签的属性 */
const ATTRIBUTE_PATTERN = /(?<attribute>[^\s=/>]+)(?:=(?:"[^"]*"|'[^']*'|[^\s"'>]+))?/gu;

/**
 * Collapse whitespace so that insignificant formatting differences do not fail the comparison
 *
 * @param html - Rendered HTML
 * @returns HTML with whitespace collapsed into single spaces
 */
export const collapseWhitespace = (html: string): string => html.trim().replaceAll(/\s+/gu, " ");

/** An HTML start tag / HTML 起始标签 */
const TAG_PATTERN = /<(?<tag>[a-z][\w:-]*)(?<attributes>\s[^<>]*?)?(?<selfClose>\s*\/?)>/giu;

/**
 * Sort the attributes of every HTML start tag alphabetically
 *
 * Attribute order is not meaningful in HTML and differs between implementations, so it is
 * normalized before comparing. Attribute values are kept untouched.
 *
 * @param html - Rendered HTML
 * @returns HTML with sorted start tag attributes
 */
export const sortAttributes = (html: string): string => {
  let result = "";
  let lastIndex = 0;

  for (const match of html.matchAll(TAG_PATTERN)) {
    const { tag = "", attributes, selfClose = "" } = match.groups ?? {};
    const start = match.index ?? 0;
    const parsed = attributes?.trim()
      ? [...attributes.matchAll(ATTRIBUTE_PATTERN)].map((attribute) => attribute[0]).sort()
      : [];

    result += `${html.slice(lastIndex, start)}<${tag}${parsed.length > 0 ? ` ${parsed.join(" ")}` : ""}${selfClose}>`;
    lastIndex = start + match[0].length;
  }

  return result + html.slice(lastIndex);
};

/**
 * Default normalization applied to both sides before comparing outputs
 *
 * Only attribute order is normalized. Whitespace is kept as is because it is meaningful inside
 * `<pre>` and code blocks; specs that need more normalization compose it with
 * {@link collapseWhitespace}.
 *
 * @param html - Rendered HTML
 * @returns Normalized HTML
 */
export const normalizeHtml = (html: string): string => sortAttributes(html);

/**
 * Remove a pattern from the rendered HTML
 *
 * @param html - Rendered HTML
 * @param pattern - Pattern to remove
 * @returns HTML without matches
 */
export const removeMatches = (html: string, pattern: RegExp): string => html.replace(pattern, "");

/**
 * Replace a pattern in the rendered HTML
 *
 * @param html - Rendered HTML
 * @param pattern - Pattern to replace
 * @param replacement - Replacement text
 * @returns HTML with replaced matches
 */
export const replaceMatches = (html: string, pattern: RegExp, replacement: string): string =>
  html.replace(pattern, replacement);

/**
 * Compose several normalization steps
 *
 * @param steps - Normalization functions applied from left to right
 * @returns A normalization function
 */
export const composeNormalizers =
  (...steps: readonly ((html: string) => string)[]): ((html: string) => string) =>
  (html) =>
    steps.reduce((current, step) => step(current), html);
