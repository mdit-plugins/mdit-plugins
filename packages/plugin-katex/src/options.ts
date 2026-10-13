import type { MarkdownItTexOptions } from "@mdit/plugin-tex";
import type { StrictFunction, KatexOptions } from "katex";

type LoggerParams = Parameters<StrictFunction>;

export type KatexLogger<MarkdownItEnv = unknown> = (
  errorCode: LoggerParams[0],
  errorMsg: LoggerParams[1],
  token: LoggerParams[2] | undefined,
  env: MarkdownItEnv,
) => "error" | "warn" | "ignore" | boolean | undefined;

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
   * Transformer on output content
   *
   * 输出内容的转换器
   */
  transformer?: TeXTransformer;
}
