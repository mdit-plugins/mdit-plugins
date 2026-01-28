import type { MmlNode } from "@mathjax/src/js/core/MmlTree/MmlNode.js";
import type TexError from "@mathjax/src/js/input/tex/TexError.js";
import type { TeX } from "@mathjax/src/js/input/tex.js";
import type { ChtmlFontData } from "@mathjax/src/js/output/chtml/FontData.js";
import type { SvgFontData } from "@mathjax/src/js/output/svg/FontData.js";
import type { MathItem } from "@mathjax/src/js/core/MathItem.js";
import type { LiteElement } from "@mathjax/src/js/adaptors/lite/Element.js";
import type { MathDocument } from "@mathjax/src/js/core/MathDocument.js";
import type { CssStyles } from "@mathjax/src/js/ui/menu/mj-context-menu.js";
import type { LinebreakVisitor } from "@mathjax/src/js/output/common/LinebreakVisitor.js";
import type { SvgWrapperFactory } from "@mathjax/src/js/output/svg/WrapperFactory.js";
import type { ChtmlWrapperFactory } from "@mathjax/src/js/output/chtml/WrapperFactory.js";

export type TexPackage =
  | "action"
  | "ams"
  | "amscd"
  | "bbm"
  | "bboldx"
  | "bbox"
  | "begingroup"
  | "boldsymbol"
  | "braket"
  | "bussproofs"
  | "cancel"
  | "cases"
  | "centernot"
  | "color"
  | "colortbl"
  | "colorv2"
  | "configmacros"
  | "dsfont"
  | "empheq"
  | "enclose"
  | "extpfeil"
  | "gensymb"
  | "html"
  | "mathtools"
  | "mhchem"
  | "newcommand"
  | "noerrors"
  | "noundefined"
  | "physics"
  | "setoptions"
  | "tagformat"
  | "texhtml"
  | "textcomp"
  | "textmacros"
  | "unicode"
  | "units"
  | "upgreek"
  | "verb";

export interface MathJaxTexInputOptions {
  /**
   * extensions to use
   *
   * @default [
   *   'action',
   *   'ams',
   *   'amscd',
   *   'bbm',
   *   'bboldx',
   *   'bbox',
   *   'begingroup',
   *   'boldsymbol',
   *   'braket',
   *   'bussproofs',
   *   'cancel',
   *   'cases',
   *   'centernot',
   *   'color',
   *   'colortbl',
   *   'colorv2',
   *   'configmacros',
   *   'dsfont',
   *   'empheq',
   *   'enclose',
   *   'extpfeil',
   *   'gensymb',
   *   'html',
   *   'mathtools',
   *   'mhchem',
   *   'newcommand',
   *   'noerrors',
   *   'noundefined',
   *   'physics',
   *   'require',
   *   'setoptions',
   *   'tagformat',
   *   'texhtml',
   *   'textcomp',
   *   'textmacros',
   *   'unicode',
   *   'units',
   *   'upgreek',
   *   'verb',
   *  ]
   */
  packages?: TexPackage[];

  /**
   * pattern for recognizing numbers
   *
   * @default /^(?:[0-9]+(?:\{,\}[0-9]{3})*(?:\.[0-9]*)?|\.[0-9]+)/
   */
  digits?: RegExp;

  tags?: "ams" | "all" | "none";

  /**
   * side for `\tag` macros
   */
  tagSide?: "left" | "right";

  /**
   * amount to indent tags
   *
   * @default "0.8em"
   */
  tagIndent?: "0.8em";

  /**
   * use label name rather than tag for ids
   *
   * @default true;
   */
  useLabelIds?: boolean;

  /**
   *  maximum number of macro substitutions per expression
   *
   * @default 1000
   */
  maxMacros?: number;

  /**
   * maximum size for the internal TeX string (in bytes)
   *
   * @default 5120
   */
  maxBuffer?: number;

  formatError?: (jax: TeX<unknown, unknown, unknown>, error: typeof TexError) => MmlNode;
}

/**
 * Data passed to MathJax filters
 */
export interface MathjaxFilterData {
  math: MathItem<LiteElement, string, HTMLElement>;
  document: MathDocument<LiteElement, string, HTMLElement>;
  data: any;
}

/**
 * MathJax filter function
 */
export type MathjaxFilter = (data: MathjaxFilterData) => void;

/**
 * @see https://docs.mathjax.org/en/latest/options/output/index.html#option-descriptions
 */
export interface MathjaxCommonOutputOptions {
  /**
   * Global scaling factor for all expressions
   *
   * @default 1
   */
  scale?: number;

  /**
   * smallest scaling factor to use
   *
   * @default 0.5
   */
  minScale?: number;

