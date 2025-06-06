import {
  ALLOWED_KEY_CHARS,
  CLASS_MARKER,
  ID_MARKER,
  KEY_SEPARATOR,
  PAIR_SEPARATOR,
} from "./constants.js";
import type { Attr, DelimiterConfig } from "./types.js";

export const getAttrs = (
  str: string,
  start: number,
  { left, right, allowed }: DelimiterConfig,
): Attr[] => {
  let key = "";
  let value = "";
  let parsingKey = true;
  let valueInsideQuotes = false;

  const attrs: Attr[] = [];

  // read inside {}
  // start + left delimiter length to avoid beginning {
  // breaks when } is found or end of string
  for (let index = start + left.length; index < str.length; index++) {
    if (str.slice(index, index + right.length) === right) {
      if (key !== "") attrs.push([key, value]);
      break;
    }

    const char = str.charAt(index);

    // switch to reading value if equal sign
    if (char === KEY_SEPARATOR && parsingKey) {
      parsingKey = false;
      continue;
    }

    // {.class} {..css-module}
    if (char === CLASS_MARKER && key === "") {
      if (str.charAt(index + 1) === CLASS_MARKER) {
        key = "css-module";
        index++;
      } else {
        key = "class";
      }

      parsingKey = false;
      continue;
    }

    // {#id}
    if (char === ID_MARKER && key === "") {
      key = "id";
      parsingKey = false;
      continue;
    }

    // {value="inside quotes"}
    if (char === '"' && value === "" && !valueInsideQuotes) {
      valueInsideQuotes = true;
      continue;
    }

    if (char === '"' && valueInsideQuotes) {
      valueInsideQuotes = false;
      continue;
    }

    // read next key/value pair
    if (char === PAIR_SEPARATOR && !valueInsideQuotes) {
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
    if (parsingKey && char.search(ALLOWED_KEY_CHARS) === -1) continue;

    // no other conditions met; append to key/value
    if (parsingKey) {
      key += char;
      continue;
    }

    value += char;
  }

  return allowed.length
    ? attrs.filter(([attr]) =>
        allowed.some((item) =>
          item instanceof RegExp ? item.test(attr) : item === attr,
        ),
      )
    : attrs;
};
