import type { RenderRule } from "markdown-it/lib/renderer.mjs";

export const emojiRender: RenderRule = (tokens, idx) => tokens[idx].content;
