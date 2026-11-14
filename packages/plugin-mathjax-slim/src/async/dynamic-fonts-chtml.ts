import type { DynamicFontLoaderSet } from "./dynamic-fonts.js";

/**
 * Static loaders for the CHTML dynamic font files of `@mathjax/mathjax-newcm-font`.
 *
 * Keeping this set separate from the SVG set lets consumers of the output-specific async entry
 * bundle only the files of the selected output.
 *
 * `@mathjax/mathjax-newcm-font` 的 CHTML 动态字体静态加载器。
 *
 * 与 SVG 集合分开，使用按输出区分的异步入口时只会打包所选输出的文件。
 */
export const dynamicFontLoaders: DynamicFontLoaderSet = {
  output: "chtml",
  loaders: {
    PUA: () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/PUA.js"),
    "accents-b-i": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/accents-b-i.js"),
    accents: () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/accents.js"),
    arabic: () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/arabic.js"),
    arrows: () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/arrows.js"),
    "braille-d": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/braille-d.js"),
    braille: () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/braille.js"),
    calligraphic: () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/calligraphic.js"),
    cherokee: () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/cherokee.js"),
    "cyrillic-ss": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/cyrillic-ss.js"),
    cyrillic: () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/cyrillic.js"),
    devanagari: () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/devanagari.js"),
    "double-struck": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/double-struck.js"),
    fraktur: () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/fraktur.js"),
    "greek-ss": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/greek-ss.js"),
    greek: () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/greek.js"),
    hebrew: () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/hebrew.js"),
    "latin-b": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/latin-b.js"),
    "latin-bi": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/latin-bi.js"),
    "latin-i": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/latin-i.js"),
    latin: () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/latin.js"),
    marrows: () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/marrows.js"),
    math: () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/math.js"),
    "monospace-ex": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/monospace-ex.js"),
    "monospace-l": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/monospace-l.js"),
    monospace: () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/monospace.js"),
    mshapes: () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/mshapes.js"),
    "phonetics-ss": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/phonetics-ss.js"),
    phonetics: () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/phonetics.js"),
    "sans-serif-b": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/sans-serif-b.js"),
    "sans-serif-bi": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/sans-serif-bi.js"),
    "sans-serif-ex": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/sans-serif-ex.js"),
    "sans-serif-i": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/sans-serif-i.js"),
    "sans-serif-r": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/sans-serif-r.js"),
    "sans-serif": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/sans-serif.js"),
    script: () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/script.js"),
    shapes: () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/shapes.js"),
    "symbols-b-i": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/symbols-b-i.js"),
    symbols: () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/symbols.js"),
    variants: () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/variants.js"),
  },
};
