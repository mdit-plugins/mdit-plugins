import type { LiteDocument } from "mathjax-full/js/adaptors/lite/Document.js";
import type {
  LiteElement,
  LiteNode,
} from "mathjax-full/js/adaptors/lite/Element.js";
import type { LiteText } from "mathjax-full/js/adaptors/lite/Text.js";
import type { Handler } from "mathjax-full/js/core/Handler.js";
import type { CHTML } from "mathjax-full/js/output/chtml.js";
import type { SVG } from "mathjax-full/js/output/svg.js";

import type {
  MathjaxCommonHTMLOutputOptions,
  MathjaxSVGOutputOptions,
} from "./mathjax.js";

export type CHTMLRender = CHTML<LiteElement, string, HTMLElement>;

export type CHTMLLoader = (
  chtmlOptions?: MathjaxCommonHTMLOutputOptions,
) => CHTMLRender;

export type SVGRender = SVG<LiteElement, string, HTMLElement>;

export type SVGLoader = (svgOptions?: MathjaxSVGOutputOptions) => SVGRender;

export type A11yHandler = (
  handler: Handler<LiteNode, LiteText, LiteDocument>,
) => Handler<LiteNode, LiteText, LiteDocument>;