  /**
   * make mtext elements use surrounding font
   *
   * @default false
   */
  mtextInheritFont?: boolean;

  /**
   * make merror text use surrounding font
   *
   * @default true
   */
  merrorInheritFont?: boolean;

  /**
   * font to use for mtext, if not inheriting (empty means use MathJax fonts)
   *
   * @default ""
   */
  mtextFont?: string;

  /**
   * font to use for merror, if not inheriting (empty means use MathJax fonts)
   *
   * @default "serif"
   */
  merrorFont?: string;

  /**
   * font to use for character that aren’t in MathJax's fonts
   *
   * @default "serif"
   */
  unknownFamily?: string;

  /**
   * - `true` for MathML spacing rules
   * - `false` for TeX rules
   *
   * @default false
   */
  mathmlSpacing?: boolean;

  /**
   * RFDa and other attributes NOT to copy to the output
   */
  skipAttributes?: Record<string, boolean>;

  /**
   * default size of ex in em units
   *
   * @default 0.5
   */
  exFactor?: number;

  /**
   * default for indentalign when set to 'auto'
   *
   * @default "center"
   */
  displayAlign?: "left" | "center" | "right";

  /**
   * default for indentshift when set to 'auto'
   *
   * @default 0
   */
  displayIndent?: string;

  /**
   * default for overflow
   *
   * @default "overflow"
   */
  displayOverflow?: "scroll" | "scale" | "truncate" | "elide" | "linebreak" | "overflow";

  /**
   * options for when overflow is linebreak
   */
  linebreaks?: {
    /**
     * true for browser-based breaking of inline equations
     *
     * @default true
     */
    inline?: boolean;

    /**
     * a fixed size or a percentage of the container width
     *
     * @default "100%"
     */
    width?: string;

    /**
     * the default lineleading in em units
     *
     * @default 0.2
     */
    lineleading?: number;

    /**
     * for developers only
     */
    LinebreakVisitor?: typeof LinebreakVisitor;
  };

  /**
   * the font component to load
   *
   * @default ""
   */
  font?: string;

  /**
   * The path to the font definitions
   *
   * @default "https://cdn.jsdelivr.net/npm/@mathjax/mathjax-newcm-font/"
   */
  fontPath?: string;

  /**
   * The font extensions to load
   *
   * @default []
   */
  fontExtensions?: string[];

  /**
   * 'use', 'force', or 'ignore' data-mjx-hdw attributes
   *
   * @default "auto"
   */
  htmlHDW?: "use" | "force" | "ignore";

  /**
   * A list of pre-filters to add to the output jax
   *
   * @default []
   */
  preFilters?: MathjaxFilter[];

  /**
   * A list of post-filters to add to the output jax
   *
   * @default []
   */
  postFilters?: MathjaxFilter[];

  /**
   * for developers only
   */
  cssStyles?: typeof CssStyles;
}

export interface MathjaxCommonHTMLOutputOptions extends MathjaxCommonOutputOptions {
  /**
   * Whether match ex-height of surrounding font
   *
   * @default true
   */
  matchFontHeight?: boolean;

  /**
   * Font data to use
   *
   * @default font data from `@mathjax/mathjax-newcm-font`
   */
  fontData?: typeof ChtmlFontData;

  /**
   * The URL where the fonts are found
   *
   * @default jsdelivr CDN links for `@mathjax/mathjax-newcm-font`
   */
  fontURL?: string;

  /**
   * location where MathJax should look for font data that has to be loaded dynamically.
   *
   * @default jsdelivr CDN links for `@mathjax/mathjax-newcm-font`
   */
  dynamicPrefix?: string;

  /**
   * Whether only produce CSS that is used in the processed equations
   *
   * @default true
   */
  adaptiveCSS?: boolean;

  /**
   * for developers only
   */
  wrapperFactory?: typeof ChtmlWrapperFactory;
}

export interface MathjaxSVGOutputOptions extends MathjaxCommonOutputOptions {
  /**
   * stroke-width to use for SVG character paths in units that are 1/1000 of an em
   *
   * @default 3
   */
  blacker?: number;

  /**
   * @see https://docs.mathjax.org/en/latest/options/output/svg.html#option-descriptions
   * @default "local"
   */
  fontCache?: "local" | "global" | "none";

  /**
   * Font data to use
   *
   * @default font data from `@mathjax/mathjax-newcm-font`
   */
  fontData?: typeof SvgFontData;

  /**
   * Whether the xlink namespace should be included in the href attributes or not
   *
   * @default true
   */
  useXlink?: boolean;

  /**
   * ID to use for local font cache (for single equation processing)
   */
  localID?: string | null;

  /**
   * for developers only
   */
  wrapperFactory?: typeof SvgWrapperFactory;
}
