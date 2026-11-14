import type { DynamicFontLoaderSet } from "./dynamic-fonts.js";

/**
 * Load the static loader set for a MathJax output.
 *
 * The two sets live in separate modules so an output-specific async entry can import only one of
 * them; the default async entry loads the set that matches the `output` option at runtime.
 *
 * 加载某个 MathJax 输出的静态加载器集合。
 *
 * 两个集合位于不同模块，按输出区分的异步入口只导入其中一个；默认异步入口在运行时加载与 `output` 选项匹配的集合。
 *
 * @param output - MathJax output / MathJax 输出
 * @returns Static loaders for the output / 该输出的静态加载器
 */
export const loadDynamicFontLoaders = async (
  output: "svg" | "chtml",
): Promise<DynamicFontLoaderSet> =>
  output === "chtml"
    ? (await import("./dynamic-fonts-chtml.js")).dynamicFontLoaders
    : (await import("./dynamic-fonts-svg.js")).dynamicFontLoaders;
