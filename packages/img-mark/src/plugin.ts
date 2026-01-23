import type { PluginWithOptions } from "markdown-it";

import type { MarkdownItImgMarkOptions } from "./options.js";

const ID_SUFFIX_REGEX = /#(.*?)$/;

export const imgMark: PluginWithOptions<MarkdownItImgMarkOptions> = (
  md,
  { light = ["light"], dark = ["dark"] } = {},
): void => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const originalImageRender = md.renderer.rules.image!;

  const lightIds = light.map((item) => `#${item}`);
  const darkIds = dark.map((item) => `#${item}`);

  md.renderer.rules.image = (tokens, index, options, env, self): string => {
    const token = tokens[index];
    const src = token.attrGet("src");

    if (src) {
      if (lightIds.some((item) => src.endsWith(item))) {
        token.attrSet("data-mode", "lightmode-only");
        token.attrSet("src", src.replace(ID_SUFFIX_REGEX, ""));
      } else if (darkIds.some((item) => src.endsWith(item))) {
        token.attrSet("data-mode", "darkmode-only");
        token.attrSet("src", src.replace(ID_SUFFIX_REGEX, ""));
      }
    }

    return originalImageRender(tokens, index, options, env, self);
  };
};
