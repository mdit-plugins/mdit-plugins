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
   * the font class, its dynamic files, and the MathJax runtime from unpkg. The plugin routes each
   * file to the loader registered for its SVG or CHTML output, so two async instances do not
   * overwrite each other's loader. A custom loader must return modules from the same font-class and
   * MathJax copies that are used as `fontData` and the output jax; otherwise MathJax installs
   * glyphs on a class the renderer does not use. MathJax's `asyncLoad` is still process-global, so
   * the last custom loader registered for the same output wins.
   *
   * Only used by the async entry.
   *
   * 自定义 MathJax 请求的异步文件的加载器。
   *
   * 默认情况下，Node.js 从 `@mathjax/mathjax-newcm-font` 导入文件，浏览器则从 unpkg 加载字体类、动态文件与 MathJax
   * 运行时。插件会按文件所属的 SVG 或 CHTML 输出分发到对应加载器，因此两个异步实例不会互相覆盖。自定义加载器必须返回与 `fontData` 和输出 jax 相同的字体类及
   * MathJax 副本； 否则 MathJax 会把字形安装到渲染器不使用的类上。MathJax 的 `asyncLoad` 仍是进程级全局设置，后注册的同一输出加载器会覆盖先前的值。
   *
   * 仅异步入口使用。
   *
   * @param file - File name or specifier requested by MathJax / MathJax 请求的文件名或说明符
   * @returns The loaded module / 加载的模块
   */
  asyncLoad?: (file: string) => Promise<unknown>;

  /**
   * Whether to preload all dynamic font files when the instance is created.
   *
   * `render()` is synchronous, so dynamic glyphs such as `\mathbb` fail with MathJax's retry error
   * unless their font files are already loaded. Keep this enabled unless you provide a custom
   * loader that resolves these files synchronously or you only render glyphs from preloaded font
   * groups.
   *
   * Only used by the async entry.
   *
   * 是否在创建实例时预加载所有动态字体文件。
   *
   * `render()` 是同步的，因此除非字体文件已经加载，`\mathbb` 等动态字形会触发 MathJax 的 retry
   * 错误。除非你提供了能同步解析这些文件的自定义加载器，或只渲染已预加载字体组中的字形，否则请保持开启。
   *
   * 仅异步入口使用。
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
