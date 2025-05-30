import type Token from "markdown-it/lib/token.mjs";

import type { Attr } from "./types.js";

export const addAttrs = (attrs: Attr[], token: Token | null): void => {
  if (token)
    attrs.forEach((attrItem) => {
      const [key, value] = attrItem;

      if (key === "class") token.attrJoin("class", value);
      else if (key === "css-module") token.attrJoin("css-module", value);
      else token.attrPush(attrItem);
    });
};
