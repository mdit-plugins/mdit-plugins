import type { RenderRule } from "markdown-it/lib/renderer.mjs";

export interface MarkdownItPreviewOptions {
  /**
   * Preview open renderer
   */
  previewOpenRenderer?: RenderRule;

  /**
   * Preview close renderer
   */
  previewCloseRenderer?: RenderRule;

  /**
   * code renderer
   */
  codeRenderer?: RenderRule;
}
