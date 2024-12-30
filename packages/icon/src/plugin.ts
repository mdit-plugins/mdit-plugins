/**
 * ::icon-name:: ::icon-name fa-fw sm::
 * ::icon-name =24px:: ::icon-name =24pxx24px:: ::icon-name =x24px:: ::icon-name =24pxx::
 *
 * ::icon-name #000:: ::icon-name rgb(0,0,0):: ::icon-name hsl(30deg 82% 43%);::
 * ::icon-name var(--color)::
 */
import type { PluginWithOptions } from "markdown-it";
import type { RuleInline } from "markdown-it/lib/parser_inline.mjs";

import type { MarkdownItIconOptions } from "./options.js";
import type { IconMeta } from "./types.js";

const SIZE_RE = /=([^\s]+)/i;
const COLOR_RE =
  /\s(#[0-9a-f]{3,8})|\s((?:rgba?|hsla?|hwb|var)\(.*?\))|\s\/(\w+)/i;

export function parseIconSize(str: string): [string, string] {
  const [width, height] = str
    .replaceAll("px", "__")
    .split("x")
    .map((v) => {
      if (v) {
        v = v.replaceAll("__", "px");
        if (String(Number(v)) === String(v)) return `${v}px`;
      }

      return v;
    });

  return [width, height || width] as const;
}

export const parseIconContent = (info: string): IconMeta => {
  let size: [string, string] = ["", ""];
  let color = "";
  const [name, ...extra] = info
    .replace(SIZE_RE, (_, str: string) => {
      size = parseIconSize(str);

      return "";
    })
    .replace(COLOR_RE, (_, hex: string, func: string, named: string) => {
      color = hex || func || named;

      return "";
    })
    .trim()
    .split(/\s+/);

  return {
    name,
    color,
    width: size[0],
    height: size[1],
    extra: extra.join(" "),
  };
};

const defaultIconRender = (content: string): string => {
  const { name, color, width, height, extra } = parseIconContent(content);
  let style = "";

  if (color) style += `color:${color};`;
  if (width) style += `width:${width};`;
  if (height) style += `height:${height};`;

  return `<i class="${name}${extra ? ` ${extra}` : ""}"${style ? ` style="${style}"` : ""}></i>`;
};

const iconRule: RuleInline = (state, silent) => {
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

  const info = state.src.slice(start + 2, state.pos);

  // found
  state.posMax = state.pos;
  state.pos = start + 2;

  const icon = state.push("icon", "i", 0);

  icon.markup = "::";
  icon.content = info;

  state.pos = state.posMax + 2;
  state.posMax = max;

  return true;
};

export const icon: PluginWithOptions<MarkdownItIconOptions> = (
  md,
  { render = defaultIconRender } = {},
) => {
  md.inline.ruler.before("linkify", "icon", iconRule);

  md.renderer.rules.icon = (tokens, idx, _, env): string =>
    render(tokens[idx].content, env);
};
