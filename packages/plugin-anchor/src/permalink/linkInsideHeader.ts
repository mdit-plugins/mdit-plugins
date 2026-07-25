import type StateCore from "markdown-it/lib/rules_core/state_core.mjs";
import type Token from "markdown-it/lib/token.mjs";

import {
  mergeDuplicateClassAttrs,
  permalinkSymbolMeta,
  position,
  renderAttrs,
  renderHref,
} from "../utils.js";
import type { LinkInsideHeaderPermalinkOptions, PermalinkGenerator } from "./types.js";

export const linkInsideHeader =
  ({
    class: className = "header-anchor",
    symbol = "#",
    renderHref: renderHrefFn = renderHref,
    renderAttrs: renderAttrsFn = renderAttrs,
    space = true,
    placement = "after",
    ariaHidden: isAriaHidden = false,
  }: LinkInsideHeaderPermalinkOptions = {}): PermalinkGenerator =>
  (slug, _anchorOpts, state: StateCore, idx: number) => {
    const href = renderHrefFn(slug, state);
    const extraAttrs = Object.entries(renderAttrsFn(slug, state));
    const attrs: [string, string | number][] = [];

    if (className) attrs.push(["class", className]);

    attrs.push(["href", href]);

    if (isAriaHidden) attrs.push(["aria-hidden", "true"]);

    for (const entry of extraAttrs) attrs.push(entry);

    const linkTokens: Token[] = [
      Object.assign(new state.Token("link_open", "a", 1), {
        attrs: mergeDuplicateClassAttrs(attrs),
      }),
      Object.assign(new state.Token("html_inline", "", 0), {
        content: symbol,
        meta: permalinkSymbolMeta,
      }),
      new state.Token("link_close", "a", -1),
    ];

    // oxlint-disable-next-line typescript/no-non-null-assertion
    const children = state.tokens[idx + 1].children!;

    // oxlint-disable-next-line typescript/strict-boolean-expressions
    if (space) {
      const spaceContent = typeof space === "string" ? space : " ";
      const spaceType = typeof space === "string" ? "html_inline" : "text";

      children[position[placement]](
        Object.assign(new state.Token(spaceType, "", 0), { content: spaceContent }),
      );
    }

    const isPush = position[placement] === "push";

    if (isPush) for (const linkToken of linkTokens) children.push(linkToken);
    else for (let i = linkTokens.length - 1; i >= 0; i--) children.unshift(linkTokens[i]);
  };
