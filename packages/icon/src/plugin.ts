/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/**
 * ::icon-name::
 * ::icon-name 24px::
 * ::icon-name /#ccc::
 * ::icon-name 128px/#fff::
 */
import type { PluginWithOptions } from "markdown-it";
import type { RuleInline } from "markdown-it/lib/parser_inline.mjs";

import type { MarkdownItIconOptions } from "./options.js";
import type { IconMeta } from "./types.js";

function defaultAttrs({ name, size, color }: IconMeta): [string, string][] {
  return [
    ["class", "icon"],
    ["name", name],
    ["color", color || "currentColor"],
    ["width", size || "1em"],
    ["height", size || "1em"],
  ];
}

function tokenizer({
  tag = "span",
  attrs = defaultAttrs,
}: MarkdownItIconOptions): RuleInline {
  return (state, silent) => {
    let found = false;
    const max = state.posMax;
    const start = state.pos;

    // ::xxx
    // ^^
    if (
      state.src.charCodeAt(start) !== 0x3a ||
      state.src.charCodeAt(start + 1) !== 0x3a
    )
      return false;

    const next = state.src.charCodeAt(start + 2);

    // :: xxx  |  :::xxx
    //   ^     |    ^
    if (next === 0x20 || next === 0x3a) return false;

    if (silent) return false;

    // ::::
    if (max - start < 5) return false;

    state.pos = start + 2;

    while (state.pos < max) {
      // ::xxx::
      //      ^^
      if (
        state.src.charCodeAt(state.pos) === 0x3a &&
        state.src.charCodeAt(state.pos + 1) === 0x3a
      ) {
        found = true;
        break;
      }

      state.md.inline.skipToken(state);
    }

    if (
      !found ||
      start + 2 === state.pos ||
      // ::xxx ::
      //      ^
      state.src.charCodeAt(state.pos - 1) === 0x20
    ) {
      state.pos = start;

      return false;
    }
    const content = state.src.slice(start + 2, state.pos);

    // found
    state.posMax = state.pos;
    state.pos = start + 2;

    const [name, opt = ""] = content.split(" ");
    const [size, color] = opt.trim().split("/");

    const meta: IconMeta = { name, size, color };

    const icon = state.push("icon_open", tag, 1);

    icon.markup = "::";
    icon.attrs = [];

    if (typeof attrs === "function") {
      icon.attrs.push(
        ...attrs(meta).filter(([, value]) => typeof value !== "undefined"),
      );
    } else {
      icon.attrs.push(
        ...(Object.entries(attrs)
          .map(([key, value]) => [
            key,
            typeof value === "function" ? value(meta) : value,
          ])
          .filter(([, value]) => typeof value !== "undefined") as [
          string,
          string,
        ][]),
      );
    }

    const close = state.push("icon_close", tag, -1);

    close.markup = "::";

    state.pos = state.posMax + 2;
    state.posMax = max;

    return true;
  };
}

export const icon: PluginWithOptions<MarkdownItIconOptions> = (
  md,
  options = {},
) => md.inline.ruler.before("emphasis", "icon", tokenizer(options));
