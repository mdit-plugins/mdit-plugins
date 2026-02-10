import type { RenderRule } from "markdown-it/lib/renderer.mjs";

const emoji_html: RenderRule = (tokens, idx) => tokens[idx].content;

export default emoji_html;
