import { hasRule } from "@mdit/helper";
import type { BlockRule, InlineRule, PluginWithOptions } from "@mdit/helper";
import type { MarkdownIt } from "markdown-it";

import type { EmbedConfig, MarkdownItEmbedOptions } from "./options.js";

const ESCAPED_OPENING_MARKER_REGEXP = /\\{%/g;
const ESCAPED_CLOSING_MARKER_REGEXP = /%\\}/g;

const isEscapedMarker = (src: string, current: number): boolean => {
  // Check if the marker at `current` is escaped
  let pos = current - 1;
  let backslashCount = 0;

  while (pos >= 0 && src.charCodeAt(pos) === 92 /* \ */) {
    backslashCount++;
    pos--;
  }

  // If the marker is escaped (odd number of preceding backslashes), don't parse
  return backslashCount % 2 === 1;
};

const checkInlineOpeningMarker = (src: string, current: number): boolean =>
  src.charCodeAt(current) === 123 /* { */ &&
  src.charCodeAt(current + 1) === 37 /* % */ &&
  !isEscapedMarker(src, current);

const checkClosingMarker = (src: string, current: number): boolean =>
  src.charCodeAt(current) === 37 /* % */ && src.charCodeAt(current + 1) === 125; /* } */

// Restore the escaped markers inside embed params. The string copy can be skipped entirely
// when there is no backslash, which is the common case.
const unescapeMarkers = (content: string): string =>
  content.includes("\\")
    ? content
        .replaceAll(ESCAPED_OPENING_MARKER_REGEXP, "{%")
        .replaceAll(ESCAPED_CLOSING_MARKER_REGEXP, "%}")
    : content;

/*
 * Parse inline embed with bracket syntax: {%...%}
 */
const createInlineEmbedRule =
  (inlineEmbedMap: Map<string, EmbedConfig>): InlineRule =>
  (state, silent) => {
    const isSpace = state.md.utils.isSpace;
    const src = state.src;
    const start = state.pos;
    const max = state.posMax;

    // minimum length check for inline embed - at least 5 characters: {%x%}
    // In silent mode markdown-it is only probing for a link/image label end,
    // so scanning (and consuming) the embed could swallow the closing `]`.
    if (silent || max - start < 5) return false;

    // check opening marker
    if (!checkInlineOpeningMarker(src, start)) return false;

    let contentStart = start + 2; // Move past the opening {% marker

    // skip spaces
    while (contentStart < max) {
      if (!isSpace(src.charCodeAt(contentStart))) break;

      contentStart++;
    }

    let contentEnd = contentStart;
    let spacer = -1;
    let found = false;

    // A single pass reads each character once: find the closing marker, reject nested opening
    // markers, and remember the first space that separates the name from the params.
    for (; contentEnd + 1 < max; contentEnd++) {
      const code = src.charCodeAt(contentEnd);

      if (code === 123 /* { */) {
        // must not include an unescaped opening marker
        if (src.charCodeAt(contentEnd + 1) === 37 /* % */ && !isEscapedMarker(src, contentEnd))
          return false;
      } else if (code === 37 /* % */ && src.charCodeAt(contentEnd + 1) === 125 /* } */) {
        found = true;
        break;
      }

      if (spacer === -1 && isSpace(code)) spacer = contentEnd;
    }

    // No closing marker found
    if (!found) return false;

    // Without a space the name runs up to the closing marker; `Math.max` also keeps the historical
    // behavior when the marker directly follows the skipped spaces.
    if (spacer === -1) spacer = Math.max(contentStart + 1, contentEnd);

    // Extract embed name
    const name = src.slice(contentStart, spacer);

    // Check if embed name exists in the map
    if (!inlineEmbedMap.has(name)) return false;

    const token = state.push("embed_inline", "embed", 0);
    const params =
      spacer < contentEnd ? unescapeMarkers(src.slice(spacer + 1, contentEnd).trim()) : "";

    token.markup = "{% %}";
    token.info = name;
    token.content = params;

    // Move past the closing %} marker
    state.pos = contentEnd + 2;

    return true;
  };

/*
 * Parse block embed with syntax: {% ... %}
 */
