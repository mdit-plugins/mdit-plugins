import type { TexPackage } from "../mathjax.js";

/**
 * Default TeX packages.
 *
 * The HTML-related packages (`html`, which provides `\href`, `\class`, `\style` and `\cssId`, and
 * `texhtml`, which registers the `<tex-html>` handler) are intentionally excluded. They are added
 * to the default list when the markdown-it instance enables raw HTML (`new MarkdownIt({ html: true
 * })`), or can be enabled explicitly through `tex.packages`, see `resolveTexPackages` in
 * `./utils.ts`.
 *
 * The font-extension packages (`bbm`, `bboldx` and `dsfont`) are also excluded: the bundled
 * `@mathjax/mathjax-newcm-font` font does not ship their extension data, so loading them would
 * replace standard macros (e.g. `\mathbb`) with missing font variants and fall back with an
 * `Invalid variant` warning. They can still be enabled explicitly through `tex.packages`.
 *
 * 默认 TeX 包。
 *
 * 提供 `\href`、`\class`、`\style`、`\cssId` 等能力的 HTML 相关包（`html`）与注册 `<tex-html>` 处理器的 `texhtml`
 * 默认不启用：仅在 markdown-it 实例开启 `html: true` 时加入默认列表，或通过 `tex.packages` 显式启用， 见 `./utils.ts` 的
 * `resolveTexPackages`。
 *
 * 依赖字体扩展数据的 `bbm`、`bboldx`、`dsfont` 同样默认不启用：随包的 `@mathjax/mathjax-newcm-font`
 * 字体不包含这些扩展数据，加载后会用缺失的字体变体替换标准宏（如 `\mathbb`）并触发 `Invalid variant` 警告后回退。 仍可通过 `tex.packages` 显式启用。
 */
export const texPackages: TexPackage[] = [
  "action",
  "ams",
  "amscd",
  "bbox",
  "begingroup",
  "boldsymbol",
  "braket",
  "bussproofs",
  "cancel",
  "cases",
  "centernot",
  "color",
  "colortbl",
  "colorv2",
  "configmacros",
  "empheq",
  "enclose",
  "extpfeil",
  "gensymb",
  "mathtools",
  "mhchem",
  "newcommand",
  "noerrors",
  "noundefined",
  "physics",
  "setoptions",
  "tagformat",
  "textcomp",
  "textmacros",
  "unicode",
  "units",
  "upgreek",
  "verb",
];
