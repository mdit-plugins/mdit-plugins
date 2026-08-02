import type { PluginWithOptions } from "markdown-it";

import type { MarkdownItImgMarkOptions } from "./options.js";

export const imgMark: PluginWithOptions<MarkdownItImgMarkOptions> = (
  md,
  { light = ["light"], dark = ["dark"] } = {},
): void => {
  // oxlint-disable-next-line typescript/no-non-null-assertion
  const originalImageRender = md.renderer.rules.image!;

  const lightIds = light.map((item) => `#${item}`);
  const darkIds = dark.map((item) => `#${item}`);

  md.renderer.rules.image = (tokens, index, options, env, self): string => {
    const token = tokens[index];
    const src = token.attrGet("src");

    if (src) {
      // strip only the matched marker suffix so a pre-existing url fragment is
      // preserved (e.g. `/a#frag#light` -> `/a#frag`)
      const lightItem = lightIds.find((item) => src.endsWith(item));

      if (lightItem) {
        token.attrSet("data-mode", "lightmode-only");
        token.attrSet("src", src.slice(0, -lightItem.length));
      } else {
        const darkItem = darkIds.find((item) => src.endsWith(item));

        if (darkItem) {
          token.attrSet("data-mode", "darkmode-only");
          token.attrSet("src", src.slice(0, -darkItem.length));
        }
      }
    }

    return originalImageRender(tokens, index, options, env, self);
  };
};