const createBlockEmbedRule =
  (embedMap: Map<string, EmbedConfig>): BlockRule =>
  (state, startLine, _, silent) => {
    const isSpace = state.md.utils.isSpace;
    const src = state.src;
    const start = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];

    // minimum length check for block embed - at least 5 characters: {%x%}
    if (max - start < 5) return false;

    // check opening marker
    if (src.charCodeAt(start) !== 123 /* { */ || src.charCodeAt(start + 1) !== 37 /* % */)
      return false;

    max = state.skipSpacesBack(max, start);

    const contentEnd = max - 2;

    if (!checkClosingMarker(src, contentEnd)) return false;

    let contentStart = start + 2;

    // skip spaces
    while (contentStart < contentEnd) {
      if (!isSpace(src.charCodeAt(contentStart))) break;

      contentStart++;
    }

    let spacer = -1;

    // A single pass reads each character once: reject nested markers and find the spacer that
    // separates the embed name from its params.
    for (let pos = contentStart; pos + 1 < contentEnd; pos++) {
      const code = src.charCodeAt(pos);

      // must not include unescaped opening marker or closing marker
      if (code === 123 /* { */) {
        if (src.charCodeAt(pos + 1) === 37 /* % */ && !isEscapedMarker(src, pos)) return false;
      } else if (code === 37 /* % */ && src.charCodeAt(pos + 1) === 125 /* } */) {
        return false;
      }

      if (spacer === -1 && isSpace(code)) spacer = pos;
    }

    // Extract content between {% and %}
    const name =
      spacer === -1
        ? src.slice(contentStart, contentEnd).trimEnd()
        : src.slice(contentStart, spacer);

    // Check if embed name exists in the map
    if (!embedMap.has(name)) return false;

    // Fallback to inline if it's an inline-allowed embed without params
    // oxlint-disable-next-line typescript/no-non-null-assertion
    if (spacer === -1 && embedMap.get(name)!.allowInline) return false;

    if (silent) return true;

    const params = spacer === -1 ? "" : unescapeMarkers(src.slice(spacer + 1, contentEnd).trim());

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
  if (typeof options !== "object" || options == null || !Array.isArray(options.config))
    throw new TypeError("[@mdit/plugin-embed]: config is required and must be an array.");

  // Get existing maps or create new ones to support multiple plugin instances
  const mdWithMaps = md as MarkdownIt & {
    __embedMap?: Map<string, EmbedConfig>;
    __inlineEmbedMap?: Map<string, EmbedConfig>;
  };

  // oxlint-disable-next-line no-underscore-dangle
  const embedMap = (mdWithMaps.__embedMap ??= new Map<string, EmbedConfig>());
  // oxlint-disable-next-line no-underscore-dangle
  const inlineEmbedMap = (mdWithMaps.__inlineEmbedMap ??= new Map<string, EmbedConfig>());

  options.config.forEach((item) => {
    embedMap.set(item.name, item);
    // Inline embeds are only supported when allowInline is true
    if (item.allowInline) inlineEmbedMap.set(item.name, item);
    // Drop any inline entry left by a previous installation of the same name
    else inlineEmbedMap.delete(item.name);
  });

  // Repeated installation must not register the rules twice; a differing configuration keeps
  // the first installation's parse rules (renderers are still refreshed).
  if (!hasRule(md, "embed_block", "block")) {
    // Register the block rule
    md.block.ruler.before("paragraph", "embed_block", createBlockEmbedRule(embedMap), {
      alt: ["paragraph", "reference", "blockquote", "list"],
    });
  }

  if (!("embed_block" in md.renderer.rules)) {
    // Register the block renderer
    md.renderer.rules.embed_block = (tokens, index): string => {
      const token = tokens[index];

      // oxlint-disable-next-line typescript/no-non-null-assertion
      return embedMap.get(token.info)!.setup(token.content, false);
    };
  }

  // only register embed_inline rules if inline embeds are allowed
  if (inlineEmbedMap.size > 0) {
    if (!hasRule(md, "embed_inline", "inline")) {
      // Register the inline rule
      md.inline.ruler.before("emphasis", "embed_inline", createInlineEmbedRule(inlineEmbedMap));
    }

    if (!("embed_inline" in md.renderer.rules)) {
      md.renderer.rules.embed_inline = (tokens, index): string => {
        const token = tokens[index];
        const config = inlineEmbedMap.get(token.info);

        // `config` can be missing when tokens were parsed before a later
        // installation dropped the inline entry: render the source literally
        // instead of crashing. Rendering a stale token stream is harmless as long
        // as the text is escaped.
        if (!config) {
          return md.utils.escapeHtml(
            `{% ${token.info}${token.content ? ` ${token.content}` : ""} %}`,
          );
        }

        return config.setup(token.content, true);
      };
    }
  }
};
