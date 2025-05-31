import type Token from "markdown-it/lib/token.mjs";

export type TestFunction<Value = unknown> = (value: Value) => boolean;

export interface AttrRuleSet {
  position?: number;
  shift?: number;
  type?: string | TestFunction<string> | TestFunction<string>[];
  tag?: string | TestFunction<string> | TestFunction<string>[];
  nesting?: 0 | 1 | -1 | TestFunction<0 | 1 | -1> | TestFunction<0 | 1 | -1>[];
  level?: number | TestFunction<number> | TestFunction<number>[];
  block?: boolean | TestFunction<boolean> | TestFunction<boolean>[];
  hidden?: boolean | TestFunction<boolean> | TestFunction<boolean>[];
  info?: string | TestFunction<string> | TestFunction<string>[];
  content?: string | TestFunction<string> | TestFunction<string>[];
  children?: AttrRuleSet[] | TestFunction<AttrRuleSet[]>;
}

export interface AttrRule {
  name: string;
  tests: AttrRuleSet[];
  transform: (tokens: Token[], index: number, childIndex: number) => void;
}
