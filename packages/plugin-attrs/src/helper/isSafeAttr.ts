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
 * Markdown-it v15.0.2 validates links with the overridable instance method
 * `MarkdownIt#validateLink` (`src/markdownit.ts:137-142`; protocol regexes at
 * `src/markdownit.ts:60-61`). It is called by the built-in rules at
 * `src/rules_inline/link.ts:46-47`, `src/rules_inline/image.ts:42-43`,
 * `src/rules_inline/autolink.ts:30-31`, `src/rules_inline/linkify.ts:62-63`,
 * `src/rules_core/linkify.ts:77-78` and `src/rules_block/reference.ts:116-117`.
 *
 * It is intentionally not reused here:
 *
 * - It is only exposed as an instance method (the package exports the `MarkdownIt` class only), so
 *   the default implementation cannot be imported directly;
 * - It validates link destinations, while this helper also guards every URL-bearing attribute
 *   (`URL_ATTR_NAMES`) and rejects `on*` event handler attributes, which markdown-it never emits;
 * - It uses `url.trim().toLowerCase()` + `BAD_PROTO_RE`, which misses control characters inside the
 *   scheme, so reusing it would reopen the bypass above;
 * - It is a documented plugin hook (`md.validateLink = () => true` is allowed), so delegating
 *   security filtering to it would let an override silently disable the attrs filter;
 * - It additionally rejects `file:` and most `data:` URLs, whereas this plugin deliberately keeps
 *   `data:` attribute values working.
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

/**
 * Get the URL scheme of an attribute value
 *
 * @param value Attribute value
 * @returns Lower-cased URL scheme, empty when the value is a relative URL
 */
const getUrlScheme = (value: string): string => {
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

    if (charCode === 0x3a /* : */) return scheme.toLowerCase();

    scheme += String.fromCharCode(charCode);
  }

  // no `:` means the value is a relative URL
  return "";
};

/**
 * Check whether an attribute value uses a dangerous URL scheme
 *
 * @param value Attribute value
 * @returns Whether the value uses a dangerous URL scheme
 */
const hasDangerousUrlScheme = (value: string): boolean => {
  const scheme = getUrlScheme(value);

  return scheme === "javascript" || scheme === "vbscript";
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
