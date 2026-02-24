import { isSpace } from "markdown-it/lib/common/utils.mjs";
import type { FieldAttr, FieldAttrInfo } from "./options.js";

export interface AttrInfo {
  display: string;
  boolean?: boolean;
  index: number;
}

export type AllowedAttributes = Map<string, AttrInfo>;

export const ucFirst = (str: string): string => (str ? str[0].toUpperCase() + str.slice(1) : "");

export const normalizeAttributes = (allowedAttributes?: FieldAttr[]): AllowedAttributes | null => {
  if (!allowedAttributes) return null;

  const map: AllowedAttributes = new Map();

  allowedAttributes.forEach((item, index) => {
    map.set(item.attr, {
      display: item.name ?? ucFirst(item.attr),
      boolean: item.boolean ?? false,
      index,
    });
  });

  return map;
};

export const parseAttributes = (
  content: string,
  allowedAttributes: AllowedAttributes | null = null,
): FieldAttrInfo[] => {
  const attrs: Record<string, string | true> = {};
  const length = content.length;
  let pos = 0;

  while (pos < length) {
    let charCode = content.charCodeAt(pos);

    // skip spaces
    if (isSpace(charCode)) {
      pos++;
      continue;
    }

    // parse key
    const keyStart = pos;

    while (pos < length) {
      charCode = content.charCodeAt(pos);

      if (isSpace(charCode) || charCode === 61 /* = */) break;
      pos++;
    }
    const key = content.slice(keyStart, pos);

    if (!key) break;

    // check =
    if (pos < length && content.charCodeAt(pos) === 61 /* = */) {
      pos++; // skip =

      if (pos >= length) break; // trailing =

      const quote = content.charCodeAt(pos);

      if (quote === 34 /* " */ || quote === 39 /* ' */) {
        pos++; // skip quote
        let val = "";
        let valLast = pos;

        while (pos < length) {
          charCode = content.charCodeAt(pos);

          if (charCode === 92 /* \ */) {
            // escaped char
            val += content.slice(valLast, pos);

            // oxlint-disable-next-line max-depth
            if (pos + 1 < length) {
              val += content[pos + 1];
              pos += 2;
            } else {
              val += "\\";
              pos++;
            }
            valLast = pos;
          } else if (charCode === quote) {
            break;
          } else {
            pos++;
          }
        }

        val += content.slice(valLast, pos);
        attrs[key] = val;

        if (pos < length) pos++; // skip closing quote
      } else {
        // unquoted value
        const valStart = pos;

        while (pos < length) {
          charCode = content.charCodeAt(pos);

          if (charCode === 32 || charCode === 9 || charCode === 10 || charCode === 13) break;
          pos++;
        }
        attrs[key] = content.slice(valStart, pos);
      }
    } else {
      // boolean
      attrs[key] = true;
    }
  }

  if (!allowedAttributes) {
    return Object.entries(attrs).map(([key, value]) => ({
      attr: key,
      name: key
        .split("-")
        .map((part) => ucFirst(part))
        .join(" "),
      value,
    }));
  }

  return Object.entries(attrs)
    .filter(([key]) => allowedAttributes.has(key))
    .sort(
      (a, b) =>
        // oxlint-disable-next-line typescript/no-non-null-assertion
        allowedAttributes.get(a[0])!.index -
        // oxlint-disable-next-line typescript/no-non-null-assertion
        allowedAttributes.get(b[0])!.index,
    )
    .map(([key, value]) => {
      // oxlint-disable-next-line typescript/no-non-null-assertion
      const info = allowedAttributes.get(key)!;

      return {
        attr: key,
        name: info.display,
        value: info.boolean ? true : value,
      };
    });
};
