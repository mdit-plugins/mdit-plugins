import type { LiteElement } from "mathjax-full/js/adaptors/lite/Element.js";
import { CHTML } from "mathjax-full/js/output/chtml.js";

import type { CHTMLLoader } from "./typings.js";

export const chtml: CHTMLLoader = (chtmlOptions = {}) =>
  new CHTML<LiteElement, string, HTMLElement>({
    fontURL:
      "https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/output/chtml/fonts/woff-v2",
    adaptiveCSS: true,
    ...chtmlOptions,
  });
