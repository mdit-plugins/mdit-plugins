import { escapeHtml } from "@mdit/helper";

const SIZE_REGEXP = /(?<=\s|^)=(.+?)(?:\s|$)/;

/**
 * Extract size from content
 */
export const extractSize = <T extends { content: string }>(
  data: T & { size?: string },
): T & { size?: string } => {
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
 */
export const extractColor = <T extends { content: string }>(
  data: T & { color?: string },
): T & { color?: string } => {
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
  `\\b` +
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
     * case 2: value without quotes
     */
    /**/ "(?<valueWithoutQuotes>\\S+)" +
    `)` +
    // optional space
    `(?:\\s+|$)`,
  "g",
);

// console.log(ATTR_REGEXP.toString());

/**
 * Parse attrs string to object
 *
 * @param attrs
 * @returns
 */
export const extractAttrs = <T extends { content: string }>(
  data: T & { attrs?: AttrsInfo },
): T & { attrs: AttrsInfo } => {
  const attrs: AttrsInfo = {};

  const content = data.content
    .replace(
      ATTR_REGEXP,
      (
        _,
        _1,
        _2,
        _3,
        _4,
        _5,
        _6,
        {
          attr,
          quote,
          valueWithQuotes,
          valueWithoutQuotes,
        }: {
          attr: string;
          quote: string | undefined;
          valueWithQuotes: string | undefined;
          valueWithoutQuotes: string | undefined;
        },
      ) => {
        attrs[attr] =
          valueWithoutQuotes ??
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          valueWithQuotes!.replace(new RegExp(`\\\\${quote}`, "g"), quote!);

        return "";
      },
    )
    .trim();

  return { ...data, attrs, content };
};

export const extractInfo = <T extends { content: string }>(
  data: T & { attrs?: AttrsInfo; size?: string; color?: string },
): T & { attrs: AttrsInfo; size?: string; color?: string } =>
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
 */
export const stringifyAttrs = (attrs: Record<string, string>): string => {
  const result = Object.entries(attrs)
    .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
    .join(" ");

  return result ? ` ${result}` : "";
};
