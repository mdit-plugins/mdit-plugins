import { escapeHtml } from "@mdit/helper";

import { appendStyle, extractInfo, stringifyAttrs } from "./utils.js";

/**
 * Default render for icons
 *
 * 图标的默认渲染器
 *
 * @param icon - Icon string / 图标字符串
 * @returns Rendered icon content / 渲染后的图标内容
 */
export const defaultRender = (icon: string): string => {
  const { attrs, content, size, color } = extractInfo({ content: icon });

  if (size) appendStyle(attrs, `font-size:${size}`);

  if (color) appendStyle(attrs, `color:${color}`);

  return `\
<i icon="${escapeHtml(content)}"${stringifyAttrs(attrs)}>\
</i>`;
};

/**
 * Render for [iconify-icon](https://iconify.design/docs/iconify-icon/)
 *
 * 为 [iconify-icon](https://iconify.design/docs/iconify-icon/) 提供的渲染器
 *
 * @param icon - Icon string / 图标字符串
 * @returns Rendered icon content / 渲染后的图标内容
 */
export const iconifyRender = (icon: string): string => {
  const { attrs, content, size, color } = extractInfo({ content: icon });

  if (size) appendStyle(attrs, `font-size:${size}`);

  if (color) appendStyle(attrs, `color:${color}`);

  return `<iconify-icon icon="${escapeHtml(content)}"${stringifyAttrs(attrs)}></iconify-icon>`;
};

/**
 * Fontawesome families short aliases
 *
 * Fontawesome 字体族的简写别名
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
 *
 * Fontawesome 样式的简写别名
 */
export const FONTAWESOME_STYLES_SHORT_ALIAS: string[] = [
  // pro only
  "fad",
  "fass",
  "fasr",
];

/**
 * Fontawesome short aliases
 *
 * Fontawesome 的简写别名
 */
export const FONTAWESOME_SHORT_ALIAS: string[] = [
  ...FONTAWESOME_FAMILY_SHORT_ALIAS,
  ...FONTAWESOME_STYLES_SHORT_ALIAS,
];

/**
 * Fontawesome families classes
 *
 * Fontawesome 字体族的 class
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
 *
 * Fontawesome 样式的 class
 */
export const FONTAWESOME_STYLES: string[] = [
  ...FONTAWESOME_STYLES_SHORT_ALIAS,
  "fa-duotone",
  "fa-sharp",
  "fa-sharp-duotone",
];

/**
 * All fontawesome families and styles classes
 *
 * 所有 Fontawesome 字体族与样式的 class
 */
export const FONTAWESOME_FAMILIES_AND_STYLES: string[] = [
  ...FONTAWESOME_FAMILIES,
  ...FONTAWESOME_STYLES,
];

/**
 * Check if a class is a valid fontawesome short alias
 *
 * 检查 class 是否是有效的 Fontawesome 简写别名
 *
 * @param cls - Class string / class 字符串
 * @returns Whether the class is a fontawesome short alias / 该 class 是否是 Fontawesome 简写别名
 */
export const isFontawesomeShortAlias = (cls: string): boolean =>
  FONTAWESOME_SHORT_ALIAS.includes(cls);

/**
 * Check if a class is a valid fontawesome family
 *
 * 检查 class 是否是有效的 Fontawesome 字体族
 *
 * @param cls - Class string / class 字符串
 * @returns Whether the class is a fontawesome family / 该 class 是否是 Fontawesome 字体族
 */
export const isFontawesomeFamily = (cls: string): boolean => FONTAWESOME_FAMILIES.includes(cls);

/**
 * Ensure every class is prefixed with `fa-` or a valid short alias
 *
 * 确保每个 class 都带有 `fa-` 前缀，或者本身就是有效的简写别名
 *
 * @param icon - Icon class string / 图标 class 字符串
 * @returns Prefixed icon class string / 添加前缀后的图标 class 字符串
 */
export const appendFontawesomePrefix = (icon: string): string =>
  icon.startsWith("fa-") || isFontawesomeShortAlias(icon) ? icon : `fa-${icon}`;

/**
 * Render for [fontawesome](https://fontawesome.com/) icons
 *
 * 为 [fontawesome](https://fontawesome.com/) 图标提供的渲染器
 *
 * @param icon - Icon string / 图标字符串
 * @returns Rendered icon content / 渲染后的图标内容
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
<i class="${escapeHtml(finalClasses.join(" "))}"${stringifyAttrs(attrs)}></i>\
`;
};

/**
 * Render for [iconfont](https://www.iconfont.cn/) icons
 *
 * 为 [iconfont](https://www.iconfont.cn/) 图标提供的渲染器
 *
 * @param icon - Icon string / 图标字符串
 * @returns Rendered icon content / 渲染后的图标内容
 */
export const iconfontRender = (icon: string): string => {
  const { attrs, content, size, color } = extractInfo({ content: icon });

  if (size) appendStyle(attrs, `font-size:${size}`);

  if (color) appendStyle(attrs, `color:${color}`);

  // add `iconfont` class and `icon-` prefix for first class
  return `<span class="iconfont icon-${escapeHtml(content)}"${stringifyAttrs(attrs)}></span>`;
};
