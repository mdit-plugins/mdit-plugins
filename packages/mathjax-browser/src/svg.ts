import type { LiteElement } from "mathjax-full/js/adaptors/lite/Element.js";
import { SVG } from "mathjax-full/js/output/svg.js";

import type { SVGLoader } from "./typings.js";

export const svg: SVGLoader = (svgOptions = {}) =>
  new SVG<LiteElement, string, HTMLElement>({
    fontCache: "none",
    ...svgOptions,
  });
