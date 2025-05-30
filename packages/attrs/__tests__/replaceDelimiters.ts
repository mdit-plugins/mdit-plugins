import type { MarkdownItAttrsOptions } from "../src/index.js";

export const replaceDelimiters = (
  text: string,
  options: Required<MarkdownItAttrsOptions>,
): string => text.replace(/{/g, options.left).replace(/}/g, options.right);
