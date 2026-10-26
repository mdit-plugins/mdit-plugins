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
 * 默认 TeX 包。
 *
 * 提供 `\href`、`\class`、`\style`、`\cssId` 等能力的 HTML 相关包（`html` 与 `texhtml`）默认不启用，默认不启用，仅在 markdown-it
 * 实例开启 `html: true` 时加入默认列表，或通过 `tex.packages` 显式启用，见 `./utils.ts` 的 `resolveTexPackages`。
 */
export const texPackages: TexPackage[] = [
  "action",
  "ams",
  "amscd",
  "bbm",
  "bboldx",
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
  "dsfont",
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
