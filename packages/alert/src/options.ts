import { type RenderRule } from "markdown-it/lib/renderer.js";

export interface MarkdownItAlertOptions {
  /**
   * Allowed alert names
   *
   * 允许的警告名称
   *
   * @default ['important', 'note', 'tip', 'warning', 'caution']
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
  openRender?: RenderRule;

  /**
   * Hint closing tag render function
   *
   * 提示结束标签渲染函数
   */
  closeRender?: RenderRule;

  /**
   * Hint title render function
   *
   * 提示标题渲染函数
   */
  titleRender?: RenderRule;
}
