import type MarkdownIt from "markdown-it";

import type { MarkdownItAttrRuleName, MarkdownItAttrsOptions } from "../options.js";
import { createBlockEndRule } from "./blockEnd.js";
import { createBlockInfoRule } from "./blockInfo.js";
import { createDlRules } from "./dl.js";
import { createFenceRule } from "./fence.js";
import { createHeadingRule } from "./heading.js";
import { createHrRule } from "./hr.js";
import { createInlineRules } from "./inline.js";
import { createListRules } from "./list.js";
import { createSoftBreakRule } from "./softbreak.js";
import { createTableRules } from "./table.js";
import { createTasklistRules } from "./tasklist.js";
import type { AttrRule } from "./types.js";

const AVAILABLE_RULES: MarkdownItAttrRuleName[] = [
  "fence",
  "inline",
  "table",
  "list",
  "heading",
  "hr",
  "softbreak",
  "blockInfo",
  "blockEnd",
  "block",
];

// Opt-in rules for third-party plugin interop - excluded from "all"
const EXTENSION_RULES = new Set<MarkdownItAttrRuleName>(["dl", "tasklist"]);

export const createRules = (
  md: MarkdownIt,
  options: Required<Omit<MarkdownItAttrsOptions, "fenceAttrsOnPre">>,
): AttrRule[] => {
  const enabledRules =
    // disable
    options.rule === false
      ? []
      : Array.isArray(options.rule)
        ? // user specific rules
          options.rule.filter((item) => AVAILABLE_RULES.includes(item) || EXTENSION_RULES.has(item))
        : AVAILABLE_RULES;

  const rules: AttrRule[] = [];

  if (enabledRules.includes("fence")) rules.push(createFenceRule(md, options));
  if (enabledRules.includes("inline")) rules.push(...createInlineRules(options));
  if (enabledRules.includes("table")) rules.push(...createTableRules(md, options));
  if (enabledRules.includes("list")) rules.push(...createListRules(md, options));
  if (enabledRules.includes("tasklist")) rules.push(...createTasklistRules(md, options));
  if (enabledRules.includes("dl")) rules.push(...createDlRules(md, options));
  if (enabledRules.includes("softbreak")) rules.push(createSoftBreakRule(options));
  if (enabledRules.includes("hr")) rules.push(createHrRule(md, options));
  if (enabledRules.includes("blockInfo")) rules.push(createBlockInfoRule(md, options));
  // `block` is the legacy alias of `blockEnd`
  if (enabledRules.includes("blockEnd") || enabledRules.includes("block"))
    rules.push(createBlockEndRule(md, options));
  // heading rule is fully covered by block rules
  else if (enabledRules.includes("heading")) rules.push(createHeadingRule(md, options));

  return rules;
};
