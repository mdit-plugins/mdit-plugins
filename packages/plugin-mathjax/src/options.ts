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

  /**
   * Custom loader for the asynchronous files requested by MathJax.
   *
   * By default, Node.js imports the files from `@mathjax/mathjax-newcm-font`, while browsers load
   * the font class and its dynamic files from unpkg. The font class uses the running MathJax
   * version; unpkg rewrites its internal `@mathjax/src` imports to `@latest`, so the plugin
   * resolves that redirect and imports the same runtime module. The browser runtime can therefore
   * differ from the version installed in your project. Set this option to load files from another
   * location. The loader must use the same font-class copy that is used as `fontData`, because
   * MathJax installs glyphs on that class.
   *
   * MathJax's `asyncLoad` is process-global: when multiple async instances use different loaders,
   * the last created instance wins. Only used by the async entry.
   *
   * 自定义 MathJax 请求的异步文件的加载器。
   *
   * 默认情况下，Node.js 从 `@mathjax/mathjax-newcm-font` 导入文件，浏览器则从 unpkg 加载字体类及其动态文件。字体类使用当前 MathJax
   * 版本；unpkg 会把字体包自身的 `@mathjax/src` 导入重写为 `@latest`，插件会解析该重定向并导入同一个运行时模块。因此浏览器运行时可能与项目安装的版本不同。
   * 设置此项可从其他位置加载文件。加载器必须使用作为 `fontData` 的同一个字体类副本，因为 MathJax 会把字形安装到该类上。
   *
   * MathJax 的 `asyncLoad` 是进程级全局设置：多个异步实例使用不同加载器时，最后创建的实例会覆盖之前的值。仅异步入口使用。
   *
   * @param file - File name or specifier requested by MathJax / MathJax 请求的文件名或说明符
   * @returns The loaded module / 加载的模块
   */
  asyncLoad?: (file: string) => Promise<unknown>;
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
