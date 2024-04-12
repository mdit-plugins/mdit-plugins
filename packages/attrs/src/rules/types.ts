import type Token from "markdown-it/lib/token.mjs";

export interface RuleSet {
  position?: number;
  shift?: number;
  type?: string | ((type: string) => boolean);
  block?: boolean;
  info?: boolean | ((info: string) => boolean);
  content?: boolean | ((content: string) => boolean);
  nesting?: 0 | 1 | -1;
  children?: RuleSet[] | ((children: unknown[]) => boolean);
}

export interface Rule {
  name: string;
  tests: RuleSet[];
  transform: (tokens: Token[], index: number, subIndex: number) => void;
}
