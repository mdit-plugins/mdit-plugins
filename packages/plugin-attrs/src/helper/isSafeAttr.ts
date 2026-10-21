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
