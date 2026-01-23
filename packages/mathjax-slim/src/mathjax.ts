import type { MmlNode } from "@mathjax/src/js/core/MmlTree/MmlNode.js";
import type TexError from "@mathjax/src/js/input/tex/TexError.js";
import type { TeX } from "@mathjax/src/js/input/tex.js";

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
   *   'base',
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
   * @default "center"
   */
  displayAlign?: "left" | "center" | "right";

  /**
   * @default 0
   */
  displayIndent?: string;

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
}

export interface MathjaxCommonHTMLOutputOptions extends MathjaxCommonOutputOptions {
  /**
   * Whether match ex-height of surrounding font
   *
   * @default true
   */
  matchFontHeight?: boolean;

  /**
   * The URL where the fonts are found
   *
   * @default local form `@mathjax/src`
   */
  fontURL?: string;

  /**
   * Whether only produce CSS that is used in the processed equations
   *
   * @default true
   */
  adaptiveCSS?: boolean;
}

export interface MathjaxSVGOutputOptions extends MathjaxCommonOutputOptions {
  /**
   * @default "none"
   */
  fontCache?: "local" | "global" | "none";

  /**
   * ID to use for local font cache (for single equation processing)
   */
  localID?: string | null;

  /**
   * insert <title> tags with speech content
   *
   * @default true
   */
  internalSpeechTitles?: boolean;

  /**
   * initial id number to use for aria-labeledby titles
   */
  titleID?: number;
}
