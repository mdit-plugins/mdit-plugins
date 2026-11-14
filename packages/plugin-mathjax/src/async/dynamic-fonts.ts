/**
 * Static loaders for the dynamic font files of `@mathjax/mathjax-newcm-font`.
 *
 * MathJax builds dynamic font file names at runtime, so a bare `import(file)` cannot be analyzed by
 * browser bundlers. Static specifiers let bundlers emit a chunk per file and keep the imports
 * resolvable in browsers.
 *
 * `@mathjax/mathjax-newcm-font` 动态字体文件的静态加载器。
 *
 * MathJax 在运行时拼接动态字体文件名，浏览器打包器无法分析裸 `import(file)`。静态导入说明符让打包器为每个 文件生成 chunk，并保证这些导入在浏览器中可被解析。
 */
export const dynamicFontLoaders: Record<string, () => Promise<unknown>> = {
  "svg/PUA": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/PUA.js"),
  "svg/accents-b-i": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/accents-b-i.js"),
  "svg/accents": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/accents.js"),
  "svg/arabic": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/arabic.js"),
  "svg/arrows": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/arrows.js"),
  "svg/braille-d": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/braille-d.js"),
  "svg/braille": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/braille.js"),
  "svg/calligraphic": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/calligraphic.js"),
  "svg/cherokee": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/cherokee.js"),
  "svg/cyrillic-ss": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/cyrillic-ss.js"),
  "svg/cyrillic": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/cyrillic.js"),
  "svg/devanagari": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/devanagari.js"),
  "svg/double-struck": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/double-struck.js"),
  "svg/fraktur": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/fraktur.js"),
  "svg/greek-ss": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/greek-ss.js"),
  "svg/greek": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/greek.js"),
  "svg/hebrew": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/hebrew.js"),
  "svg/latin-b": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/latin-b.js"),
  "svg/latin-bi": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/latin-bi.js"),
  "svg/latin-i": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/latin-i.js"),
  "svg/latin": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/latin.js"),
  "svg/marrows": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/marrows.js"),
  "svg/math": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/math.js"),
  "svg/monospace-ex": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/monospace-ex.js"),
  "svg/monospace-l": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/monospace-l.js"),
  "svg/monospace": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/monospace.js"),
  "svg/mshapes": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/mshapes.js"),
  "svg/phonetics-ss": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/phonetics-ss.js"),
  "svg/phonetics": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/phonetics.js"),
  "svg/sans-serif-b": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/sans-serif-b.js"),
  "svg/sans-serif-bi": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/sans-serif-bi.js"),
  "svg/sans-serif-ex": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/sans-serif-ex.js"),
  "svg/sans-serif-i": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/sans-serif-i.js"),
  "svg/sans-serif-r": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/sans-serif-r.js"),
  "svg/sans-serif": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/sans-serif.js"),
  "svg/script": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/script.js"),
  "svg/shapes": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/shapes.js"),
  "svg/symbols-b-i": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/symbols-b-i.js"),
  "svg/symbols": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/symbols.js"),
  "svg/variants": () => import("@mathjax/mathjax-newcm-font/js/svg/dynamic/variants.js"),
  "chtml/PUA": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/PUA.js"),
  "chtml/accents-b-i": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/accents-b-i.js"),
  "chtml/accents": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/accents.js"),
  "chtml/arabic": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/arabic.js"),
  "chtml/arrows": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/arrows.js"),
  "chtml/braille-d": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/braille-d.js"),
  "chtml/braille": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/braille.js"),
  "chtml/calligraphic": () =>
    import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/calligraphic.js"),
  "chtml/cherokee": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/cherokee.js"),
  "chtml/cyrillic-ss": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/cyrillic-ss.js"),
  "chtml/cyrillic": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/cyrillic.js"),
  "chtml/devanagari": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/devanagari.js"),
  "chtml/double-struck": () =>
    import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/double-struck.js"),
  "chtml/fraktur": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/fraktur.js"),
  "chtml/greek-ss": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/greek-ss.js"),
  "chtml/greek": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/greek.js"),
  "chtml/hebrew": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/hebrew.js"),
  "chtml/latin-b": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/latin-b.js"),
  "chtml/latin-bi": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/latin-bi.js"),
  "chtml/latin-i": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/latin-i.js"),
  "chtml/latin": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/latin.js"),
  "chtml/marrows": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/marrows.js"),
  "chtml/math": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/math.js"),
  "chtml/monospace-ex": () =>
    import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/monospace-ex.js"),
  "chtml/monospace-l": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/monospace-l.js"),
  "chtml/monospace": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/monospace.js"),
  "chtml/mshapes": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/mshapes.js"),
  "chtml/phonetics-ss": () =>
    import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/phonetics-ss.js"),
  "chtml/phonetics": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/phonetics.js"),
  "chtml/sans-serif-b": () =>
    import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/sans-serif-b.js"),
  "chtml/sans-serif-bi": () =>
    import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/sans-serif-bi.js"),
  "chtml/sans-serif-ex": () =>
    import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/sans-serif-ex.js"),
  "chtml/sans-serif-i": () =>
    import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/sans-serif-i.js"),
  "chtml/sans-serif-r": () =>
    import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/sans-serif-r.js"),
  "chtml/sans-serif": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/sans-serif.js"),
  "chtml/script": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/script.js"),
  "chtml/shapes": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/shapes.js"),
  "chtml/symbols-b-i": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/symbols-b-i.js"),
  "chtml/symbols": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/symbols.js"),
  "chtml/variants": () => import("@mathjax/mathjax-newcm-font/js/chtml/dynamic/variants.js"),
};

const DYNAMIC_FONT_FILE_RE =
  /^@mathjax\/mathjax-newcm-font\/js\/(?<output>svg|chtml)\/dynamic\/(?<name>[^/]+)\.js$/;

/**
 * Load an asynchronous file requested by MathJax.
 *
 * Dynamic font files of the bundled font use the static loaders above; other files fall back to a
 * runtime import, which Node.js resolves directly and browser bundlers can ignore.
 *
 * 加载 MathJax 请求的异步文件。
 *
 * 内置字体的动态字体文件使用上方的静态加载器；其他文件回退到运行时导入，由 Node.js 直接解析，浏览器打包器会忽略它。
 *
 * @param file - File name or specifier requested by MathJax / MathJax 请求的文件名或说明符
 * @returns The loaded module / 加载的模块
 */
export const loadMathJaxFile = (file: string): Promise<unknown> => {
  const match = DYNAMIC_FONT_FILE_RE.exec(file);
  const loader = match?.groups
    ? dynamicFontLoaders[`${match.groups.output}/${match.groups.name}`]
    : null;

  return loader ? loader() : import(/* @vite-ignore */ /* webpackIgnore: true */ file);
};
