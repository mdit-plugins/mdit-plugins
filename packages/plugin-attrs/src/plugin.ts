/** Forked and modified from https://github.com/arve0/markdown-it-attrs/ */

import MarkdownIt from "markdown-it";
import type { PluginWithOptions } from "markdown-it";
import type { RuleCore } from "markdown-it/lib/parser_core.mjs";

import { testRule } from "./helper/index.js";
import type { MarkdownItAttrsOptions } from "./options.js";
import type { DelimiterRange } from "./rules/index.js";
import { createRules } from "./rules/index.js";

export const attrs: PluginWithOptions<MarkdownItAttrsOptions> = (
  md,
  { left = "{", right = "}", allowed = [], rule = "all", fenceAttrsOnPre = true } = {},
) => {
  const rules = createRules(md, {
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

        const match = pattern.tests.every((test) => {
          const result = testRule(tokens, index, test);

          if (result.position != null) ({ position } = result);
          if (result.range) range = result.range;

          return result.match;
        });

        if (match) {
          const currentToken = tokens[index];

          // oxlint-disable-next-line typescript/no-non-null-assertion
          pattern.transform(tokens, index, position!, range!);

          // re-locate the current token in case the transform spliced tokens
          // before it (e.g. the table calculate rule removing covered cells)
          if (tokens[index] !== currentToken) index = tokens.indexOf(currentToken);

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

  // Place fence attributes on <pre> instead of <code>, but only when enabled
  // and no custom fence renderer is already present.
  if (fenceAttrsOnPre) {
    const defaultFence = new MarkdownIt().renderer.rules.fence;
    const currentFence = md.renderer.rules.fence;
    const hasCustomFence = typeof currentFence === "function" && currentFence !== defaultFence;

    if (!hasCustomFence && typeof currentFence === "function") {
      const originalFence = currentFence;

      md.renderer.rules.fence = (tokens, idx, mdOptions, env, slf): string => {
        const token = tokens[idx];
        const savedAttrs = token.attrs ? token.attrs.slice() : null;

        // Temporarily clear attrs so the default renderer does not place them
        // on <code>.
        token.attrs = null;
        const result = originalFence(tokens, idx, mdOptions, env, slf);

        token.attrs = savedAttrs;

        if (!savedAttrs || savedAttrs.length === 0) return result;

        // Inject user attrs into the opening <pre> tag.
        return result.replace(
          /^<pre(?<char>[ >])/,
          (_, ch) => `<pre${slf.renderAttrs(token)}${ch}`,
        );
      };
    }
  }
};
