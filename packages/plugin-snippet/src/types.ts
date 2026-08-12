import type { Env } from "markdown-it";

export interface SnippetEnv extends Env {
  /** Included snippet files */
  snippetFiles?: string[];
}
