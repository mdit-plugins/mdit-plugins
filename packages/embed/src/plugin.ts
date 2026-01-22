import type MarkdownIt from "markdown-it";
import type { PluginWithOptions } from "markdown-it";
import { isSpace } from "markdown-it/lib/common/utils.mjs";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";
import type { RuleInline } from "markdown-it/lib/parser_inline.mjs";
import type Token from "markdown-it/lib/token.mjs";

import type { EmbedConfig, MarkdownItEmbedOptions } from "./options.js";

const checkInlineOpeningMarker = (src: string, current: number): boolean => {
  if (src.charCodeAt(current) !== 123 /* { */ || src.charCodeAt(current + 1) !== 37 /* % */)
    return false;

  // Check if the opening marker was escaped
  let pos = current - 1;
  let backslashCount = 0;

  while (pos >= 0 && src.charCodeAt(pos) === 92 /* \ */) {
    backslashCount++;
    pos--;
  }

  // If opening {% is escaped (odd number of preceding backslashes), don't parse
  if (backslashCount % 2 === 1) return false;

  return true;
};

const checkClosingMarker = (src: string, current: number): boolean =>
  src.charCodeAt(current) === 37 /* % */ && src.charCodeAt(current + 1) === 125; /* } */

/*
 * Parse inline embed with bracket syntax: {%...%}
 */
const getEmbedInline =
  (inlineEmbedMap: Map<string, EmbedConfig>): RuleInline =>
  (state, silent) => {
    const start = state.pos;
    const max = state.src.length;

    // minimum length check for inline embed - at least 5 characters: {%x%}
    if (max - start < 5) return false;

    // check opening marker
    if (!checkInlineOpeningMarker(state.src, start)) return false;

    let contentStart = start + 2; // Move past the opening {% marker

    // skip spaces
    while (contentStart < max) {
      if (!isSpace(state.src.charCodeAt(contentStart))) break;
      contentStart++;
    }

    let contentEnd = contentStart;
    let found = false;

    for (; contentEnd + 1 < max; contentEnd++) {
      // must not include opening marker
      if (checkInlineOpeningMarker(state.src, contentEnd)) return false;
      if (checkClosingMarker(state.src, contentEnd)) {
        found = true;
        break;
      }
    }

    // No closing marker found
    if (!found) return false;

    // get first space
    let spacer = contentStart + 1;

    while (spacer < contentEnd) {
      if (isSpace(state.src.charCodeAt(spacer))) break;
      spacer++;
    }

    // Extract embed name
    const name = state.src.slice(contentStart, spacer);

    // Check if embed name exists in the map
    if (!inlineEmbedMap.has(name)) return false;

    if (!silent) {
      const token = state.push("embed_inline", "embed", 0);
      const params = spacer
        ? state.src
            .slice(spacer + 1, contentEnd)
            .trim()
            .replace(/\\{%/g, "{%")
            .replace(/%\\}/g, "%}")
        : "";

      token.markup = "{% %}";
      token.info = name;
      token.content = params;
    }

    // Move past the closing %} marker
    state.pos = contentEnd + 2;

    return true;
  };

/*
 * Parse block embed with syntax: {% ... %}
 */
const getEmbedBlock =
  (embedMap: Map<string, EmbedConfig>): RuleBlock =>
  (state, startLine, _, silent) => {
    const start = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];
    const { src } = state;

    // minimum length check for block embed - at least 5 characters: {%x%}
    if (max - start < 5) return false;

    // check opening marker
    if (
      state.src.charCodeAt(start) !== 123 /* { */ ||
      state.src.charCodeAt(start + 1) !== 37 /* % */
    )
      return false;

    max = state.skipSpacesBack(max, start);

    const contentEnd = max - 2;

    if (!checkClosingMarker(src, contentEnd)) return false;

    let contentStart = start + 2;

    // skip spaces
    while (contentStart < contentEnd) {
      if (!isSpace(state.src.charCodeAt(contentStart))) break;
      contentStart++;
    }

    let spacer = -1;

    for (let pos = contentStart; pos + 1 < contentEnd; pos++) {
      // must not include unescaped opening marker or closing marker
      if (checkInlineOpeningMarker(state.src, pos)) return false;
      if (checkClosingMarker(state.src, pos)) return false;
      if (spacer !== -1) continue;
      if (isSpace(state.src.charCodeAt(pos))) spacer = pos;
    }

    // Extract content between {% and %}
    const name =
      spacer === -1
        ? state.src.slice(contentStart, contentEnd + 1).trimEnd()
        : state.src.slice(contentStart, spacer);

    // Check if embed name exists in the map
    if (!embedMap.has(name)) return false;

    if (silent) return true;

    const params =
      spacer === -1
        ? ""
        : state.src
            .slice(spacer + 1, contentEnd)
            .trim()
            .replace(/\\{%/g, "{%")
            .replace(/%\\}/g, "%}");

    const token = state.push("embed_block", "embed", 0);

    token.block = true;
    token.info = name;
    token.content = params;
    token.map = [startLine, startLine + 1];
    token.markup = "{% %}";

    // Advance to the next line
    state.line = startLine + 1;

    return true;
  };

export const embed: PluginWithOptions<MarkdownItEmbedOptions> = (md, options) => {
  if (typeof options !== "object" || !Array.isArray(options.config))
    throw new Error("[@mdit/plugin-embed]: config is required and must be an array.");

  // Get existing maps or create new ones to support multiple plugin instances
  const mdWithMaps = md as MarkdownIt & {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __embedMap?: Map<string, EmbedConfig>;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __inlineEmbedMap?: Map<string, EmbedConfig>;
  };

  const embedMap = (mdWithMaps.__embedMap ??= new Map<string, EmbedConfig>());
  const inlineEmbedMap = (mdWithMaps.__inlineEmbedMap ??= new Map<string, EmbedConfig>());

  options.config.forEach((item) => {
    embedMap.set(item.name, item);
    // Inline embeds are only supported when allowInline is true
    if (item.allowInline) inlineEmbedMap.set(item.name, item);
  });

  // Only register rules if not already registered
  // check embed_block rules here
  if (!("embed_block" in md.renderer.rules)) {
    // Register the block rule
    md.block.ruler.before("paragraph", "embed_block", getEmbedBlock(embedMap), {
      alt: ["paragraph", "reference", "blockquote", "list"],
    });

    // Register the renderers
    md.renderer.rules.embed_block = (tokens: Token[], index: number): string => {
      const token = tokens[index];

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return embedMap.get(token.info)!.setup(token.content, false);
    };
  }

  // only register embed_inline rules if inline embeds are allowed
  if (inlineEmbedMap.size && !("embed_inline" in md.renderer.rules)) {
    // Register the inline rule
    md.inline.ruler.before("emphasis", "embed_inline", getEmbedInline(inlineEmbedMap));

    md.renderer.rules.embed_inline = (tokens: Token[], index: number): string => {
      const token = tokens[index];

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return inlineEmbedMap.get(token.info)!.setup(token.content, true);
    };
  }
};
