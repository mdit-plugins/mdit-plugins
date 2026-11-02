import type { Token } from "markdown-it";

import type { TokenDifference } from "./types.ts";

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

/** A parsed token normalized for comparison */
export interface CanonicalToken {
  /** Token type */
  readonly type: string;
  /** HTML tag */
  readonly tag: string;
  /** Nesting level: 1 for opening, 0 for self-closing, -1 for closing tokens */
  readonly nesting: number;
  /** Nesting level inside the token stream */
  readonly level: number;
  /** Source map `[startLine, endLine]`, or `null` */
  readonly map: readonly [number, number] | null;
  /** Markup that produced the token */
  readonly markup: string;
  /** Info string */
  readonly info: string;
  /** Raw content */
  readonly content: string;
  /** Attributes, sorted by name */
  readonly attrs: readonly (readonly [string, string])[] | null;
  /** Whether the token is a block-level token */
  readonly block: boolean;
  /** Whether the token is hidden from rendering */
  readonly hidden: boolean;
  /** Serialized `meta` value, or `null` */
  readonly meta: string | null;
  /** Child inline tokens */
  readonly children: readonly CanonicalToken[] | null;
}

/**
 * Serialize a token `meta` value
 *
 * @param meta - `meta` value of a token
 * @returns A deterministic string, or `null` when the token has no meta data
 */
const serializeMeta = (meta: unknown): string | null => {
  if (meta == null) return null;

  try {
    return JSON.stringify(meta) ?? "[unserializable]";
  } catch {
    return "[unserializable]";
  }
};

/**
 * Format a value for a token difference report
 *
 * @param value - Value of a canonical token field
 * @returns The serialized value, truncated to a readable length
 */
const formatTokenValue = (value: unknown): string => {
  const text = JSON.stringify(value) ?? String(value);

  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
};

/**
 * Normalize a parsed token stream for comparison
 *
 * Only the fields that are part of the markdown-it token contract are kept, attributes are sorted
 * by name, and `meta` is serialized so that both sides can be compared deterministically.
 *
 * @param tokens - Tokens returned by `md.parse`
 * @returns Canonical tokens
 */
export const canonicalizeTokens = (tokens: readonly Token[]): readonly CanonicalToken[] =>
  tokens.map((token) => ({
    type: token.type,
    tag: token.tag,
    nesting: token.nesting,
    level: token.level,
    map: token.map,
    markup: token.markup,
    info: token.info,
    content: token.content,
    attrs: token.attrs
      ? token.attrs
          .map(([name, value]) => [name, String(value)] as const)
          .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
      : null,
    block: token.block,
    hidden: token.hidden,
    meta: serializeMeta(token.meta),
    children: token.children ? canonicalizeTokens(token.children) : null,
  }));

/**
 * Find the first difference between two canonical token streams
 *
 * @param current - Canonical tokens of the current package
 * @param reference - Canonical tokens of the reference package
 * @returns The first difference, or `undefined` when both streams are identical
 */
export const findTokenDifference = (
  current: readonly CanonicalToken[],
  reference: readonly CanonicalToken[],
): TokenDifference | undefined => {
  const walk = (
    currentValue: unknown,
    referenceValue: unknown,
    path: string,
  ): TokenDifference | undefined => {
    if (currentValue === referenceValue) return void 0;

    if (Array.isArray(currentValue) && Array.isArray(referenceValue)) {
      const length = Math.max(currentValue.length, referenceValue.length);

      for (let index = 0; index < length; index++) {
        const difference = walk(currentValue[index], referenceValue[index], `${path}[${index}]`);

        if (difference) return difference;
      }

      return void 0;
    }

    if (
      currentValue != null &&
      referenceValue != null &&
      typeof currentValue === "object" &&
      typeof referenceValue === "object"
    ) {
      const currentRecord = currentValue as Record<string, unknown>;
      const referenceRecord = referenceValue as Record<string, unknown>;
      const keys = [...new Set([...Object.keys(currentRecord), ...Object.keys(referenceRecord)])];

      for (const key of keys) {
        const difference = walk(currentRecord[key], referenceRecord[key], `${path}.${key}`);

        if (difference) return difference;
      }

      return void 0;
    }

    return {
      path,
      current: formatTokenValue(currentValue),
      reference: formatTokenValue(referenceValue),
    };
  };

  return walk(current, reference, "");
};
