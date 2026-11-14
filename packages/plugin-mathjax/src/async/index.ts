import type {
  DocumentOptions,
  MarkdownItMathjaxAsyncOptions,
  MathjaxInstance,
} from "../options.js";
import { loadDynamicFontLoaders } from "./dynamic-fonts-loaders.js";
import {
  createMathjaxInstanceWithFontLoaders,
  getDocumentOptionsWithFontLoaders,
} from "./plugin.js";

export type * from "../mathjax.js";
export type * from "../options.js";
export { mathjax } from "./plugin.js";

/**
 * Create a MathJax instance and preload the dynamic font files of the selected output.
 *
 * 创建 MathJax 实例，并预加载所选输出的动态字体文件。
 *
 * @param options - MathJax options / MathJax 选项
 * @returns The MathJax instance / MathJax 实例
 */
export const createMathjaxInstance = async (
  options: MarkdownItMathjaxAsyncOptions = {},
): Promise<MathjaxInstance | null> => {
  const fontLoaders = await loadDynamicFontLoaders(options.output ?? "svg");

  return createMathjaxInstanceWithFontLoaders(options, fontLoaders);
};

/**
 * Create the document options of the selected output and preload its dynamic font files.
 *
 * 创建所选输出的文档选项，并预加载其动态字体文件。
 *
 * @param options - MathJax options / MathJax 选项
 * @returns MathJax document options / MathJax 文档选项
 */
export const getDocumentOptions = async (
  options: MarkdownItMathjaxAsyncOptions,
): Promise<DocumentOptions> => {
  const fontLoaders = await loadDynamicFontLoaders(options.output ?? "svg");

  return getDocumentOptionsWithFontLoaders(options, fontLoaders);
};
