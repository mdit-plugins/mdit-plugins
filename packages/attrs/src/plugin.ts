/**
 * Forked and modified from https://github.com/arve0/markdown-it-attrs/
 */

import type { PluginWithOptions } from "markdown-it";
import type { RuleCore } from "markdown-it/lib/parser_core.mjs";

import { testRule } from "./helper/index.js";
import type { MarkdownItAttrsOptions } from "./options.js";
import type { DelimiterRange } from "./rules/index.js";
import { getRules } from "./rules/index.js";

export const attrs: PluginWithOptions<MarkdownItAttrsOptions> = (
  md,
  { left = "{", right = "}", allowed = [], rule = "all" } = {},
) => {
  const rules = getRules({
    left,
    right,
    allowed,
    rule,
  });

  const attrsRule: RuleCore = (state) => {
    const tokens = state.tokens;

    for (let index = 0; index < tokens.length; index++) {
      for (let ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
        const pattern = rules[ruleIndex];
        // position of child with offset 0
        let position: null | number = null;
        let range: DelimiterRange | null = null;

        // oxlint-disable-next-line no-loop-func
        const match = pattern.tests.every((test) => {
          const result = testRule(tokens, index, test);

          if (result.position != null) ({ position } = result);
          if (result.range) range = result.range;

          return result.match;
        });

        if (match) {
          // oxlint-disable-next-line typescript/no-non-null-assertion
          pattern.transform(tokens, index, position!, range!);

          if (
            pattern.name === "inline attributes" ||
            pattern.name === "inline nesting self-close"
          ) {
            // retry, may be several inline attributes
            ruleIndex--;
          }
        }
      }
    }
  };

  md.core.ruler.before("linkify", "attrs", attrsRule);
};
