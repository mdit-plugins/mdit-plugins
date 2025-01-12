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
) => "error" | "warn" | "ignore" | boolean | undefined | void;

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
