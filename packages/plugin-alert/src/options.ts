import type { RendererRule } from "markdown-it";

export interface MarkdownItAlertOptions {
  /**
   * Allowed alert names
   *
   * 允许的警告名称
   *
   * @default ["important", "note", "tip", "warning", "caution"]
   */
  alertNames?: string[];

  /**
   * Whether handle deep alert syntax
   *
   * 是否允许深层的警告语法
   *
   * @default false
   */
  deep?: boolean;

  /**
   * Hint opening tag render function
   *
   * 提示开始标签渲染函数
   */
  openRenderer?: RendererRule;

  /**
   * Hint closing tag render function
   *
   * 提示结束标签渲染函数
   */
  closeRenderer?: RendererRule;

  /**
   * Hint title render function
   *
   * 提示标题渲染函数
   */
  titleRenderer?: RendererRule;
}
