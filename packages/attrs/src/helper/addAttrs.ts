import type Token from "markdown-it/lib/token.mjs";

import type { Attr } from "./types.js";

export const addAttrs = (attrs: Attr[], token: Token | null): void => {
  if (!token) return;

  attrs.forEach(([key, value]) => {
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
