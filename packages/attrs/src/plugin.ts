/**
 * Forked and modified from https://github.com/arve0/markdown-it-attrs/
 */
import { getRules, testRule } from "./rules/index.js";

import type { PluginWithOptions } from "markdown-it";
import type { RuleCore } from "markdown-it/lib/parser_core.js";
import type { MarkdownItAttrsOptions } from "./options.js";

export const attrs: PluginWithOptions<MarkdownItAttrsOptions> = (
  md,
  { left = "{", right = "}", allowed = [], rule = "all" } = {}
) => {
  const rules = getRules({
    left,
    right,
    allowed,
    rule,
  });

  const attrsRule: RuleCore = ({ tokens }) => {
    for (let index = 0; index < tokens.length; index++)
      for (let ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
        const pattern = rules[ruleIndex];
        // position of child with offset 0
        let position: null | number = null;

        const match = pattern.tests.every((t) => {
          const result = testRule(tokens, index, t);

          if (result.position !== null) ({ position } = result);

          return result.match;
        });

        if (match) {
          pattern.transform(tokens, index, position!);

          if (
            pattern.name === "inline attributes" ||
            pattern.name === "inline nesting 0"
          )
            // retry, may be several inline attributes
            ruleIndex -= 1;
        }
      }
  };

  md.core.ruler.before("linkify", "attrs", attrsRule);
};
