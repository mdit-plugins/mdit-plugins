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
   * -1 means no tab is active 激活的 Tab
   *
   * -1 表示没有 Tab 激活
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
export type TabsOpenRender = (
  info: MarkdownItTabInfo,
  tokens: Token[],
  index: number,
  options: Required<MarkdownItOptions>,
  env: Env | undefined,
  self: Renderer,
) => string;

// oxlint-disable-next-line max-params
export type TabOpenRender = (
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

  /** Tabs open render */
  openRender?: TabsOpenRender;

  /** Tabs close render */
  closeRender?: RendererRule;

  /** Tab open render */
  tabOpenRender?: TabOpenRender;

  /** Tab close render */
  tabCloseRender?: RendererRule;
}
