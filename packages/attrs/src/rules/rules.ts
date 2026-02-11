import type MarkdownIt from "markdown-it";
import type { AttrRule } from "./types.js";
import type { MarkdownItAttrRuleName, MarkdownItAttrsOptions } from "../options.js";
import { createBlockRule } from "./block.js";
import { createFenceRule } from "./fence.js";
import { createHeadingRule } from "./heading.js";
import { createHrRule } from "./hr.js";
import { createInlineRules } from "./inline.js";
import { createListRules } from "./list.js";
import { createSoftBreakRule } from "./softbreak.js";
import { createTableRules } from "./table.js";

const AVAILABLE_RULES: MarkdownItAttrRuleName[] = [
  "fence",
  "inline",
  "table",
  "list",
  "heading",
  "hr",
  "softbreak",
  "block",
];

export const createRules = (
  md: MarkdownIt,
  options: Required<MarkdownItAttrsOptions>,
): AttrRule[] => {
  const enabledRules =
    // disable
    options.rule === false
      ? []
      : Array.isArray(options.rule)
        ? // user specific rules
          options.rule.filter((item) => AVAILABLE_RULES.includes(item))
        : AVAILABLE_RULES;

  const rules: AttrRule[] = [];

  if (enabledRules.includes("fence")) rules.push(createFenceRule(md, options));
  if (enabledRules.includes("inline")) rules.push(...createInlineRules(options));
  if (enabledRules.includes("table")) rules.push(...createTableRules(md, options));
  if (enabledRules.includes("list")) rules.push(...createListRules(md, options));
  if (enabledRules.includes("softbreak")) rules.push(createSoftBreakRule(options));
  if (enabledRules.includes("hr")) rules.push(createHrRule(md, options));
  if (enabledRules.includes("block")) rules.push(createBlockRule(md, options));
  // heading rule is fully covered by block rules
  else if (enabledRules.includes("heading")) rules.push(createHeadingRule(md, options));

  return rules;
};
