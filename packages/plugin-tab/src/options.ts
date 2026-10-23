import type { Env, MarkdownItOptions, RendererRule, Renderer, Token } from "markdown-it";

export interface MarkdownItTabData {
  /**
   * Title of tab
   *
   * Tab 标题
   */
  title: string;

  /**
   * Tab index
   *
   * Tab 索引
   */
  index: number;

  /**
   * Identifier of tab
   *
   * Tab 标识符
   */
  id: string | undefined;

  /**
   * Whether the tab is active
   *
   * Tab 是否激活
   */
  isActive: boolean;
}

export interface MarkdownItTabInfo {
  /**
   * Identifier of tab container
   *
   * Tab 容器标识符
   */
  id: string | undefined;

  /**
   * Which tab is active
   *
   * 当前激活的 Tab
   *
   * `-1` means no tab is active.
   *
   * `-1` 表示没有 Tab 激活。
   */
  active: number;

  /**
   * Data of tabs
   *
   * Tab 数据
   */
  data: MarkdownItTabData[];
}

// oxlint-disable-next-line max-params
export type TabsOpenRenderer = (
  info: MarkdownItTabInfo,
  tokens: Token[],
  index: number,
  options: Required<MarkdownItOptions>,
  env: Env | undefined,
  self: Renderer,
) => string;

// oxlint-disable-next-line max-params
export type TabOpenRenderer = (
  data: MarkdownItTabData,
  tokens: Token[],
  index: number,
  options: Required<MarkdownItOptions>,
  env: Env | undefined,
  self: Renderer,
) => string;

export interface MarkdownItTabOptions {
  /**
   * The name of the tab container.
   *
   * Tab 容器的名称。
   */
  name: string;

  /**
   * Tabs open renderer
   *
   * 选项卡容器打开渲染函数
   */
  openRenderer?: TabsOpenRenderer;

  /**
   * Tabs close renderer
   *
   * 选项卡容器结束渲染函数
   */
  closeRenderer?: RendererRule;

  /**
   * Tab open renderer
   *
   * 选项卡打开渲染函数
   */
  tabOpenRenderer?: TabOpenRenderer;

  /**
   * Tab close renderer
   *
   * 选项卡结束渲染函数
   */
  tabCloseRenderer?: RendererRule;
}
