import type StateCore from "markdown-it/lib/rules_core/state_core.mjs";
import type Token from "markdown-it/lib/token.mjs";

import {
  mergeDuplicateClassAttrs,
  permalinkSymbolMeta,
  position,
  renderAttrs,
  renderHref,
} from "../utils.js";
import type { LinkAfterHeaderPermalinkOptions, PermalinkGenerator } from "./types.js";

export const linkAfterHeader =
  ({
    class: className = "header-anchor",
    symbol = "#",
    style = "visually-hidden",
    assistiveText,
    visuallyHiddenClass,
    space = true,
    placement = "after",
    wrapper = null,
    renderHref: renderHrefFn = renderHref,
    renderAttrs: renderAttrsFn = renderAttrs,
  }: LinkAfterHeaderPermalinkOptions = {}): PermalinkGenerator =>
  (slug, _anchorOpts, state: StateCore, idx: number) => {
    if (!["visually-hidden", "aria-label", "aria-describedby", "aria-labelledby"].includes(style))
      throw new Error(`"permalink.linkAfterHeader" called with unknown style option "${style}"`);

    if (!["aria-describedby", "aria-labelledby"].includes(style) && !assistiveText) {
      throw new Error(
        `"permalink.linkAfterHeader" called without the "assistiveText" option in "${style}" style`,
      );
    }

    if (style === "visually-hidden" && !visuallyHiddenClass) {
      throw new Error(
        `"permalink.linkAfterHeader" called without the "visuallyHiddenClass" option in "visually-hidden" style`,
      );
    }

    // oxlint-disable-next-line typescript/no-non-null-assertion
    const headingChildren = state.tokens[idx + 1].children!;
    const title = headingChildren
      .filter((token) => token.type === "text" || token.type === "code_inline")
      .reduce((accumulator, token) => accumulator + token.content, "");

    const subLinkTokens: Token[] = [];
    const linkAttrs: [string, string | number][] = [];

    if (className) linkAttrs.push(["class", className]);

    const href = renderHrefFn(slug, state);
    const extraAttrs = Object.entries(renderAttrsFn(slug, state));

    linkAttrs.push(["href", href]);

    for (const entry of extraAttrs) linkAttrs.push(entry);

    if (style === "visually-hidden" && visuallyHiddenClass && assistiveText) {
      subLinkTokens.push(
        Object.assign(new state.Token("span_open", "span", 1), {
          attrs: [["class", visuallyHiddenClass]],
        }),
        Object.assign(new state.Token("text", "", 0), {
          content: assistiveText(title),
        }),
        new state.Token("span_close", "span", -1),
      );

      // oxlint-disable-next-line typescript/strict-boolean-expressions
      if (space) {
        const spaceContent = typeof space === "string" ? space : " ";
        const spaceType = typeof space === "string" ? "html_inline" : "text";

        subLinkTokens[position[placement]](
          Object.assign(new state.Token(spaceType, "", 0), { content: spaceContent }),
        );
      }

      subLinkTokens[position[placement]](
        Object.assign(new state.Token("span_open", "span", 1), {
          attrs: [["aria-hidden", "true"]],
        }),
        Object.assign(new state.Token("html_inline", "", 0), {
          content: symbol,
          meta: permalinkSymbolMeta,
        }),
        new state.Token("span_close", "span", -1),
      );
    } else {
      subLinkTokens.push(
        Object.assign(new state.Token("html_inline", "", 0), {
          content: symbol,
          meta: permalinkSymbolMeta,
        }),
      );
    }

    if (style === "aria-label" && assistiveText)
      linkAttrs.push(["aria-label", assistiveText(title)]);
    else if (["aria-describedby", "aria-labelledby"].includes(style)) linkAttrs.push([style, slug]);

    const linkToken = Object.assign(new state.Token("link_open", "a", 1), {
      attrs: mergeDuplicateClassAttrs(linkAttrs),
    });
    const linkTokens: Token[] = [linkToken];

    for (const subToken of subLinkTokens) linkTokens.push(subToken);

    linkTokens.push(new state.Token("link_close", "a", -1));

    for (let i = linkTokens.length - 1; i >= 0; i--) state.tokens.splice(idx + 3, 0, linkTokens[i]);

    if (wrapper) {
      state.tokens.splice(
        idx,
        0,
        Object.assign(new state.Token("html_block", "", 0), {
          content: `${wrapper[0]}\n`,
        }),
      );

      state.tokens.splice(
        idx + 3 + linkTokens.length + 1,
        0,
        Object.assign(new state.Token("html_block", "", 0), {
          content: `${wrapper[1]}\n`,
        }),
      );
    }
  };
