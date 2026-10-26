import type { TexPackage } from "../mathjax.js";
import { texLoaders } from "./loader.js";
import { texPackages } from "./packages.js";

/**
 * TeX packages that provide HTML-related capabilities: `html` adds `\href`, `\class`, `\style` and
 * `\cssId`, and `texhtml` registers the `<tex-html>` handler (inert unless MathJax's `allowTexHTML`
 * option is enabled).
 *
 * 提供 HTML 相关能力的 TeX 包：`html` 提供 `\href`、`\class`、`\style`、`\cssId`；`texhtml` 注册 `<tex-html>`
 * 处理器（除非开启 MathJax 的 `allowTexHTML` 选项，否则不生效）。
 */
const HTML_PACKAGES: TexPackage[] = ["html", "texhtml"];

/**
 * Resolve the TeX packages to load.
 *
 * The default package list never contains the HTML-related packages; they are only added to that
 * default list when the markdown-it instance enables raw HTML. An explicit `tex.packages` list is
 * treated as trusted developer configuration and used as-is, so enabling the HTML-related packages
 * is possible even when markdown-it itself has raw HTML disabled.
 *
 * 解析需要加载的 TeX 包。
 *
 * 默认包列表从不包含 HTML 相关包；仅当 markdown-it 实例开启原始 HTML 时才会把它们加入默认列表。 显式提供的 `tex.packages`
 * 视为可信的开发者配置并原样使用，因此即使 markdown-it 关闭原始 HTML，也可以启用 HTML 相关包。
 *
 * @param userPackages - User-defined packages / 用户定义的包
 * @param enableHtml - Whether markdown-it enables HTML / markdown-it 是否开启 HTML
 * @returns Resolved package list with `base` first / 解析后的包列表（`base` 在最前）
 */
export const resolveTexPackages = (
  userPackages?: TexPackage[],
  enableHtml = false,
): TexPackage[] => {
  // `base` is always loaded and is not part of the public `TexPackage` union.
  // `base` 总会加载，且不在公开的 `TexPackage` 联合类型中。
  const packages = new Set<string>(["base"]);

  if (userPackages) {
    // Trusted developer configuration: use the list as-is.
    // 可信的开发者配置：原样使用该列表。
    for (const pkg of userPackages) packages.add(pkg);
  } else {
    for (const pkg of texPackages) packages.add(pkg);

    // The markdown-it `html` option only decides the default package list.
    // markdown-it 的 `html` 选项只决定默认包列表。
    if (enableHtml) for (const pkg of HTML_PACKAGES) packages.add(pkg);
  }

  return [...packages] as TexPackage[];
};

/**
 * Load the given TeX packages with MathJax's official async API.
 *
 * 使用 MathJax 官方异步 API 加载指定的 TeX 包。
 *
 * @param packages - Packages to load / 需要加载的包
 * @returns Promise resolved when all packages are loaded / 所有包加载完成时 resolve 的 Promise
 */
export const loadTexPackages = async (packages: TexPackage[] = texPackages): Promise<void> => {
  await import("@mathjax/src/js/input/tex/base/BaseConfiguration.js");

  await Promise.all(
    packages.filter((pkg) => Object.hasOwn(texLoaders, pkg)).map((pkg) => texLoaders[pkg]()),
  );
};
