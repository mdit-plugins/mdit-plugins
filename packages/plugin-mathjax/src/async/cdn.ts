/**
 * URL used to discover the MathJax version that unpkg resolves for the font package.
 *
 * 用于查询 unpkg 为字体包解析出的 MathJax 版本的 URL。
 */
const CDN_MATHJAX_LATEST_URL = "https://unpkg.com/@mathjax/src@latest/mjs/mathjax.js?module";
const CDN_MATHJAX_VERSION_RE = /@mathjax\/src@(?<version>\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\//;
const SEMVER_RE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const CDN_HEAD_TIMEOUT_MS = 5000;

let cachedCdnMathJaxVersion = "";

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
 * Clear the cached MathJax runtime version.
 *
 * 清除缓存的 MathJax 运行时版本。
 */
export const clearCdnMathJaxVersionCache = (): void => {
  cachedCdnMathJaxVersion = "";
};

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
 * @returns The resolved MathJax version, or `null` when it cannot be determined / 解析出的 MathJax
 *   版本；无法确定时返回 `null`
 */
export const resolveCdnMathJaxVersion = async (): Promise<string | null> => {
  if (cachedCdnMathJaxVersion) return cachedCdnMathJaxVersion;

  try {
    const response = await fetch(CDN_MATHJAX_LATEST_URL, {
      method: "HEAD",
      signal: AbortSignal.timeout(CDN_HEAD_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const match = CDN_MATHJAX_VERSION_RE.exec(response.url);
    const version = match?.groups?.version;

    if (!version || !SEMVER_RE.test(version)) return null;

    cachedCdnMathJaxVersion = version;

    return version;
  } catch {
    return null;
  }
};

/**
 * Read the version of the installed NewCM font package.
 *
 * 读取已安装的 NewCM 字体包版本。
 *
 * The font package is an independent peer dependency. Its version, not the MathJax runtime version,
 * decides which font files exist on unpkg.
 *
 * 字体包是独立的 peer 依赖。决定 unpkg 上存在哪些字体文件的是它的版本，而不是 MathJax 运行时版本。
 *
 * @returns The font package version, or `null` when the package cannot be read / 字体包版本；无法读取时返回
 *   `null`
 */
export const getFontPackageVersion = async (): Promise<string | null> => {
  try {
    const fontPackage = (await import("@mathjax/mathjax-newcm-font/package.json", {
      with: { type: "json" },
    })) as { default: { version: string } };

    return fontPackage.default.version;
  } catch {
    return null;
  }
};

/**
 * Import a module from an absolute URL.
 *
 * 从绝对 URL 导入模块。
 *
 * @param url - Module URL / 模块 URL
 * @returns The imported module / 导入的模块
 */
export const importCdnModule = (url: string): Promise<unknown> =>
  import(/* @vite-ignore */ /* webpackIgnore: true */ url);

/**
 * Create the unpkg URLs used to load MathJax fonts in browsers.
 *
 * 创建浏览器中加载 MathJax 字体所用的 unpkg URL。
 *
 * The font class and dynamic files use the installed font package version. The runtime uses the
 * concrete version unpkg resolves for the font package's internal imports, so `asyncLoad` and the
 * font class share one module instance.
 *
 * 字体类与动态文件使用已安装字体包的版本。运行时使用 unpkg 为字体包内部导入解析出的具体版本，这样 `asyncLoad` 与字体类属于同一个模块实例。
 *
 * @param fontVersion - Installed NewCM font package version / 已安装的 NewCM 字体包版本
 * @param output - Output format / 输出格式
 * @param runtimeVersion - Runtime version resolved from unpkg / 从 unpkg 解析出的运行时版本
 * @returns Font, runtime, and dynamic-file URLs / 字体、运行时和动态文件 URL
 */
export const getCdnFontUrls = (
  fontVersion: string,
  output: "svg" | "chtml",
  runtimeVersion: string,
): CdnFontUrls => {
  const base = `https://unpkg.com/@mathjax/mathjax-newcm-font@${fontVersion}/mjs`;

  return {
    font: `${base}/${output}.js?module`,
    mathjax: `https://unpkg.com/@mathjax/src@${runtimeVersion}/mjs/mathjax.js?module`,
    dynamic: (name: string) => `${base}/${output}/dynamic/${name}.js?module`,
  };
};
