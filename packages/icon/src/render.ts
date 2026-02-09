import { appendStyle, extractInfo, stringifyAttrs } from "./utils.js";

/**
 * Default render for icons
 *
 * @param icon icon string
 * @returns rendered icon content
 */
export const defaultRender = (icon: string): string => {
  const { attrs, content, size, color } = extractInfo({ content: icon });

  if (size) appendStyle(attrs, `font-size:${size}`);

  if (color) appendStyle(attrs, `color:${color}`);

  return `\
<i icon="${content}"${stringifyAttrs(attrs)}>\
</i>`;
};

/**
 * Render for [iconify-icon](https://iconify.design/docs/iconify-icon/)
 *
 * @param icon icon string
 * @returns rendered icon content
 */
export const iconifyRender = (icon: string): string => {
  const { attrs, content, size, color } = extractInfo({ content: icon });

  if (size) appendStyle(attrs, `font-size:${size}`);

  if (color) appendStyle(attrs, `color:${color}`);

  return `<iconify-icon icon="${content}"${stringifyAttrs(attrs)}></iconify-icon>`;
};

/**
 * Fontawesome families short aliases
 */
export const FONTAWESOME_FAMILY_SHORT_ALIAS: string[] = [
  // free
  "fas",
  "fab",

  // part of pro
  "far",

  // pro only
  "fal",
  "fat",
  "fass",
  "fasr",
];

/**
 * Fontawesome styles short aliases
 */
export const FONTAWESOME_STYLES_SHORT_ALIAS: string[] = [
  // pro only
  "fad",
  "fass",
  "fasr",
];

/**
 * Fontawesome short aliases
 */
export const FONTAWESOME_SHORT_ALIAS: string[] = [
  ...FONTAWESOME_FAMILY_SHORT_ALIAS,
  ...FONTAWESOME_STYLES_SHORT_ALIAS,
];

/**
 * Fontawesome families classes
 */
export const FONTAWESOME_FAMILIES: string[] = [
  ...FONTAWESOME_FAMILY_SHORT_ALIAS,
  // free
  "fa-solid",
  "fa-brands",

  // part of pro
  "fa-regular",

  // pro only
  "fa-light",
  "fa-thin",
];

/**
 * Fontawesome styles classes
 */
export const FONTAWESOME_STYLES: string[] = [
  ...FONTAWESOME_STYLES_SHORT_ALIAS,
  "fa-duotone",
  "fa-sharp",
  "fa-sharp-duotone",
];

/**
 * All fontawesome families and styles classes
 */
export const FONTAWESOME_FAMILIES_AND_STYLES: string[] = [
  ...FONTAWESOME_FAMILIES,
  ...FONTAWESOME_STYLES,
];

/**
 * Check if a class is a valid fontawesome short alias
 *
 * @param cls class string
 * @returns whether the class is a fontawesome short alias
 */
export const isFontawesomeShortAlias = (cls: string): boolean =>
  FONTAWESOME_SHORT_ALIAS.includes(cls);

/**
 * Check if a class is a valid fontawesome family
 *
 * @param cls class string
 * @returns whether the class is a fontawesome family
 */
export const isFontawesomeFamily = (cls: string): boolean => FONTAWESOME_FAMILIES.includes(cls);

/**
 * Ensure every class is prefixed with `fa-` or a valid short alias
 *
 * @param icon icon class string
 * @returns prefixed icon class string
 */
export const appendFontawesomePrefix = (icon: string): string =>
  icon.startsWith("fa-") || isFontawesomeShortAlias(icon) ? icon : `fa-${icon}`;

/**
 * Render for [fontawesome](https://fontawesome.com/) icons
 *
 * @param icon icon string
 * @returns rendered icon content
 */
export const fontawesomeRender = (icon: string): string => {
  const { attrs, content, size, color } = extractInfo({ content: icon });

  if (size) appendStyle(attrs, `font-size:${size}`);

  if (color) appendStyle(attrs, `color:${color}`);

  const classes = content.split(/\s+/);
  const finalClasses: string[] = [];
  const iconNameIndex = classes.findIndex((cls) => cls.includes(":"));

  // a icon name with explicit family (possibly with style) not found
  if (iconNameIndex === -1) {
    // oxlint-disable-next-line unicorn/no-array-callback-reference
    finalClasses.push(...classes.map(appendFontawesomePrefix));

    // if no family is specified, default to solid
    if (finalClasses.every((cls) => !isFontawesomeFamily(cls))) finalClasses.push("fa-solid");
  } else {
    // get explicit icon name and it's family
    const [iconName] = classes.splice(iconNameIndex, 1);

    const [type, name] = iconName.split(":", 2);

    finalClasses.push(
      type.length <= 2 ? `fa${type}` : appendFontawesomePrefix(type),
      appendFontawesomePrefix(name),
      // oxlint-disable-next-line unicorn/no-array-callback-reference
      ...classes.map(appendFontawesomePrefix),
    );
  }

  return `\
<i class="${finalClasses.join(" ")}"${stringifyAttrs(attrs)}></i>\
`;
};

/**
 * Render for [iconfont](https://www.iconfont.cn/) icons
 *
 * @param icon icon string
 * @returns rendered icon content
 */
export const iconfontRender = (icon: string): string => {
  const { attrs, content, size, color } = extractInfo({ content: icon });

  if (size) appendStyle(attrs, `font-size:${size}`);

  if (color) appendStyle(attrs, `color:${color}`);

  // add `iconfont` class and `icon-` prefix for first class
  return `<span class="iconfont icon-${content}"${stringifyAttrs(attrs)}></span>`;
};
