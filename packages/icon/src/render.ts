import { appendStyle, extractColor, extractSize, parseAttrs } from "./utils.js";

export const defaultRender = (content: string): string =>
  `<i class="${content}"></i>`;

export const iconifyRender = (content: string): string => {
  const result = extractColor(extractSize({ content }));

  const { attrs, classes } = parseAttrs(result.content);

  if (result.size) appendStyle(attrs, `font-size:${result.size}`);

  if (result.color) appendStyle(attrs, `color:${result.color}`);

  const attrEntries = Object.entries(attrs);

  return `<iconify-icon icon="${classes.join(" ")}"${
    attrEntries.length
      ? ` ${attrEntries.map(([key, value]) => `${key}="${value}"`).join("")}`
      : ""
  }></iconify-icon>`;
};

export const FONTAWESOME_FAMILY_SHORT_ALIAS = [
  // free
  "fas",
  "fab",

  // part of pro
  "far",

  // pro only
  "fal",
  "fat",
];

export const FONTAWESOME_STYLES_SHORT_ALIAS = [
  // pro only
  "fad",
  "fass",
  "fasr",
];

export const FONTAWESOME_SHORT_ALIAS = [
  ...FONTAWESOME_FAMILY_SHORT_ALIAS,
  ...FONTAWESOME_STYLES_SHORT_ALIAS,
];

export const FONTAWESOME_FAMILIES = [
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

export const FONTAWESOME_STYLES = [
  ...FONTAWESOME_STYLES_SHORT_ALIAS,
  "fa-duotone",
  "fa-sharp",
  "fa-sharp-duotone",
];

export const FONTAWESOME_FAMILIES_AND_STYLES = [
  ...FONTAWESOME_FAMILIES,
  ...FONTAWESOME_STYLES,
];

export const isFontawesomeShortAlias = (cls: string): boolean =>
  FONTAWESOME_SHORT_ALIAS.includes(cls);

export const isFontawesomeFamily = (cls: string): boolean =>
  FONTAWESOME_FAMILIES.includes(cls);

export const appendFontawesomePrefix = (icon: string): string =>
  icon.startsWith("fa-") || isFontawesomeShortAlias(icon) ? icon : `fa-${icon}`;

export const fontawesomeRender = (content: string): string => {
  const result = extractColor(extractSize({ content }));

  const { attrs, classes } = parseAttrs(result.content);

  if (result.size) appendStyle(attrs, `font-size:${result.size}`);
  if (result.color) appendStyle(attrs, `color:${result.color}`);

  const attrEntries = Object.entries(attrs);

  const finalClasses: string[] = [];
  const iconNameIndex = classes.findIndex((cls) => cls.includes(":"));

  // a icon name with explicit family (possibly with style) not found
  if (iconNameIndex === -1) {
    finalClasses.push(...classes.map(appendFontawesomePrefix));

    // if no family is specified, default to solid
    if (finalClasses.every((cls) => !isFontawesomeFamily(cls))) {
      finalClasses.push("fa-solid");
    }
  } else {
    // get explicit icon name and it's family
    const [iconName] = classes.splice(iconNameIndex, 1);

    const [type, name] = iconName.split(":", 2);

    finalClasses.push(
      type.length <= 2 ? `fa${type}` : appendFontawesomePrefix(type),
      appendFontawesomePrefix(name),
      ...classes.map(appendFontawesomePrefix),
    );
  }

  return `<i class="${finalClasses.join(" ")}"${
    attrEntries.length
      ? ` ${attrEntries.map(([key, value]) => `${key}="${value}"`).join("")}`
      : ""
  }></i>`;
};
