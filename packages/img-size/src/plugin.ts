/**
 * Fork and edited from https://github.com/tatsy/markdown-it-imsize/blob/master/lib/index.js
 */

import type { PluginWithOptions } from "markdown-it";

import type { ImgSizeOptions } from "./options.js";

export const imgSize: PluginWithOptions<ImgSizeOptions> = (
  md,
  { strict = false } = {},
) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const originalImageRender = md.renderer.rules.image!;

  md.renderer.rules.image = (tokens, index, options, env, self): string => {
    const token = tokens[index];

    const content = token.children?.[0]?.content;

    if (content) {
      const result = /^(.*)\|(\d*)(?:x(\d*))?$/.exec(content);

      if (result) {
        const [, realContent, width, height] = result;

        if (
          // strict mode and one of width or height is not set
          (strict && (!width || !height)) ||
          // both width and height are 0
          (width === "0" && height === "0")
        ) {
          return originalImageRender(tokens, index, options, env, self);
        }

        if (!strict || (width && height && (width !== "0" || height !== "0"))) {
          token.content = realContent;
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          token.children![0].content = realContent;
          if (width && width !== "0") token.attrSet("width", width);
          if (height && height !== "0") token.attrSet("height", height);
        }
      }
    }

    return originalImageRender(tokens, index, options, env, self);
  };
};
