import type MarkdownIt from "markdown-it";

import type {
  MarkdownItAttrRuleName,
  MarkdownItAttrsDefaultRuleName,
  MarkdownItAttrsExtensionRuleName,
  MarkdownItAttrsOptions,
} from "../options.js";
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

/**
 * Rule names enabled by `"all"`
 *
 * `"all"` 启用的规则名称
 */
export const DEFAULT_RULES: readonly MarkdownItAttrsDefaultRuleName[] = [
  "fence",
  "inline",
  "table",
  "list",
  "heading",
  "hr",
  "softbreak",
  "blockInfo",
  "blockEnd",
];

/**
 * Opt-in rules for third-party plugin interop - excluded from `"all"`
 *
 * 需显式启用的第三方插件交互规则，不包含在 `"all"` 中
 */
export const EXTENSION_RULES: readonly MarkdownItAttrsExtensionRuleName[] = ["tasklist", "dl"];

const SUPPORTED_RULES = new Set<MarkdownItAttrRuleName>([
  ...DEFAULT_RULES,
  ...EXTENSION_RULES,
  "block",
]);

export const createRules = (
  md: MarkdownIt,
  options: Required<MarkdownItAttrsOptions>,
): AttrRule[] => {
  const enabledRules: readonly MarkdownItAttrRuleName[] =
    // disable
    options.rule === false
      ? []
      : Array.isArray(options.rule)
        ? // user specific rules
          options.rule.filter((item: MarkdownItAttrRuleName) => SUPPORTED_RULES.has(item))
        : DEFAULT_RULES;

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
