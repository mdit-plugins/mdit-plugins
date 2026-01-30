import type Token from "markdown-it/lib/token.mjs";

import type { AttrRuleSet } from "../rules/types.js";
import { getArrayItem } from "../utils.js";

export interface TestRuleResult {
  /** whether rule matches token stream */
  match: boolean;
  /** position of token */
  position: null | number;
  range: [start: number, end: number] | null;
}

/**
 * Test if rule matches token stream.
 *
 * @param tokens - token stream
 * @param index - current token index
 * @param rule - rule to test
 *
 * @returns test result
 */
export const testRule = (tokens: Token[], index: number, rule: AttrRuleSet): TestRuleResult => {
  const testResult: TestRuleResult = {
    match: false,
    position: null,
    range: null,
  };
  const isShift = typeof rule.shift === "number";

  const tokenIndex = isShift ? index + rule.shift : rule.position;

  // we should never shift to negative indexes (rolling around to back of array)
  if (isShift && tokenIndex < 0) return testResult;

  const token = getArrayItem(tokens, tokenIndex);

  // oxlint-disable-next-line typescript/strict-boolean-expressions
  if (!token) return testResult;

  const ruleKeys = Object.keys(rule) as (keyof typeof rule)[];

  const ruleKeysLength = ruleKeys.length;

  for (let i = 0; i < ruleKeysLength; i++) {
    const key = ruleKeys[i];

    if (key === "shift" || key === "position") continue;

    // undefined and null are treated as non-existing keys
    // oxlint-disable-next-line eqeqeq, no-undefined
    if (token[key as keyof Token] == undefined) return testResult;

    if (key === "children" && Array.isArray(rule.children)) {
      // oxlint-disable-next-line typescript/strict-boolean-expressions
      if (!token.children?.length) return testResult;

      const childTests = rule.children;
      const children = token.children;
      let match;
      let range: [start: number, end: number] | null = null;

      if (childTests.every((childTest) => typeof childTest.position === "number")) {
        // positions instead of shifts, do not loop all children
        match = childTests.every((childTest) => {
          const result = testRule(children, childTest.position, childTest);

          if (!result.match) return false;

          if (result.range) range = result.range;

          return true;
        });

        if (match) {
          // get position of child
          const { position } = childTests[childTests.length - 1];

          testResult.position = position >= 0 ? position : children.length + position;

          // set pos data
          // oxlint-disable-next-line typescript/no-non-null-assertion
          testResult.range = range!;
        }
      } else {
        for (let childIndex = 0; childIndex < children.length; childIndex++) {
          // oxlint-disable-next-line no-loop-func
          match = childTests.every((childTest) => {
            const result = testRule(children, childIndex, childTest);

            if (!result.match) return false;

            if (result.range) range = result.range;

            return true;
          });

          if (match) {
            testResult.position = childIndex;
            // set pos data
            // oxlint-disable-next-line max-depth typescript/strict-boolean-expressions
            if (range) testResult.range = range;

            // all tests passes. so the check is successful
            break;
          }
        }
      }

      if (match === false) return testResult;

      continue;
    }

    // oxlint-disable-next-line typescript/no-unsafe-assignment
    const ruleDetail = rule[key];

    // oxlint-disable-next-line typescript/switch-exhaustiveness-check
    switch (typeof ruleDetail) {
      case "boolean":
      case "number":
      case "string": {
        if (token[key] !== ruleDetail) return testResult;

        break;
      }

      case "function": {
        // oxlint-disable-next-line typescript/no-unsafe-call
        const result = ruleDetail(token[key]) as boolean | [start: number, end: number];

        // oxlint-disable-next-line typescript/strict-boolean-expressions
        if (!result) return testResult;

        if (Array.isArray(result)) testResult.range = result;

        break;
      }

      // fall through for objects !== arrays of functions
      default: {
        throw new Error(
          `Unknown type of pattern test (key: ${key}). Test should be of type boolean, number, string or function.`,
        );
      }
    }
  }

  // no tests returned false -> all tests returns true
  testResult.match = true;

  return testResult;
};
