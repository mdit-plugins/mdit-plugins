/**
 * URL used to discover the MathJax version that unpkg resolves for the font package.
 *
 * 用于查询 unpkg 为字体包解析出的 MathJax 版本的 URL。
 */
const CDN_MATHJAX_LATEST_URL = "https://unpkg.com/@mathjax/src@latest/mjs/mathjax.js?module";
const CDN_MATHJAX_VERSION_RE = /@mathjax\/src@(?<version>[^/]+)\//;

/**
 * URLs of the browser font files served by unpkg.
 *
 * 由 unpkg 提供的浏览器字体文件 URL。
 */
export interface CdnFontUrls {
  /** Font class module URL / 字体类模块 URL */
  font: string;
  /** MathJax runtime module URL / MathJax 运行时模块 URL */
  mathjax: string;
  /** Dynamic font file URL / 动态字体文件 URL */
  dynamic: (name: string) => string;
}

/**
 * Resolve the exact `@mathjax/src` version that unpkg uses for the font package's imports.
 *
 * 解析 unpkg 为字体包导入所使用的确切 `@mathjax/src` 版本。
 *
 * Unpkg rewrites the font package's bare `@mathjax/src` imports to `@latest`, which redirects to a
 * concrete version. The runtime must be imported from that same concrete URL; importing `@latest`
 * directly creates a second module instance and its `asyncLoad` never reaches the font class.
 *
 * Unpkg 会把字体包中裸写的 `@mathjax/src` 导入重写为 `@latest`，再重定向到具体版本。运行时必须从同一个具体 URL 导入； 直接导入 `@latest`
 * 会创建第二个模块实例，它的 `asyncLoad` 不会作用到字体类上。
 *
 * @param fallback - Version to use when the request fails / 请求失败时使用的版本
 * @returns The resolved MathJax version / 解析出的 MathJax 版本
 */
export const resolveCdnMathJaxVersion = async (fallback: string): Promise<string> => {
  try {
    const response = await fetch(CDN_MATHJAX_LATEST_URL, { method: "HEAD" });
    const match = CDN_MATHJAX_VERSION_RE.exec(response.url);

    return match?.groups?.version ?? fallback;
  } catch {
    return fallback;
  }
};

/**
 * Create the unpkg URLs used to load MathJax fonts in browsers.
 *
 * 创建浏览器中加载 MathJax 字体所用的 unpkg URL。
 *
 * The font class and dynamic files use the version running in this package. The runtime uses the
 * version unpkg resolves for the font package's internal imports, so `asyncLoad` and the font class
 * share one module instance.
 *
 * 字体类与动态文件使用插件当前运行的版本。运行时使用 unpkg 为字体包内部导入解析出的版本，这样 `asyncLoad` 与字体类属于同一个模块实例。
 *
 * @param version - MathJax version used by this package / 插件使用的 MathJax 版本
 * @param output - Output format / 输出格式
 * @param runtimeVersion - Runtime version resolved from unpkg / 从 unpkg 解析出的运行时版本
 * @returns Font, runtime, and dynamic-file URLs / 字体、运行时和动态文件 URL
 */
export const getCdnFontUrls = (
  version: string,
  output: "svg" | "chtml",
  runtimeVersion = version,
): CdnFontUrls => {
  const base = `https://unpkg.com/@mathjax/mathjax-newcm-font@${version}/mjs`;

  return {
    font: `${base}/${output}.js?module`,
    mathjax: `https://unpkg.com/@mathjax/src@${runtimeVersion}/mjs/mathjax.js?module`,
    dynamic: (name: string) => `${base}/${output}/dynamic/${name}.js?module`,
  };
};
