import type Token from "markdown-it/lib/token.mjs";

import { getAttrs } from "./getAttrs.js";
import type { DelimiterRange } from "../rules/types.js";

export const addAttrs = (
  token: Token | null,
  content: string,
  range: DelimiterRange,
  allowed: (string | RegExp)[],
): void => {
  if (!token) return;

  getAttrs(content, range, allowed).forEach(([key, value]) => {
    switch (key) {
      case "class":
        token.attrJoin("class", value);
        break;
      case "css-module":
        token.attrJoin("css-module", value);
        break;
      default:
        token.attrPush([key, value]);
    }
  });
};
