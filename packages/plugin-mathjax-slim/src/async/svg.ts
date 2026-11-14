import type {
  DocumentOptions,
  MarkdownItMathjaxAsyncOptions,
  MathjaxInstance,
} from "../options.js";
import { dynamicFontLoaders } from "./dynamic-fonts-svg.js";
import {
  createMathjaxInstanceWithFontLoaders,
  getDocumentOptionsWithFontLoaders,
} from "./plugin.js";

export type * from "../mathjax.js";
export type * from "../options.js";
export { mathjax } from "./plugin.js";

/**
 * Create a MathJax instance that only bundles the SVG dynamic font files.
 *
 * 创建只打包 SVG 动态字体文件的 MathJax 实例。
 *
 * @param options - MathJax options without `output` / 不含 `output` 的 MathJax 选项
 * @returns The MathJax instance / MathJax 实例
 */
export const createMathjaxInstance = async (
  options: Omit<MarkdownItMathjaxAsyncOptions, "output"> = {},
): Promise<MathjaxInstance | null> =>
  createMathjaxInstanceWithFontLoaders({ ...options, output: "svg" }, dynamicFontLoaders);

/**
 * Create SVG MathJax document options and preload its dynamic font files.
 *
 * 创建 SVG MathJax 文档选项，并预加载其动态字体文件。
 *
 * @param options - MathJax options without `output` / 不含 `output` 的 MathJax 选项
 * @returns MathJax document options / MathJax 文档选项
 */
export const getDocumentOptions = async (
  options: Omit<MarkdownItMathjaxAsyncOptions, "output"> = {},
): Promise<DocumentOptions> =>
  getDocumentOptionsWithFontLoaders({ ...options, output: "svg" }, dynamicFontLoaders);
