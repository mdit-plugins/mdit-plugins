import type { LiteElement } from "@mathjax/src/js/adaptors/lite/Element.js";
import type { LiteAdaptor } from "@mathjax/src/js/adaptors/liteAdaptor.js";
import type { TeX } from "@mathjax/src/js/input/tex.js";
import type { CHTML } from "@mathjax/src/js/output/chtml.js";
import type { SVG } from "@mathjax/src/js/output/svg.js";
import type { MarkdownItTexOptions } from "@mdit/plugin-tex";

import type {
  MathJaxTexInputOptions,
  MathjaxCommonHTMLOutputOptions,
  MathjaxSVGOutputOptions,
} from "./mathjax.js";

export type TeXTransformer = (content: string, displayMode: boolean) => string;

export interface MarkdownItMathjaxOptions extends Pick<
  MarkdownItTexOptions,
  "allowInlineWithSpace" | "delimiters" | "mathFence"
> {
  /**
   * Output syntax
   *
   * 输出格式
   *
   * @default "svg"
   */

  output?: "chtml" | "svg";

  /**
   * Whether to include assistive MathML for screen readers. When disabled, math is still rendered
   * but the hidden `<mjx-assistive-mml>` output is omitted.
   *
   * 是否包含供屏幕阅读器使用的辅助 MathML。关闭后数学公式仍会渲染，但不再输出隐藏的 `<mjx-assistive-mml>`。
   *
   * @default true
   */
  a11y?: boolean;

  /**
   * TeX input options
   *
   * TeX 输入选项
   */
  tex?: MathJaxTexInputOptions;

  /**
   * Common HTML output options
   *
   * 通用 HTML 输出选项
   */
  chtml?: MathjaxCommonHTMLOutputOptions;

  /**
   * SVG output options
   *
   * SVG 输出选项
   */
  svg?: MathjaxSVGOutputOptions;

  /**
   * Transformer on output content
   *
   * 输出内容的转换器
   */
  transformer?: TeXTransformer;

  /**
   * Enable debug mode
   *
   * 启用调试模式
   *
   * @default false
   */
  debug?: boolean;
}

/**
 * Options of the asynchronous MathJax entry.
 *
 * 异步 MathJax 入口的选项。
 */
export interface MarkdownItMathjaxAsyncOptions extends MarkdownItMathjaxOptions {
  /**
   * Custom loader for the asynchronous files requested by MathJax.
   *
   * By default the dynamic font files of the bundled font are imported with static specifiers, so
   * browser bundlers can split and resolve them. Set this option when you use a custom `fontData`
   * or want to load the files from another location.
   *
   * MathJax stores the loader on its shared MathJax instance, so the last created instance wins for
   * lazy requests made after creation. Disable `preloadDynamicFonts` if you need to control loading
   * yourself.
   *
   * 自定义 MathJax 请求的异步文件的加载器。
   *
   * 默认情况下，内置字体的动态字体文件使用静态说明符导入，以便浏览器打包器拆分并解析。使用自定义 `fontData` 或希望从其他位置加载文件时设置此项。
   *
   * MathJax 将加载器保存在共享的 MathJax 实例上，因此创建实例后发生的懒加载请求会使用最后创建的实例的加载器。若需要自行控制加载，请关闭
   * `preloadDynamicFonts`。
   *
   * @param file - File name or specifier requested by MathJax / MathJax 请求的文件名或说明符
   * @returns The loaded module / 加载的模块
   */
  asyncLoad?: (file: string) => Promise<unknown>;

  /**
   * Whether to preload the dynamic font files of the selected output when the instance is created.
   *
   * Preloading keeps `render()` synchronous for dynamic glyphs such as `\mathbb`. Disable it when
   * you provide a custom `asyncLoad` and want to load the files yourself; until they are loaded,
   * rendering such glyphs throws MathJax's retry error.
   *
   * 是否在创建实例时预加载所选输出的动态字体文件。
   *
   * 预加载能让 `render()` 同步渲染 `\mathbb` 等动态字形。使用自定义 `asyncLoad` 并希望自行加载时关闭此项；在文件加载完成前，渲染这些字形会抛出 MathJax
   * 的重试错误。
   *
   * @default true
   */
  preloadDynamicFonts?: boolean;
}

/**
 * Mathjax document options
 *
 * Mathjax 文档选项
 */
export interface DocumentOptions {
  /** Input jax / 输入 jax */
  InputJax: TeX<LiteElement, string, HTMLElement>;

  /** Output jax / 输出 jax */
  OutputJax: CHTML<LiteElement, string, HTMLElement> | SVG<LiteElement, string, HTMLElement>;

  /** Whether to enable assistive MML / 是否启用辅助 MML */
  enableAssistiveMml: boolean;
}

/** Mathjax instance common options / Mathjax 实例通用选项 */
export interface MathjaxInstance<Sync extends boolean = false> extends Required<
  Pick<MarkdownItMathjaxOptions, "allowInlineWithSpace" | "delimiters" | "mathFence">
> {
  /** Mathjax adaptor / Mathjax 适配器 */
  adaptor: LiteAdaptor;

  /** Mathjax document options / Mathjax 文档选项 */
  documentOptions: DocumentOptions;

  /**
   * Output style for rendered content; clears the style cache afterwards
   *
   * 已渲染内容的输出样式，返回后会清空样式缓存
   *
   * @returns Style content / 样式内容
   */
  outputStyle: () => Sync extends true ? string : Promise<string>;

  /** Render one formula synchronously / 同步渲染单个公式 */
  render: (content: string, displayMode: boolean) => string;

  /** Reset tex (including labels) / 重置 TeX（包含标签） */
  reset: () => void;

  /** Clear the style cache and reset both input and output jax / 清除样式缓存并重置输入与输出 jax */
  clearStyle: () => void;

  /** Output content transformer / 输出内容转换器 */
  transformer: TeXTransformer | null;
}
