import { escapeHtml } from "@mdit/helper";

const SIZE_REGEXP = /(?<=\s|^)=(?<size>.+?)(?:\s|$)/;

/**
 * Extract size from content
 *
 * @param data Input data with content string
 * @returns Data with size property and cleaned content string
 */
export const extractSize = <Data extends { content: string }>(
  data: Data & { size?: string },
): Data & { size?: string } => {
  let size = "";

  data.content = data.content
    .replace(SIZE_REGEXP, (_, match: string) => {
      size = match;

      return "";
    })
    .trim();

  if (size) data.size = Number.isNaN(Number(size)) ? size : `${size}px`;

  return data;
};

const COLOR_REGEXP = /(?<=\s|^)\/(?<color>.+?)(?:\s|$)/;

/**
 * Extract color from content
 *
 * @param data Input data with content string
 * @returns Data with color property and cleaned content string
 */
export const extractColor = <Data extends { content: string }>(
  data: Data & { color?: string },
): Data & { color?: string } => {
  let color = "";

  data.content = data.content
    .replace(COLOR_REGEXP, (_, match: string) => {
      color = match;

      return "";
    })
    .trim();

  if (color) data.color = color;

  return data;
};

export type AttrsInfo = Record<string, string>;

const ATTR_NAME_REGEXP = "[A-Za-z_][a-zA-Z0-9_-]*";

const ATTR_REGEXP = new RegExp(
  // oxlint-disable-next-line prefer-template
  String.raw`\b` +
    // attr name
    `(?<attr>${ATTR_NAME_REGEXP})` +
    // =
    "=" +
    // attr value, should match on of the following
    `(?:` +
    /** Case 1: value with quotes */
    //   starting quote
    /**/ `(?<quote>['"])` +
    //   value capture group
    /**/ `(?<valueWithQuotes>` +
    /*  */ `(?:` +
    //      any character
    /*    */ `.` +
    //      negative lookahead for one of the following
    /*    */ `(?!` +
    //      case 1: ending and starting another attr
    /*      */ `\\k<quote>\\s+(?:${ATTR_NAME_REGEXP})=` +
    /*      */ `|` +
    //      case 2: an escaped quote
    /*      */ `(?<!\\\\)\\k<quote>` +
    /*    */ `)` +
    /*  */ `)+.` +
    /**/ `)` +
    //   ending with same quote
    /**/ `\\k<quote>` +
    /**/ "|" +
    /** Case 2: empty values */
    /**/ `(?<emptyValue>''|"")` +
    /**/ "|" +
    /** Case 3: value without quotes */
    /**/ String.raw`(?<valueWithoutQuotes>\S+)` +
    `)` +
    // optional space
    `(?:\\s+|$)`,
  "g",
);

/**
 * Parse attrs string to object
 *
 * @param data Input data with content string
 * @returns Data with attrs object and cleaned content string
 */
export const extractAttrs = <Data extends { content: string }>(
  data: Data & { attrs?: AttrsInfo },
): Data & { attrs: AttrsInfo } => {
  const attrs: AttrsInfo = {};

  const content = data.content
    .replace(
      ATTR_REGEXP,
      // oxlint-disable-next-line max-params
      (
        _,
        _1,
        _2,
        _3,
        _4,
        _5,
        _6,
        _7,
        info: {
          attr: string;
          emptyValue: string | undefined;
          valueWithoutQuotes: string | undefined;
          valueWithQuotes: string | undefined;
          quote: string | undefined;
        },
      ) => {
        attrs[info.attr] = info.emptyValue
          ? ""
          : (info.valueWithoutQuotes ??
            // oxlint-disable-next-line typescript/no-non-null-assertion
            info.valueWithQuotes!.replaceAll(new RegExp(`\\\\${info.quote}`, "g"), info.quote!));

        return "";
      },
    )
    .trim();

  return Object.assign({}, data, { attrs, content });
};

export const extractInfo = <Data extends { content: string }>(
  data: Data & { attrs?: AttrsInfo; size?: string; color?: string },
): Data & { attrs: AttrsInfo; size?: string; color?: string } =>
  extractColor(extractSize(extractAttrs(data)));

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

  // browsers trim leading C0 controls and spaces before parsing URLs
  while (index < length) {
    if (value.charCodeAt(index) > 0x20) break;

    index++;
  }

  for (; index < length; index++) {
    const charCode = value.charCodeAt(index);

    // tab, line feed and carriage return are removed from URLs before parsing
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
 * @param name Attribute name
 * @param value Attribute value
 * @returns Whether the attribute is safe
 */
const isSafeAttr = (name: string, value: string): boolean => {
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

/**
 * Append styles to attrs object
 *
 * @param attrs Attrs object
 * @param styleDefinition New style definition
 * @returns Updated attrs object
 */
export const appendStyle = (
  attrs: Record<string, string>,
  styleDefinition: string,
): Record<string, string> => {
  const { style = "" } = attrs;

  attrs.style = `${style}${style && !style.endsWith(";") ? ";" : ""}${styleDefinition}`;

  return attrs;
};

/**
 * Stringify attrs object
 *
 * Unsafe attributes (event handlers and URL attributes with dangerous URL schemes) are ignored.
 *
 * @param attrs Attrs object
 * @returns Stringified attrs
 */
export const stringifyAttrs = (attrs: Record<string, string>): string => {
  const result = Object.entries(attrs)
    .filter(([key, value]) => isSafeAttr(key, value))
    .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
    .join(" ");

  return result ? ` ${result}` : "";
};
