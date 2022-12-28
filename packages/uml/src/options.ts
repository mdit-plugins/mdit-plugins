import type { RenderRule } from "markdown-it/lib/renderer.js";

export interface MarkdownItUMLOptions {
  /** name */
  name: string;
  /** open marker */
  open: string;
  /** close marker */
  close: string;
  /** render function */
  render: RenderRule;
}
