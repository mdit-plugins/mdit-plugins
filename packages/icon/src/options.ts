import type StateInline from "markdown-it/lib/rules_inline/state_inline.mjs";

export interface MarkdownItIconOptions {
  render?: (state: StateInline, info: string) => void;
}
