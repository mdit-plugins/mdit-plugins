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

export interface Attrs {
  attrs: Record<string, string>;
  classes: string[];
}

const ATTR_REGEXP =
  /(\w+)=['"]?((?:.(?!['"]?\s+(?:\S+)=|[>'"]))+.)['"]?|(\S+)/g;

/**
 * Parse attrs string to object
 *
 * @param attrs
 * @returns
 */
export const parseAttrs = (content: string): Attrs => {
  const classes: string[] = [];
  const attrs: Record<string, string> = {};

  let match;

  while ((match = ATTR_REGEXP.exec(content)) !== null) {
    if (match[3]) {
      classes.push(match[3]);
    } else {
      attrs[match[1]] = match[2];
    }
  }

  return { classes, attrs };
};

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
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");

  return result ? ` ${result}` : "";
};
