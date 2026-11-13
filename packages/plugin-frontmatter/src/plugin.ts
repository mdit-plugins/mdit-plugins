/**
 * Forked and modified from
 * https://github.com/mdit-vue/mdit-vue/blob/main/packages/plugin-frontmatter/src/index.ts
 */

import { hasRule } from "@mdit/helper";
import type { CoreRule, PluginWithOptions } from "@mdit/helper";
import type { StateCore } from "markdown-it";

import type { MarkdownItFrontmatterOptions } from "./options.js";
import { parseFrontmatter } from "./parse.js";

const RULE_NAME = "md_frontmatter";
const EXCERPT_FLAG = Symbol("md-frontmatter-excerpt");

/**
 * Frontmatter plugin
 *
 * Extracts frontmatter and an optional excerpt before the Markdown is parsed, then exposes them as
 * `env.content`, `env.frontmatter` and `env.excerpt`.
 *
 * Frontmatter 插件
 *
 * 在解析 Markdown 之前提取 frontmatter 与可选摘要，并暴露为 `env.content`、`env.frontmatter` 与 `env.excerpt`。
 *
 * @example
 *   ```ts
 *   import MarkdownIt from "markdown-it";
 *   import { frontmatter } from "@mdit/plugin-frontmatter";
 *
 *   const md = new MarkdownIt().use(frontmatter);
 *   ```;
 *
 * @param md - MarkdownIt instance / MarkdownIt 实例
 * @param options - Plugin options / 插件选项
 */
export const frontmatter: PluginWithOptions<MarkdownItFrontmatterOptions> = (md, options = {}) => {
  // A second installation must not strip the same source twice.
  if (hasRule(md, RULE_NAME, "core")) return;

  const { renderExcerpt = true } = options;

  const rule: CoreRule = (state: StateCore): void => {
    // `parseInline` runs the core chain too, and inline callers often reuse the page env.
    if (state.inlineMode) return;

    state.env ??= {};

    if (state.env[EXCERPT_FLAG] === true) return;

    const { data, content, excerpt } = parseFrontmatter(state.src, options);

    state.env.content = content;
    state.env.frontmatter = { ...state.env.frontmatter, ...data };
    state.env.excerpt =
      renderExcerpt && excerpt
        ? md.render(excerpt, { ...state.env, [EXCERPT_FLAG]: true })
        : excerpt;
    state.src = content;
  };

  md.core.ruler.before("normalize", RULE_NAME, rule);
};
