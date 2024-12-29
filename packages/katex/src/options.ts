import type { MarkdownItTexOptions } from "@mdit/plugin-tex";
import type { KatexOptions } from "katex";

type KatexCatcodes = Record<string, number>;

interface KatexLexerInterFace {
  input: string;
  tokenRegex: RegExp;
  settings: Required<KatexOptions>;
  catcodes: KatexCatcodes;
}

interface KatexSourceLocation {
  start: number;
  end: number;
  lexer: KatexLexerInterFace;
}

export interface KatexToken {
  text: string;
  loc: KatexSourceLocation | undefined;
  noexpand: boolean | undefined;
  treatAsRelax: boolean | undefined;
}

export type KatexLogger<MarkdownItEnv = unknown> = (
  errorCode:
    | "unknownSymbol"
    | "unicodeTextInMathMode"
    | "mathVsTextUnits"
    | "commentAtEnd"
    | "htmlExtension"
    | "newLineInDisplayMode",
  errorMsg: string,
  token: KatexToken,
  env: MarkdownItEnv,
) => "error" | "warn" | "ignore" | boolean | undefined;

export type TeXTransformer = (content: string, displayMode: boolean) => string;

export interface MarkdownItKatexOptions<MarkdownItEnv = unknown>
  extends KatexOptions,
    Pick<MarkdownItTexOptions, "allowInlineWithSpace" | "mathFence"> {
  /**
   * Whether enable mhchem extension
   *
   * 是否启用 mhchem 扩展
   *
   * @default false
   */
  mhchem?: boolean;

  /**
   * Error logger
   *
   * 错误日志记录器
   */
  logger?: KatexLogger<MarkdownItEnv>;

  /**
   * transformer on output content
   *
   * 输出内容的转换器
   */
  transformer?: TeXTransformer;
}
