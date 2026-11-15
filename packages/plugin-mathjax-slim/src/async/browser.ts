import type { MathJaxNewcmFont as chtmlFontType } from "@mathjax/mathjax-newcm-font/js/chtml.js";
import type { MathJaxNewcmFont as svgFontType } from "@mathjax/mathjax-newcm-font/js/svg.js";
import type { mathjax as mathjaxType } from "@mathjax/src/js/mathjax.js";

import {
  importCdnModule,
  getCdnFontUrls,
  getFontPackageVersion,
  resolveCdnMathJaxVersion,
} from "./cdn.js";

/**
 * Font class and runtime loaded from unpkg for a browser output format.
 *
 * 浏览器输出格式从 unpkg 加载的字体类与运行时。
 */
export interface BrowserFonts {
  /** Font class used as `fontData` / 作为 `fontData` 的字体类 */
  fontData: typeof chtmlFontType | typeof svgFontType;
  /** MathJax runtime that owns `asyncLoad` / 持有 `asyncLoad` 的 MathJax 运行时 */
  mathjax: typeof mathjaxType;
  /** Installed NewCM font package version / 已安装的 NewCM 字体包版本 */
  fontVersion: string;
  /** Runtime version resolved from unpkg / 从 unpkg 解析出的运行时版本 */
  runtimeVersion: string;
  /** Build a dynamic font file URL / 构建动态字体文件 URL */
  dynamic: (name: string) => string;
}

/**
 * Load the font class and MathJax runtime from unpkg in a browser.
 *
 * 在浏览器中从 unpkg 加载字体类与 MathJax 运行时。
 *
 * @param version - MathJax version used by this package / 插件使用的 MathJax 版本
 * @param output - Output format / 输出格式
 * @param importModule - Module importer, injectable for tests / 模块导入函数，测试时可注入
 * @returns The browser font class and runtime / 浏览器字体类与运行时
 */
export const loadBrowserFonts = async (
  version: string,
  output: "svg" | "chtml",
  importModule: (url: string) => Promise<unknown> = importCdnModule,
): Promise<BrowserFonts> => {
  const runtimeVersion = await resolveCdnMathJaxVersion();

  if (!runtimeVersion) {
    throw new Error(
      "[@mdit/plugin-mathjax-slim] could not resolve the MathJax runtime version from unpkg. Check the network and Content Security Policy, or provide a custom `fontData` and `asyncLoad`.",
    );
  }

  const fontVersion = (await getFontPackageVersion()) ?? version;

  const urls = getCdnFontUrls(fontVersion, output, runtimeVersion);

  try {
    const fontModule = (await importModule(urls.font)) as {
      MathJaxNewcmFont: typeof chtmlFontType | typeof svgFontType;
    };
    const runtimeModule = (await importModule(urls.mathjax)) as { mathjax: typeof mathjaxType };

    return {
      fontData: fontModule.MathJaxNewcmFont,
      mathjax: runtimeModule.mathjax,
      fontVersion,
      runtimeVersion,
      dynamic: urls.dynamic,
    };
  } catch (err) {
    throw new Error(
      `[@mdit/plugin-mathjax-slim] failed to load the browser font files from unpkg (${urls.font}). Check the network and Content Security Policy, or provide a custom \`fontData\` and \`asyncLoad\`.`,
      { cause: err },
    );
  }
};

export { isBrowserRuntime } from "./runtime.js";
