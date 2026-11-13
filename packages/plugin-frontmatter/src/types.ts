/**
 * Forked and modified from
 * https://github.com/mdit-vue/mdit-vue/blob/main/packages/plugin-frontmatter/src/types.ts
 */

import type { Env } from "markdown-it";

declare module "markdown-it" {
  interface Env {
    /**
     * Markdown content with the frontmatter block removed
     *
     * 移除 frontmatter 块后的 Markdown 内容
     */
    content?: string;

    /**
     * Extracted excerpt
     *
     * 提取的摘要
     */
    excerpt?: string;

    /**
     * Parsed frontmatter data
     *
     * 解析后的 frontmatter 数据
     */
    frontmatter?: Record<string, unknown>;
  }
}

/**
 * MarkdownIt environment with frontmatter fields
 *
 * 包含 frontmatter 字段的 MarkdownIt 环境
 */
export type FrontmatterEnv = Env;
