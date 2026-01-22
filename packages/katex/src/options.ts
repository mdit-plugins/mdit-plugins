import type { MarkdownItTexOptions } from "@mdit/plugin-tex";
import type { KatexOptions, Token } from "katex";

export type KatexLogger<MarkdownItEnv = unknown> = (
  errorCode:
    | "unknownSymbol"
    | "unicodeTextInMathMode"
    | "mathVsTextUnits"
    | "commentAtEnd"
    | "htmlExtension"
    | "newLineInDisplayMode",
  errorMsg: string,
  token: Token,
  env: MarkdownItEnv,
) => "error" | "warn" | "ignore" | boolean | void;

export type TeXTransformer = (content: string, displayMode: boolean) => string;

export interface MarkdownItKatexOptions<MarkdownItEnv = unknown>
  extends
    KatexOptions,
    Pick<MarkdownItTexOptions, "allowInlineWithSpace" | "delimiters" | "mathFence"> {
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
