import type { PluginSimple } from "markdown-it";

const IMAGE_SIZE_REGEXP = /^(.*?)\s+=(\d*)\s*(?:x(\d*))?$/;

export const imgSize: PluginSimple = (md) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const originalImageRender = md.renderer.rules.image!;

  md.renderer.rules.image = (tokens, index, options, env, self): string => {
    const token = tokens[index];

    const content = token.children?.[0]?.content;

    if (content) {
      const result = IMAGE_SIZE_REGEXP.exec(content);

      if (result) {
        const [, realContent, width, height] = result;

        if (!width && !height) {
          return originalImageRender(tokens, index, options, env, self);
        }

        token.content = realContent.trim();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        token.children![0].content = realContent;
        if (width) token.attrSet("width", width);
        if (height) token.attrSet("height", height);
      }
    }

    return originalImageRender(tokens, index, options, env, self);
  };
};
