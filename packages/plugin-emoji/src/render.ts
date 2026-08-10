import type { RendererRule } from "markdown-it";

export const emojiRender: RendererRule = (tokens, idx) => tokens[idx].content;
