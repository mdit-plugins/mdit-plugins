/**
 * Forked from https://github.com/linsir/markdown-it-task-checkbox/blob/master/index.js
 */

import type { PluginWithOptions } from "markdown-it";
import type { RuleCore } from "markdown-it/lib/parser_core.mjs";
import type StateCore from "markdown-it/lib/rules_core/state_core.mjs";
import type Token from "markdown-it/lib/token.mjs";

import type { MarkdownItTaskListOptions } from "./options.js";
import type { TaskListEnv } from "./types.js";
import {
  getParentTokenIndex,
  isInlineToken,
  isListItemToken,
  isParagraphToken,
  setTokenAttr,
} from "./utils.js";

interface TaskListStateCore extends StateCore {
  env: TaskListEnv;
}

const CHECKED_REG = /^\[[xX]\][ \u00A0]/;

// The leading whitespace in a list item (token.content) is already trimmed off by markdown-it.
// The regex below checks for '[ ] ' or '[x] ' or '[X] ' at the start of the string token.content,
// where the space is either a normal space or a non-breaking space (character 160 = \u00A0).
const startsWithTodoMarkdown = (token: Token): boolean => {
  const content = token.content;

  // minimal length is 4: "[ ] "
  if (content.length < 4) return false;

  if (content.charCodeAt(0) !== 91 /* [ */) return false;

  if (content.charCodeAt(2) !== 93 /* ] */) return false;

  const spacer = content.charCodeAt(3);

  if (spacer !== 32 /* space */ && spacer !== 160 /* \u00A0 */) return false;

  const contentChar = content.charCodeAt(1);

  return (
    contentChar === 32 /* space */ ||
    contentChar === 120 /* x */ ||
    contentChar === 88 /* X */ ||
    contentChar === 160 /* \u00A0 */
  );
};

const isTaskListItem = (tokens: Token[], index: number): boolean => {
  const token = tokens[index];

  if (index < 2) return false;

  return (
    isInlineToken(token) &&
    isParagraphToken(tokens[index - 1]) &&
    isListItemToken(tokens[index - 2]) &&
    startsWithTodoMarkdown(token)
  );
};

export const tasklist: PluginWithOptions<MarkdownItTaskListOptions> = (
  md,
  {
    disabled = true,
    label = true,
    containerClass = "task-list-container",
    itemClass = "task-list-item",
    checkboxClass = "task-list-item-checkbox",
    labelClass = "task-list-item-label",
  } = {},
) => {
  const taskListRule: RuleCore = (state: TaskListStateCore) => {
    const tokens = state.tokens;

    state.env.tasklistId ||= 0;

    for (let i = 2; i < tokens.length; i++) {
      if (isTaskListItem(tokens, i)) {
        const token = tokens[i];

        token.children ??= [];

        // remove the checkbox syntax letter
        token.children[0].content = token.children[0].content.slice(3);

        const id = `task-item-${state.env.tasklistId++}`;

        if (label) {
          // add label
          const labelToken = new state.Token("label_open", "label", 1);

          labelToken.attrs = [
            ["class", labelClass],
            ["for", id],
          ];

          token.children.unshift(labelToken);
          token.children.push(new state.Token("label_close", "label", -1));
        }

        const checkboxToken = new state.Token("checkbox_input", "input", 0);

        checkboxToken.attrs = [
          ["type", "checkbox"],
          ["class", checkboxClass],
          ["id", id],
        ];

        // if token.content starts with '[x] ' or '[X] '
        if (CHECKED_REG.test(token.content)) {
          checkboxToken.attrs.push(["checked", "checked"]);
        }

        if (disabled) checkboxToken.attrs.push(["disabled", "disabled"]);

        // checkbox
        token.children.unshift(checkboxToken);

        setTokenAttr(tokens[i - 2], "class", itemClass);
        setTokenAttr(tokens[getParentTokenIndex(tokens, i - 2)], "class", containerClass);
      }
    }

    return true;
  };

  md.core.ruler.after("inline", "task_list", taskListRule);
};
