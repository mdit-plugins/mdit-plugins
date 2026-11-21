import type { MarkdownIt, StateBlock, StateCore, StateInline } from "markdown-it";

/**
 * Plugin without options.
 *
 * 无选项插件。
 *
 * @param md - MarkdownIt instance / MarkdownIt 实例
 */
export type PluginSimple = (md: MarkdownIt) => void;

/**
 * Plugin with options.
 *
 * 带选项插件。
 *
 * @param md - MarkdownIt instance / MarkdownIt 实例
 * @param options - Plugin options / 插件选项
 */
export type PluginWithOptions<T = unknown> = (md: MarkdownIt, options?: T) => void;

/**
 * Minimal structural interface shared by markdown-it and its drop-in replacements.
 *
 * Markdown-it 及其兼容替代实现共享的最小结构接口。
 *
 * @example
 *   ```ts
 *   declare const engine: MarkdownEngine;
 *   engine.render("# markdown");
 *   ```;
 */
export interface MarkdownEngine {
  /**
   * Render Markdown source into HTML.
   *
   * 将 Markdown 源文本渲染为 HTML。
   *
   * @param src - Markdown source / Markdown 源文本
   * @param env - Environment object / 环境对象
   * @returns Rendered HTML / 渲染后的 HTML
   */
  render: (src: string, env?: Record<string, unknown>) => string | Promise<string>;
}

/**
 * Plugin without options that can be installed on any markdown-it compatible engine.
 *
 * 可安装到任意 markdown-it 兼容引擎上的无选项插件。
 *
 * @example
 *   ```ts
 *   declare const plugin: UniversalPluginSimple;
 *   new MarkdownIt().use(plugin);
 *   new MarkdownExit().use(plugin);
 *   ```;
 */
export type UniversalPluginSimple = (md: MarkdownEngine) => void;

/**
 * Plugin with options that can be installed on any markdown-it compatible engine.
 *
 * 可安装到任意 markdown-it 兼容引擎上的带选项插件。
 *
 * @example
 *   ```ts
 *   declare const plugin: UniversalPluginWithOptions<{ enabled?: boolean }>;
 *   new MarkdownIt().use(plugin, { enabled: true });
 *   new MarkdownExit().use(plugin, { enabled: true });
 *   ```;
 */
export type UniversalPluginWithOptions<T = unknown> = (md: MarkdownEngine, options?: T) => void;

/**
 * Block rule.
 *
 * 块级规则。
 *
 * @param state - Block state / 块级状态
 * @param startLine - Start line / 开始行
 * @param endLine - End line / 结束行
 * @param silent - Whether the rule is in silent mode / 是否为静默模式
 * @returns Whether the rule is applied / 规则是否生效
 */
export type BlockRule = (
  state: StateBlock,
  startLine: number,
  endLine: number,
  silent: boolean,
) => boolean;

/**
 * Core rule.
 *
 * 核心规则。
 *
 * @param state - Core state / 核心状态
 */
export type CoreRule = (state: StateCore) => void;

/**
 * Inline rule.
 *
 * 行内规则。
 *
 * @param state - Inline state / 行内状态
 * @param silent - Whether the rule is in silent mode / 是否为静默模式
 * @returns Whether the rule is applied / 规则是否生效
 */
export type InlineRule = (state: StateInline, silent: boolean) => boolean;

/**
 * Token nesting level.
 *
 * Token 嵌套级别。
 */
export type Nesting = -1 | 0 | 1;

/**
 * Token metadata object.
 *
 * Token 元数据对象。
 */
export type TokenMeta = Record<string | symbol, unknown>;
