/**
 * Safe attribute filtering for `@mdit/plugin-attrs`.
 *
 * ## URL scheme parsing
 *
 * `getUrlScheme` is not copied from markdown-it. It implements the two input preprocessing steps of
 * the WHATWG URL Standard's "basic URL parser" that browsers apply before parsing a scheme
 * (https://url.spec.whatwg.org/#concept-basic-url-parser):
 *
 * 1. "Remove any leading and trailing C0 control or space from input."
 * 2. "Remove all ASCII tab or newline from input."
 *
 * These steps are required: `java\tscript:`, `java\nscript:` and `\u0001javascript:` are executed
 * as `javascript:` by browsers, while a plain `trim()` + prefix check treats them as relative URLs.
 * See `__tests__/security.spec.ts` for the covered forms.
 *
 * ## Relation to markdown-it's `validateLink`
 *
 * The accept/reject policy mirrors markdown-it's built-in link validation
 * (`MarkdownIt#validateLink` in `src/markdownit.ts:137-142`, with the protocol regexes at
 * `src/markdownit.ts:60-61`, v15.0.2):
 *
 * - `javascript:`, `vbscript:` and `file:` are always rejected;
 * - `data:` URLs are only accepted for `data:image/(gif|png|jpeg|webp);` (the same `GOOD_DATA_RE` as
 *   markdown-it), so e.g. `data:text/html` and `data:image/svg+xml` are rejected;
 * - Relative URLs and any other schemes (`mailto:`, `tel:`, ...) are accepted.
 *
 * It is called by the built-in rules at `src/rules_inline/link.ts:46-47`,
 * `src/rules_inline/image.ts:42-43`, `src/rules_inline/autolink.ts:30-31`,
 * `src/rules_inline/linkify.ts:62-63`, `src/rules_core/linkify.ts:77-78` and
 * `src/rules_block/reference.ts:116-117`.
 *
 * It cannot be called directly from this helper:
 *
 * - It is only exposed as an overridable instance method (the package exports the `MarkdownIt` class
 *   only), so the default implementation cannot be imported as a standalone function;
 * - It only validates link destinations, while this helper also guards every URL-bearing attribute
 *   (`URL_ATTR_NAMES`) and rejects `on*` event handler attributes, which markdown-it never emits;
 * - It is a documented plugin hook (`md.validateLink = () => true` is allowed), so delegating the
 *   attrs security filter to it would let an override silently disable it;
 * - It validates the raw `trim().toLowerCase()` result, which misses control characters inside the
 *   scheme, so the WHATWG preprocessing above is kept on our side: the policy is the same, the
 *   string normalization is stricter.
 *
 * The check runs at attrs-parse time (`getAttrs`), so every rule and `parseAttrs` are covered
 * before any rendering happens.
 */

/** Attributes whose value is parsed as an URL */
const URL_ATTR_NAMES = new Set([
  "action",
  "background",
  "cite",
  "codebase",
  "data",
  "formaction",
  "href",
  "imagesrcset",
  "longdesc",
  "manifest",
  "ping",
  "poster",
  "src",
  "srcset",
  "usemap",
  "xlink:href",
]);

/** URL schemes that are always unsafe on URL attributes (mirrors markdown-it's `BAD_PROTO_RE`) */
const DANGEROUS_SCHEMES = new Set(["file", "javascript", "vbscript"]);

/** Data URLs accepted by markdown-it (`GOOD_DATA_RE` in `src/markdownit.ts:61`) */
const SAFE_DATA_URL_RE = /^image\/(?:gif|png|jpeg|webp);/i;

interface ParsedUrl {
  /** Lower-cased URL scheme, empty when the value is a relative URL */
  scheme: string;
  /** Value after the scheme separator `:` (meaningful only when `scheme` is non-empty) */
  rest: string;
}

/**
 * Parse the URL scheme of an attribute value
 *
 * Applies the browser URL preprocessing described in the file header before reading the scheme.
 *
 * @param value Attribute value
 * @returns The lower-cased scheme (empty for a relative URL) and the remaining value after `:`
 */
const parseUrl = (value: string): ParsedUrl => {
  const { length } = value;
  let index = 0;
  let scheme = "";

  // WHATWG URL Standard, basic URL parser: "Remove any leading and trailing C0 control or space
  // from input." (browsers do this before parsing the scheme)
  while (index < length) {
    if (value.charCodeAt(index) > 0x20) break;

    index++;
  }

  for (; index < length; index++) {
    const charCode = value.charCodeAt(index);

    // WHATWG URL Standard, basic URL parser: "Remove all ASCII tab or newline from input."
    if (charCode === 0x09 /* \t */ || charCode === 0x0a /* \n */ || charCode === 0x0d /* \r */)
      continue;

    if (charCode === 0x3a /* : */)
      return { scheme: scheme.toLowerCase(), rest: value.slice(index + 1) };

    scheme += String.fromCharCode(charCode);
  }

  // no `:` means the value is a relative URL
  return { scheme: "", rest: "" };
};

/**
 * Check whether an attribute value uses a URL scheme rejected by the plugin's policy
 *
 * The policy mirrors markdown-it's link validation: `javascript:`, `vbscript:` and `file:` are
 * rejected, and `data:` is only accepted for image data URLs.
 *
 * @param value Attribute value
 * @returns Whether the value uses a dangerous URL scheme
 */
const hasDangerousUrlScheme = (value: string): boolean => {
  const { scheme, rest } = parseUrl(value);

  if (scheme === "data") return !SAFE_DATA_URL_RE.test(rest);

  return DANGEROUS_SCHEMES.has(scheme);
};

/**
 * Check whether an attribute is safe to render
 *
 * Event handler attributes and URL attributes with a dangerous URL scheme are considered unsafe.
 *
 * @param name Attribute name
 * @param value Attribute value
 * @returns Whether the attribute is safe
 */
export const isSafeAttr = (name: string, value: string): boolean => {
  const normalizedName = name.toLowerCase();

  // event handler attributes are never safe
  if (
    normalizedName.charCodeAt(0) === 0x6f /* o */ &&
    normalizedName.charCodeAt(1) === 0x6e /* n */
  )
    return false;

  // dangerous URL schemes are never safe on URL attributes
  return !(URL_ATTR_NAMES.has(normalizedName) && hasDangerousUrlScheme(value));
};
