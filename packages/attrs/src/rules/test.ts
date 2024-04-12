import type Token from "markdown-it/lib/token.mjs";

import type { RuleSet } from "./types.js";
import { getElements, isArrayOfFunctions, isArrayOfObjects } from "../utils.js";

/**
 * Test if rule matches token stream.
 *
 */
export const testRule = (
  tokens: Token[],
  index: number,
  rule: RuleSet,
): { match: boolean; position: null | number } => {
  const res = {
    match: false,
    position: null as number | null, // position of child
  };

  const ii = rule.shift !== undefined ? index + rule.shift : rule.position!;

  // we should never shift to negative indexes (rolling around to back of array)
  if (rule.shift !== undefined && ii < 0) return res;

  // supports negative ii
  const token = getElements(tokens, ii);

  if (token === undefined) return res;

  for (const key of Object.keys(rule) as (keyof typeof rule)[]) {
    if (key === "shift" || key === "position") continue;

    if (token[key as keyof Token] === undefined) return res;

    if (key === "children" && isArrayOfObjects(rule.children)) {
      if (token.children?.length === 0) return res;

      let match;
      const childTests = rule.children;
      const children = token.children!;

      if (childTests?.every((tt) => tt.position !== undefined)) {
        // positions instead of shifts, do not loop all children
        match = childTests.every(
          (tt) => testRule(children, tt.position!, tt).match,
        );

        if (match) {
          // we may need position of child in transform
          const j = childTests[childTests.length - 1]?.position || 0;

          res.position = j >= 0 ? j : children.length + j;
        }
      } else {
        for (let j = 0; j < children.length; j++) {
          match = childTests.every((tt) => testRule(children, j, tt).match);

          if (match) {
            res.position = j;
            // all tests true, continue with next key of pattern t
            break;
          }
        }
      }

      if (match === false) return res;

      continue;
    }

    const ruleDetail = rule[key];

    switch (typeof ruleDetail) {
      case "boolean":
      case "number":
      case "string":
        if (token[key] !== ruleDetail) return res;

        break;

      case "function":
        // @ts-ignore
        if (!ruleDetail(token[key])) return res;

        break;

      case "object":
        if (isArrayOfFunctions(ruleDetail)) {
          const r = ruleDetail.every((tt) =>
            (tt as (key: unknown) => boolean)(token[key]),
          );

          if (r === false) return res;

          break;
        }

        continue;

      // fall through for objects !== arrays of functions
      default:
        throw new Error(
          `Unknown type of pattern test (key: ${key}). Test should be of type boolean, number, string, function or array of functions.`,
        );
    }
  }

  // no tests returned false -> all tests returns true
  res.match = true;

  return res;
};
