import type { Env, Token } from "markdown-it";

export interface FootNoteToken extends Token {
  meta: {
    id: number;
    subId: number;
    label: string;
  };
}

export interface FootNoteEnv extends Env {
  docId?: string;
  footnotes?: {
    label?: string;
    refs?: Record<string, number>;
    list?: {
      label?: string;
      count?: number;
      content?: string;
      tokens?: Token[] | null;
    }[];
  };
}
