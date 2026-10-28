/** Forked from https://github.com/linsir/markdown-it-task-checkbox/blob/master/index.js */

import { hasRule } from "@mdit/helper";
import type { CoreRule, PluginWithOptions } from "@mdit/helper";
import type { Token } from "markdown-it";

import type { MarkdownItTaskListOptions } from "./options.js";
import {
  getParentTokenIndex,
  isInlineToken,
  isListItemToken,
  isParagraphToken,
  setTokenAttr,
} from "./utils.js";

// The leading whitespace in a list item (token.content) is already trimmed off by markdown-it.
// The regex below checks for '[ ] ' or '[x] ' or '[X] ' at the start of the string token.content,
// where the space is either a normal space or a non-breaking space (character 160 = \u00A0).
const startsWithTodoMarkdown = (token: Token): "checked" | boolean => {
  const content = token.content;

  // minimal length is 4: "[ ] "
  if (content.length < 4) return false;

  if (content.charCodeAt(0) !== 91 /* [ */) return false;

  if (content.charCodeAt(2) !== 93 /* ] */) return false;

  const spacer = content.charCodeAt(3);

  if (spacer !== 32 /* space */ && spacer !== 160 /* \u00A0 */) return false;

  const contentChar = content.charCodeAt(1);

  if (contentChar === 120 /* x */ || contentChar === 88 /* X */) return "checked";

  return contentChar === 32 /* space */ || contentChar === 160; /* \u00A0 */
};

// The checkbox marker takes the first three characters of the inline content: `[ ]`, `[x]` or `[X]`.
// It is normally part of the first text token. However, when `[x]` matches a link reference
// definition, markdown-it parses the marker as a link (`link_open`, text `x`, `link_close`), so
// that whole link has to be removed instead.
const removeTodoMarker = (children: Token[]): void => {
  if (children[0].type === "text") {
    children[0].content = children[0].content.slice(3);
    return;
  }

  children.splice(0, 3);
};

export const tasklist: PluginWithOptions<MarkdownItTaskListOptions> = (md, options = {}) => {
  // Registering the core rule twice would wrap the same inline token again, producing nested
  // labels and duplicated checkboxes.
  if (hasRule(md, "task_list", "core")) return;

  const {
    disabled = true,
    label = true,
    containerClass = "task-list-container",
    itemClass = "task-list-item",
    checkboxClass = "task-list-item-checkbox",
    labelClass = "task-list-item-label",
  } = options;

  const taskListRule: CoreRule = (state) => {
    const tokens = state.tokens;

    for (let index = 2; index < tokens.length; index++) {
      const token = tokens[index];

      // check if the token is an inline token inside a list item and starts with todo markdown
      if (
        !isInlineToken(token) ||
        !isParagraphToken(tokens[index - 1]) ||
        !isListItemToken(tokens[index - 2])
      )
        continue;

      const todoState = startsWithTodoMarkdown(token);

      if (todoState === false) continue;

      token.children ??= [];

      // remove the checkbox syntax letter
      removeTodoMarker(token.children);

      const checkboxToken = new state.Token("checkbox_input", "input", 0);

      // No `id`/`for` attributes are emitted: ids are per document and would collide when multiple
      // documents are rendered on the same page. Nesting the input inside the label keeps the
      // native label/checkbox association without any document-scoped identifier.
      checkboxToken.attrs = [
        ["type", "checkbox"],
        ["class", checkboxClass],
      ];

      // if token.content starts with '[x] ' or '[X] '
      if (todoState === "checked") checkboxToken.attrs.push(["checked", "checked"]);

      if (disabled) checkboxToken.attrs.push(["disabled", "disabled"]);

      // checkbox, placed before the label is unshifted so that it ends up inside the label
      token.children.unshift(checkboxToken);

      if (label) {
        const labelToken = new state.Token("label_open", "label", 1);

        labelToken.attrs = [["class", labelClass]];

        token.children.unshift(labelToken);
        token.children.push(new state.Token("label_close", "label", -1));
      }

      setTokenAttr(tokens[index - 2], "class", itemClass);
      setTokenAttr(tokens[getParentTokenIndex(tokens, index - 2)], "class", containerClass);
    }
  };

  md.core.ruler.after("inline", "task_list", taskListRule);
};
