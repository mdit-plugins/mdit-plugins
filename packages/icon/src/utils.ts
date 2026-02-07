import { escapeHtml } from "@mdit/helper";

const SIZE_REGEXP = /(?<=\s|^)=(.+?)(?:\s|$)/;

/**
 * Extract size from content
 *
 * @param data input data with content string
 * @returns data with size property and cleaned content string
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

const COLOR_REGEXP = /(?<=\s|^)\/(.+?)(?:\s|$)/;

/**
 * Extract color from content
 *
 * @param data input data with content string
 * @returns data with color property and cleaned content string
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

const ATTR_NAME_REGEXP = "[A-z_][a-zA-Z0-9_-]*";

const ATTR_REGEXP = new RegExp(
  // oxlint-disable-next-line prefer-template
  String.raw`\b` +
    // attr name
    `(?<attr>${ATTR_NAME_REGEXP})` +
    // =
    "=" +
    // attr value, should match on of the following
    `(?:` +
    /**
     * case 1: value with quotes
     */
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
    /**
     * case 2: empty values
     */
    /**/ `(?<emptyValue>''|"")` +
    /**/ "|" +
    /**
     * case 3: value without quotes
     */
    /**/ String.raw`(?<valueWithoutQuotes>\S+)` +
    `)` +
    // optional space
    `(?:\\s+|$)`,
  "g",
);

/**
 * Parse attrs string to object
 *
 * @param data input data with content string
 * @returns data with attrs object and cleaned content string
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

/**
 * append styles to attrs object
 *
 * @param attrs Attrs object
 * @param styleDefinition new style definition
 * @returns updated attrs object
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
 * @param attrs Attrs object
 * @returns stringified attrs
 */
export const stringifyAttrs = (attrs: Record<string, string>): string => {
  const result = Object.entries(attrs)
    .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
    .join(" ");

  return result ? ` ${result}` : "";
};
