import type Token from "markdown-it/lib/token.mjs";
import type { Nesting } from "markdown-it/lib/token.mjs";

export type DelimiterRange = [start: number, end: number];
export type TestFunction<Value = unknown> = (value: Value) => boolean;
export type DelimiterChecker = (content: string) => DelimiterRange | false;

/**
 * Token 的属性测试函数映射，用于规则匹配
 *
 * Test function mapping for token properties used in rule matching
 */
export type TokenPropTest = {
  [K in keyof Token]?: K extends "nesting"
    ? Nesting | TestFunction<Nesting>
    : K extends "attrs" | "map" | "children"
      ? never
      : K extends "content" | "info"
        ? string | DelimiterChecker
        : Token[K] extends (infer T) | null
          ? T | TestFunction<T>
          : Token[K] | TestFunction<Token[K]>;
};

/**
 * 基础属性规则集接口，不包含定位属性
 *
 * Base attribute rule set interface without positioning properties
 */
interface BaseAttrRuleSet extends Omit<TokenPropTest, "children"> {
  /**
   * 子规则集合，用于递归匹配
   *
   * Child rule sets for recursive matching
   */
  children?: AttrRuleSet[] | TestFunction<Token[]>;
}

/**
 * 使用shift定位的规则集
 *
 * Rule set using shift for positioning
 */
interface ShiftAttrRuleSet extends BaseAttrRuleSet {
  /**
   * 相对于当前位置的偏移量，用于查找目标 token
   *
   * Offset relative to current position to find target token
   */
  shift: number;

  /**
   * 绝对位置，可选
   *
   * Optional absolute position
   */
  position?: never;
}

/**
 * 使用position定位的规则集
 *
 * Rule set using position for positioning
 */
interface PositionAttrRuleSet extends BaseAttrRuleSet {
  /**
   * 绝对位置，用于在 tokens 数组中直接定位目标 token
   *
   * Absolute position to locate target token in tokens array
   */
  position: number;

  /**
   * 相对偏移量，可选
   *
   * Optional relative offset
   */
  shift?: never;
}

/**
 * 属性规则集，用于定义如何在 tokens 中查找匹配项
 * 必须指定 shift 或 position 中的一个
 *
 * Attribute rule set for defining how to find matches in tokens
 * One of shift or position must be defined
 */
export type AttrRuleSet = ShiftAttrRuleSet | PositionAttrRuleSet;

export interface AttrRule {
  name: string;
  tests: AttrRuleSet[];
  transform: (tokens: Token[], index: number, childIndex: number, range: DelimiterRange) => void;
}
