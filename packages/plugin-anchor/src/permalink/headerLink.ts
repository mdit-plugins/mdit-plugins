import type StateCore from "markdown-it/lib/rules_core/state_core.mjs";
import type Token from "markdown-it/lib/token.mjs";

import { mergeDuplicateClassAttrs, renderAttrs, renderHref } from "../utils.js";
import type { HeaderLinkPermalinkOptions, PermalinkGenerator } from "./types.js";

// Detects a raw `<a>` opening tag (`<a>` or `<a ...`, case-insensitive) inside
// an `html_inline` token, which appears when `html: true` is enabled. Matches
// markdown-it's `isLinkOpen` semantics (`/^<a[>\s]/i`).
const isRawAnchorTag = (content: string): boolean =>
  content.charCodeAt(0) === 60 /* < */ &&
  (content.charCodeAt(1) === 97 /* a */ || content.charCodeAt(1) === 65) /* A */ &&
  (content.charCodeAt(2) === 62 /* > */ || content.charCodeAt(2) <= 32); /* whitespace */

export const headerLink =
  ({
    class: className = "header-anchor",
    safariReaderFix = false,
    renderHref: renderHrefFn = renderHref,
    renderAttrs: renderAttrsFn = renderAttrs,
  }: HeaderLinkPermalinkOptions = {}): PermalinkGenerator =>
  (slug, _anchorOpts, state: StateCore, idx: number) => {
    const originalInlineToken = state.tokens[idx + 1];
    // oxlint-disable-next-line typescript/no-non-null-assertion
    const originalChildren = originalInlineToken.children!;

    // Wrapping a heading that already contains a link would produce invalid
    // nested `<a><a>…</a></a>` markup, so leave such headings untouched. This
    // covers both markdown links (`link_open`) and raw `<a>` tags under
    // `html: true` (`html_inline`).
    if (
      originalChildren.some(
        (token) =>
          token.type === "link_open" ||
          (token.type === "html_inline" && isRawAnchorTag(token.content)),
      )
    )
      return;

    const href = renderHrefFn(slug, state);
    const extraAttrs = Object.entries(renderAttrsFn(slug, state));
    const attrs: [string, string | number][] = [];

    if (className) attrs.push(["class", className]);

    attrs.push(["href", href]);

    for (const entry of extraAttrs) attrs.push(entry);

    const linkTokens: Token[] = [
      Object.assign(new state.Token("link_open", "a", 1), {
        attrs: mergeDuplicateClassAttrs(attrs),
      }),
    ];

    if (safariReaderFix) linkTokens.push(new state.Token("span_open", "span", 1));

    for (const child of originalChildren) linkTokens.push(child);

    if (safariReaderFix) linkTokens.push(new state.Token("span_close", "span", -1));

    linkTokens.push(new state.Token("link_close", "a", -1));

    // Preserve original token properties (level, map, block, etc.)
    state.tokens[idx + 1] = Object.assign(new state.Token("inline", "", 0), originalInlineToken, {
      children: linkTokens,
    });
  };
