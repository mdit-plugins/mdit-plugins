import { AssistiveMmlHandler } from "mathjax-full/js/a11y/assistive-mml.js";
import type { LiteDocument } from "mathjax-full/js/adaptors/lite/Document.js";
import type { LiteNode } from "mathjax-full/js/adaptors/lite/Element.js";
import type { LiteText } from "mathjax-full/js/adaptors/lite/Text.js";

import type { A11yHandler } from "./typings.js";

export const a11yHandler: A11yHandler = (handler) =>
  AssistiveMmlHandler<LiteNode, LiteText, LiteDocument>(handler);
