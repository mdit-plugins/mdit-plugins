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
