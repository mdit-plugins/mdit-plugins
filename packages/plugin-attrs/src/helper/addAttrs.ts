import type Token from "markdown-it/lib/token.mjs";

import type { DelimiterRange } from "../rules/types.js";
import { getAttrs } from "./getAttrs.js";
import type { AttrFilter } from "./types.js";

export const addAttrs = (
  token: Token | null,
  content: string,
  range: DelimiterRange,
  filter: AttrFilter | null,
): void => {
  if (!token) return;

  getAttrs(content, range, filter).forEach(([key, value]) => {
    switch (key) {
      case "class": {
        token.attrJoin("class", value);
        break;
      }
      case "css-module": {
        token.attrJoin("css-module", value);
        break;
      }
      default: {
        token.attrSet(key, value);
      }
    }
  });
};
