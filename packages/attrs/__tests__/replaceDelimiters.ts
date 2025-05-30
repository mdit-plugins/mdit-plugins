import type { DelimiterConfig } from "../src/helper/types.js";

export const replaceDelimiters = (
  text: string,
  options: Required<DelimiterConfig>,
): string => text.replace(/{/g, options.left).replace(/}/g, options.right);
