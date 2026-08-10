/**
 * Simulated plugins that inject inline children before the attrs rule runs.
 *
 * They register with `md.core.ruler.before("linkify", ...)` so they run ahead of the attrs rule -
 * real plugins with this ordering exist, but e.g. `@mdit/plugin-anchor` pushes its rule to the end
 * of the core chain and runs after the attrs rule, so it cannot reproduce it.
 */
import type { MarkdownIt } from "markdown-it";

/**
 * Simulate a navigation / heading anchor plugin appending a permalink after the heading text, so
 * the attribute text is no longer the last child of the inline token
 *
 * @param md - The markdown-it instance to install the rule on
 */
export const headingAnchorPlugin = (md: MarkdownIt): void => {
  md.core.ruler.before("linkify", "heading_anchor_test", (state) => {
    state.tokens.forEach((token, index) => {
      if (token.type !== "heading_open") return;

      const space = new state.Token("text", "", 0);

      space.content = " ";

      const anchorOpen = new state.Token("link_open", "a", 1);

      anchorOpen.attrs = [["href", "#"]];

      const anchorSymbol = new state.Token("html_inline", "", 0);

      anchorSymbol.content = "#";

      const anchorClose = new state.Token("link_close", "a", -1);

      state.tokens[index + 1].children?.push(space, anchorOpen, anchorSymbol, anchorClose);
    });
  });
};

/**
 * Simulate a plugin appending a whitespace-only text token after the attribute text
 *
 * @param md - The markdown-it instance to install the rule on
 */
export const trailingSpacePlugin = (md: MarkdownIt): void => {
  md.core.ruler.before("linkify", "trailing_space_test", (state) => {
    state.tokens.forEach((token) => {
      if (token.type !== "inline") return;

      const space = new state.Token("text", "", 0);

      space.content = " ";
      token.children?.push(space);
    });
  });
};

/**
 * Simulate a plugin appending an opening tag without its closing counterpart
 *
 * @param md - The markdown-it instance to install the rule on
 */
export const unmatchedOpenPlugin = (md: MarkdownIt): void => {
  md.core.ruler.before("linkify", "unmatched_open_test", (state) => {
    state.tokens.forEach((token) => {
      if (token.type !== "inline") return;

      token.children?.push(new state.Token("link_open", "a", 1));
    });
  });
};
