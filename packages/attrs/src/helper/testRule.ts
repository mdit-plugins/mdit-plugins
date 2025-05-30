import type Token from "markdown-it/lib/token.mjs";

import type { RuleSet, TestFunction } from "../rules/types.js";
import {
  getArrayItem,
  isArrayOfFunctions,
  isArrayOfObjects,
} from "../utils.js";

export interface TestRuleResult {
  /** whether rule matches token stream */
  match: boolean;
  /** position of token */
  position: null | number;
}

/**
 * Test if rule matches token stream.
 *
 */
export const testRule = (
  tokens: Token[],
  index: number,
  rule: RuleSet,
): TestRuleResult => {
  const result: TestRuleResult = {
    match: false,
    position: null,
  };

  const tokenIndex =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    rule.shift !== undefined ? index + rule.shift : rule.position!;

  // we should never shift to negative indexes (rolling around to back of array)
  if (rule.shift !== undefined && tokenIndex < 0) return result;

  const token = getArrayItem(tokens, tokenIndex);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!token) return result;

  for (const key of Object.keys(rule) as (keyof typeof rule)[]) {
    if (key === "shift" || key === "position") continue;

    if (token[key as keyof Token] === undefined) return result;

    if (key === "children" && isArrayOfObjects(rule.children)) {
      if (token.children?.length === 0) return result;

      let match;
      const childTests = rule.children;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const children = token.children!;

      if (childTests.every((childTest) => childTest.position !== undefined)) {
        // positions instead of shifts, do not loop all children
        match = childTests.every(
          (childTest) =>
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            testRule(children, childTest.position!, childTest).match,
        );

        if (match) {
          // we may need position of child in transform
          const position = childTests[childTests.length - 1]?.position ?? 0;

          result.position =
            position >= 0 ? position : children.length + position;
        }
      } else {
        for (let token = 0; token < children.length; token++) {
          match = childTests.every(
            (childTest) => testRule(children, token, childTest).match,
          );

          if (match) {
            result.position = token;
            // all tests true, continue with next key of pattern t
            break;
          }
        }
      }

      if (match === false) return result;

      continue;
    }

    const ruleDetail = rule[key];

    switch (typeof ruleDetail) {
      case "boolean":
      case "number":
      case "string": {
        if (token[key] !== ruleDetail) return result;

        break;
      }

      case "function": {
        if (!(ruleDetail as TestFunction)(token[key])) return result;

        break;
      }

      // fall through for objects !== arrays of functions
      default: {
        if (isArrayOfFunctions(ruleDetail)) {
          if (
            !(ruleDetail as TestFunction[]).every((ruleItem) =>
              ruleItem(token[key]),
            )
          )
            return result;

          break;
        }

        throw new Error(
          `Unknown type of pattern test (key: ${key}). Test should be of type boolean, number, string, function or array of functions.`,
        );
      }
    }
  }

  // no tests returned false -> all tests returns true
  result.match = true;

  return result;
};
