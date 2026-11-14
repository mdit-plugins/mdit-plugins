import type { DynamicFontLoaderSet } from "./dynamic-fonts.js";

/**
 * Static loaders for the SVG dynamic font files of `@mathjax/mathjax-newcm-font`.
 *
 * Keeping this set separate from the CHTML set lets consumers of the output-specific async entry
 * bundle only the files of the selected output.
 *
 * `@mathjax/mathjax-newcm-font` 的 SVG 动态字体静态加载器。
 *
 * 与 CHTML 集合分开，使用按输出区分的异步入口时只会打包所选输出的文件。
 */
export const dynamicFontLoaders: DynamicFontLoaderSet = {
  output: "svg",
  loaders: {
    PUA: () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/PUA.js"),
    "accents-b-i": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/accents-b-i.js"),
    accents: () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/accents.js"),
    arabic: () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/arabic.js"),
    arrows: () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/arrows.js"),
    "braille-d": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/braille-d.js"),
    braille: () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/braille.js"),
    calligraphic: () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/calligraphic.js"),
    cherokee: () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/cherokee.js"),
    "cyrillic-ss": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/cyrillic-ss.js"),
    cyrillic: () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/cyrillic.js"),
    devanagari: () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/devanagari.js"),
    "double-struck": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/double-struck.js"),
    fraktur: () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/fraktur.js"),
    "greek-ss": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/greek-ss.js"),
    greek: () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/greek.js"),
    hebrew: () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/hebrew.js"),
    "latin-b": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/latin-b.js"),
    "latin-bi": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/latin-bi.js"),
    "latin-i": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/latin-i.js"),
    latin: () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/latin.js"),
    marrows: () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/marrows.js"),
    math: () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/math.js"),
    "monospace-ex": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/monospace-ex.js"),
    "monospace-l": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/monospace-l.js"),
    monospace: () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/monospace.js"),
    mshapes: () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/mshapes.js"),
    "phonetics-ss": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/phonetics-ss.js"),
    phonetics: () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/phonetics.js"),
    "sans-serif-b": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/sans-serif-b.js"),
    "sans-serif-bi": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/sans-serif-bi.js"),
    "sans-serif-ex": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/sans-serif-ex.js"),
    "sans-serif-i": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/sans-serif-i.js"),
    "sans-serif-r": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/sans-serif-r.js"),
    "sans-serif": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/sans-serif.js"),
    script: () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/script.js"),
    shapes: () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/shapes.js"),
    "symbols-b-i": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/symbols-b-i.js"),
    symbols: () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/symbols.js"),
    variants: () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/variants.js"),
  },
};
