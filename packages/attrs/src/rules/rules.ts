import type { Rule } from "./types.js";
import type {
  MarkdownItAttrRuleName,
  MarkdownItAttrsOptions,
} from "../options.js";
import { getBlockRule } from "./block.js";
import { getFenceRule } from "./fence.js";
import { getHrRule } from "./hr.js";
import { getInlineRules } from "./inline.js";
import { getListRules } from "./list.js";
import { getSoftBreakRule } from "./softbreak.js";
import { getTableRules } from "./table.js";

const AVAILABLE_RULES: MarkdownItAttrRuleName[] = [
  "fence",
  "inline",
  "table",
  "list",
  "hr",
  "softbreak",
  "block",
];

export const getRules = (options: Required<MarkdownItAttrsOptions>): Rule[] => {
  const enabledRules =
    // disable
    options.rule === false
      ? []
      : Array.isArray(options.rule)
        ? // user specific rules
          options.rule.filter((item) => AVAILABLE_RULES.includes(item))
        : AVAILABLE_RULES;

  const rules: Rule[] = [];

  if (enabledRules.includes("fence")) rules.push(getFenceRule(options));
  if (enabledRules.includes("inline")) rules.push(...getInlineRules(options));
  if (enabledRules.includes("table")) rules.push(...getTableRules(options));
  if (enabledRules.includes("list")) rules.push(...getListRules(options));
  if (enabledRules.includes("softbreak")) rules.push(getSoftBreakRule(options));
  if (enabledRules.includes("hr")) rules.push(getHrRule(options));
  if (enabledRules.includes("block")) rules.push(getBlockRule(options));

  return rules;
};
