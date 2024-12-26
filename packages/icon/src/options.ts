import type { IconMeta } from "./types.js";

export interface MarkdownItIconOptions {
  /**
   * Component name
   * @default "span"
   */
  tag?: string;

  /**
   * inject attributes to the element
   */
  attrs?:
    | Record<string, string | ((meta: IconMeta) => string | undefined)>
    | ((meta: IconMeta) => [string, string][]);
}
