import {
  CLASS_MARKER,
  ID_MARKER,
  KEY_SEPARATOR,
  PAIR_SEPARATOR,
  QUOTE_MARKER,
} from "./constants.js";
import type { Attr } from "./types.js";
import type { DelimiterRange } from "../rules/types.js";

const isAllowedKeyChar = (charCode: number): boolean =>
  !(
    charCode === 9 /* \t */ ||
    charCode === 10 /* \n */ ||
    charCode === 12 /* \f */ ||
    charCode === 32 /* 空格 */ ||
    charCode === 47 /* / */ ||
    charCode === 62 /* > */ ||
    charCode === 34 /* " */ ||
    charCode === 39 /* ' */ ||
    charCode === 61 /* = */
  );

export const getAttrs = (
  str: string,
  range: DelimiterRange,
  allowed: (string | RegExp)[],
): Attr[] => {
  let key = "";
  let value = "";
  let parsingKey = true;
  let valueInsideQuotes = false;

  const attrs: Attr[] = [];

  // read inside marker
  // start + left delimiter length to avoid beginning marker
  // breaks when ending marker is found or end of string
  for (let index = range[0]; index < range[1]; index++) {
    const charCode = str.charCodeAt(index);

    // switch to reading value if equal sign
    if (charCode === KEY_SEPARATOR && parsingKey) {
      parsingKey = false;
      continue;
    }

    // {.class} {..css-module}
    if (charCode === CLASS_MARKER && key === "") {
      if (str.charCodeAt(index + 1) === CLASS_MARKER) {
        key = "css-module";
        index++;
      } else {
        key = "class";
      }

      parsingKey = false;
      continue;
    }

    // {#id}
    if (charCode === ID_MARKER && key === "") {
      key = "id";
      parsingKey = false;
      continue;
    }

    // {value="inside quotes"}
    if (charCode === QUOTE_MARKER && value === "" && !valueInsideQuotes) {
      valueInsideQuotes = true;
      continue;
    }

    if (charCode === QUOTE_MARKER && valueInsideQuotes) {
      valueInsideQuotes = false;
      continue;
    }

    // read next key/value pair
    if (charCode === PAIR_SEPARATOR && !valueInsideQuotes) {
      if (key === "")
        // beginning or ending space: { .red } vs {.red}
        continue;

      attrs.push([key, value]);
      key = "";
      value = "";
      parsingKey = true;

      continue;
    }

    // continue if character not allowed
    if (parsingKey && !isAllowedKeyChar(charCode)) continue;

    // no other conditions met; append to key/value
    if (parsingKey) {
      key += String.fromCharCode(charCode);
      continue;
    }

    value += String.fromCharCode(charCode);
  }

  // append last key/value pair
  if (key !== "") attrs.push([key, value]);

  return allowed.length
    ? attrs.filter(([attr]) =>
        allowed.some((item) =>
          item instanceof RegExp ? item.test(attr) : item === attr,
        ),
      )
    : attrs;
};
