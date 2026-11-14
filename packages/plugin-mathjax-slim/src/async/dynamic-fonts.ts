/**
 * Shared loader helpers for the dynamic font files of `@mathjax/mathjax-newcm-font`.
 *
 * MathJax builds dynamic font file names at runtime, so a bare `import(file)` cannot be analyzed by
 * browser bundlers. The per-output loader modules contain static specifiers for every file, and
 * this module only selects a loader from the set for the current output.
 *
 * `@mathjax/mathjax-newcm-font` 动态字体文件的共享加载器。
 *
 * MathJax 在运行时拼接动态字体文件名，浏览器打包器无法分析裸 `import(file)`。按输出拆分的加载器模块为每个文件提供静态说明符，本模块只负责从当前输出的加载器中选取。
 */

/** Static loaders for one MathJax output / 单个 MathJax 输出的静态加载器 */
export interface DynamicFontLoaderSet {
  /** Output name / 输出名称 */
  output: "svg" | "chtml";

  /** Loader per dynamic file name / 每个动态文件名的加载器 */
  loaders: Record<string, () => Promise<unknown>>;
}

const DYNAMIC_FONT_FILE_RE =
  /^@mathjax\/mathjax-newcm-font\/js\/(?<output>svg|chtml)\/dynamic\/(?<name>[^/]+)\.js$/;

/**
 * Load an asynchronous file requested by MathJax.
 *
 * Dynamic font files of the bundled font use the static loaders of the current output. Other files
 * fall back to a runtime import, which Node.js resolves directly and browser bundlers can ignore.
 * When that import fails, the error explains that the file is not part of the bundled font files.
 *
 * 加载 MathJax 请求的异步文件。
 *
 * 内置字体的动态字体文件使用当前输出的静态加载器。其他文件回退到运行时导入，由 Node.js 直接解析，浏览器打包器可以忽略。运行时导入失败时，错误信息会说明该文件不属于已打包的字体文件。
 *
 * @param file - File name or specifier requested by MathJax / MathJax 请求的文件名或说明符
 * @param fontLoaders - Static loaders of the selected output / 所选输出的静态加载器
 * @returns The loaded module / 加载的模块
 */
export const loadMathJaxFile = async (
  file: string,
  fontLoaders: DynamicFontLoaderSet,
): Promise<unknown> => {
  const match = DYNAMIC_FONT_FILE_RE.exec(file);
  const loader =
    match?.groups && match.groups.output === fontLoaders.output
      ? fontLoaders.loaders[match.groups.name]
      : null;

  if (loader) return loader();

  try {
    return await import(/* @vite-ignore */ /* webpackIgnore: true */ file);
  } catch (err) {
    throw new Error(
      `[@mdit/plugin-mathjax] cannot load "${file}": it is not part of the bundled dynamic font files. Install @mathjax/mathjax-newcm-font@4.1.3 or pass the asyncLoad option to load it yourself.`,
      { cause: err },
    );
  }
};
