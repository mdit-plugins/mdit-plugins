import type { PluginSimple } from "markdown-it";

const OBSIDIAN_IMAGE_SIZE_REGEXP = /^(.*?)\|\s*(\d+)\s*x\s*(\d+)\s*$/;

export const obsidianImgSize: PluginSimple = (md) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const originalImageRender = md.renderer.rules.image!;

  md.renderer.rules.image = (tokens, index, options, env, self): string => {
    const token = tokens[index];

    const content = token.children?.[0]?.content;

    if (content) {
      const result = OBSIDIAN_IMAGE_SIZE_REGEXP.exec(content);

      if (result) {
        const [, realContent, width, height] = result;

        const alt = realContent.trim();
        const widthValue = Number(width);
        const heightValue = Number(height);

        // both width and height are 0
        if (!widthValue && !heightValue) {
          return originalImageRender(tokens, index, options, env, self);
        }

        token.content = alt;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        token.children![0].content = alt;
        if (widthValue) token.attrSet("width", width);
        if (heightValue) token.attrSet("height", height);
      }
    }

    return originalImageRender(tokens, index, options, env, self);
  };
};
