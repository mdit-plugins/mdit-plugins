type DynamicFontOutput = "svg" | "chtml";
type DynamicFontLoader = (file: string) => Promise<unknown>;

const DYNAMIC_FONT_OUTPUT_RE = /\/(?<output>svg|chtml)\//;
const dynamicFontLoaders = new Map<DynamicFontOutput, DynamicFontLoader>();

/**
 * Detect the output format from a dynamic font file name.
 *
 * 从动态字体文件名中识别输出格式。
 *
 * @param file - File name or specifier requested by MathJax / MathJax 请求的文件名或说明符
 * @returns The output format, or `null` when it cannot be detected / 输出格式；无法识别时返回 `null`
 */
export const getDynamicFontOutput = (file: string): DynamicFontOutput | null => {
  const output = DYNAMIC_FONT_OUTPUT_RE.exec(file)?.groups?.output;

  return output === "svg" || output === "chtml" ? output : null;
};

/**
 * Register the loader for one output format.
 *
 * 为一种输出格式注册加载器。
 *
 * MathJax exposes `asyncLoad` globally. The dispatcher uses this registry to route each requested
 * file to the loader of its own output, so SVG and CHTML instances do not overwrite each other.
 *
 * MathJax 的 `asyncLoad` 是全局的。分发器通过此注册表把每个请求文件交给对应输出格式的加载器，避免 SVG 与 CHTML 实例互相覆盖。
 *
 * @param output - Output format / 输出格式
 * @param loader - Loader for that output / 该输出格式的加载器
 */
export const registerDynamicFontLoader = (
  output: DynamicFontOutput,
  loader: DynamicFontLoader,
): void => {
  dynamicFontLoaders.set(output, loader);
};

/**
 * Clear all registered dynamic font loaders.
 *
 * 清除所有已注册的动态字体加载器。
 */
export const clearDynamicFontLoaders = (): void => {
  dynamicFontLoaders.clear();
};

/**
 * Load a dynamic font file with the loader registered for its output.
 *
 * 使用对应输出格式注册的加载器加载动态字体文件。
 *
 * @param file - File name or specifier requested by MathJax / MathJax 请求的文件名或说明符
 * @returns The loaded module / 加载的模块
 */
export const loadDynamicFontFile = (file: string): Promise<unknown> => {
  const output = getDynamicFontOutput(file);
  const loader = output ? dynamicFontLoaders.get(output) : null;

  if (!loader) {
    throw new Error(
      `[@mdit/plugin-mathjax-slim] no dynamic font loader is registered for "${file}". Create the MathJax instance before rendering dynamic glyphs.`,
    );
  }

  return loader(file);
};
