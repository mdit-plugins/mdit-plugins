import type { RenderRule } from "markdown-it/lib/renderer.js";

export interface MarkdownItContainerOptions {
  /** container name */
  name: string;
  /** container marker */
  marker?: string;
  /** validate whether this should be regarded as a container */
  validate?: (params: string, markup: string) => boolean;
  /** open tag render function */
  openRender?: RenderRule;
  /** close tag render function */
  closeRender?: RenderRule;
}
