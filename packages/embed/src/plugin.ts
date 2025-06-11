import type MarkdownIt from "markdown-it";
import type { PluginWithOptions } from "markdown-it";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";
import type { RuleInline } from "markdown-it/lib/parser_inline.mjs";
import type Token from "markdown-it/lib/token.mjs";

import type { EmbedConfig, MarkdownItEmbedOptions } from "./options.js";

/*
 * Parse inline math with bracket syntax: {%...%}
 */
const getEmbedInline =
  (inlineEmbedMap: Map<string, EmbedConfig>): RuleInline =>
  (state, silent) => {
    const start = state.pos;
    const max = state.src.length;

    // minimum length check for inline embed - at least 7 characters
    if (max - start < 7) return false;

    // check opening marker
    if (
      state.src.charAt(start) !== "{" ||
      state.src.charAt(start + 1) !== "%" ||
      (state.src.charAt(start + 2) !== " " &&
        state.src.charAt(start + 2) !== "\t")
    )
      return false;

    // Check if the opening marker was escaped
    let pos = start - 1;
    let backslashCount = 0;

    while (pos >= 0 && state.src.charAt(pos) === "\\") {
      backslashCount++;
      pos--;
    }

    // If opening {% is escaped (odd number of preceding backslashes), don't parse
    if (backslashCount % 2 === 1) return false;

    // Move past "{% "
    pos = start + 3;
    let char: string;

    // Skip spaces after "{% "
    for (; pos < max; pos++) {
      char = state.src.charAt(pos);
      if (char !== " " && char !== "\t") break;
    }

    const embedNameStart = pos;

    // go th embed name until space or tab
    for (; pos < max; pos++) {
      char = state.src.charAt(pos);
      // if we hit a marker char before a space or tab, quit
      if (char === "%" && state.src.charAt(pos + 1) === "}") return false;
      if (char === " " || char === "\t") break;
    }

    const embedName = state.src.slice(embedNameStart, pos);

    if (!embedName || !inlineEmbedMap.has(embedName)) return false;

    let params = "";

    // looking for a direct closing " %}"
    if (pos + 3 === max) {
      // check closing marker
      if (
        state.src.charAt(pos + 1) !== "%" ||
        state.src.charAt(pos + 2) !== "}"
      )
        return false;

      state.pos = pos + 2;
    } else {
      // Skip spaces after embed name
      for (; pos < max; pos++) {
        char = state.src.charAt(pos);
        if (char !== " " && char !== "\t") break;
      }

      const contentStart = pos;

      let found = false;

      for (; pos + 2 < max; pos++) {
        char = state.src.charAt(pos);
        // a valid closing marker found
        if (
          state.src.charAt(pos + 1) === "%" &&
          state.src.charAt(pos + 2) === "}"
        ) {
          // if we hit a marker char before a space or tab, quit
          if (char !== " " && char !== "\t") return false;
          found = true;
          break;
        }
      }

      if (!found) return false;

      params = state.src.slice(contentStart, pos).trim();
      state.pos = pos + 3;
    }

    if (!silent) {
      const token = state.push("embed_inline", "embed", 0);

      token.markup = "{% %}";
      token.info = embedName;
      token.content = params;
    }

    return true;
  };

/*
 * Parse block embed with syntax: {% ... %}
 */
const getEmbedBlock =
  (embedMap: Map<string, EmbedConfig>): RuleBlock =>
  (state, start, _end, silent) => {
    const lineStart = state.bMarks[start] + state.tShift[start];
    const lineMax = state.eMarks[start];

    if (lineMax - lineStart < 7) return false;

    // Check for opening marker
    if (
      state.src.charAt(lineStart) !== "{" ||
      state.src.charAt(lineStart + 1) !== "%" ||
      (state.src.charAt(lineStart + 2) !== " " &&
        state.src.charAt(lineStart + 2) !== "\t")
    )
      return false;

    let pos = lineStart + 2;
    let char: string;

    // Skip spaces after marker
    for (; pos < lineMax; pos++) {
      char = state.src.charAt(pos);
      if (char !== " " && char !== "\t") break;
    }

    const embedNameStart = pos;

    // go through embed name until space or tab
    for (; pos < lineMax; pos++) {
      char = state.src.charAt(pos);
      if (char === " " || char === "\t") break;
    }

    const embedName = state.src.slice(embedNameStart, pos);

    if (!embedName || !embedMap.has(embedName)) return false;

    // Look for closing %} at end of the line
    for (; pos < lineMax; pos++) {
      const char = state.src.charAt(pos);

      if (char !== " " && char !== "\t") break;
    }

    const contentStart = pos;

    // Look for closing %} - it must be either "%}" immediately (empty params) or " %}" (with params)
    let contentEnd = contentStart;
    let found = false;

    // Check if params is empty (immediate %})
    if (
      contentStart + 1 < lineMax &&
      state.src.charAt(contentStart) === "%" &&
      state.src.charAt(contentStart + 1) === "}"
    ) {
      found = true;
      contentEnd = contentStart;
    } else {
      // Search for " %}" or "\t%}" pattern
      for (; contentEnd + 2 < lineMax; contentEnd++) {
        char = state.src.charAt(contentEnd);
        if (
          (char === " " || char === "\t") &&
          state.src.charAt(contentEnd + 1) === "%" &&
          state.src.charAt(contentEnd + 2) === "}"
        ) {
          found = true;
          break;
        }
      }
    }

    if (!found) return false;

    // Check that this is the only embed on the line (for true block behavior)
    const afterEmbedPos =
      contentEnd === contentStart ? contentEnd + 2 : contentEnd + 3;

    // If there's content after %} on the same line, this should be handled as inline
    if (afterEmbedPos < lineMax) {
      // Check if remaining content is non-whitespace
      let hasNonWhitespace = false;

      for (let i = afterEmbedPos; i < lineMax; i++) {
        const char = state.src.charAt(i);

        if (char !== " " && char !== "\t" && char !== "\n" && char !== "\r") {
          hasNonWhitespace = true;
          break;
        }
      }
      if (hasNonWhitespace) return false;
    }

    if (silent) return true;

    const token = state.push("embed_block", "embed", 0);

    token.block = true;
    token.info = embedName;
    token.content = state.src.slice(contentStart, contentEnd).trim();
    token.map = [start, start + 1];
    token.markup = "{% %}";

    // update state line
    state.line = start + 1;

    return true;
  };

export const embed: PluginWithOptions<MarkdownItEmbedOptions> = (
  md: MarkdownIt,
  { config = [] }: MarkdownItEmbedOptions = {},
) => {
  // Get existing maps or create new ones to support multiple plugin instances
  const mdWithMaps = md as any;
  const existingEmbedMap = mdWithMaps.__embedMap as
    | Map<string, EmbedConfig>
    | undefined;
  const existingInlineEmbedMap = mdWithMaps.__inlineEmbedMap as
    | Map<string, EmbedConfig>
    | undefined;

  const embedMap = existingEmbedMap ?? new Map<string, EmbedConfig>();
  const inlineEmbedMap =
    existingInlineEmbedMap ?? new Map<string, EmbedConfig>();

  config.forEach((item) => {
    embedMap.set(item.name, item);
    // Inline embeds are only supported when allowInline is true
    if (item.allowInline) {
      inlineEmbedMap.set(item.name, item);
    }
  });

  // Store maps on the md instance for future plugin instances
  mdWithMaps.__embedMap = embedMap;
  mdWithMaps.__inlineEmbedMap = inlineEmbedMap;

  // Only register rules if not already registered
  if (!existingEmbedMap) {
    // Register the block rule
    md.block.ruler.before("paragraph", "embed_block", getEmbedBlock(embedMap));

    // Register the inline rule
    md.inline.ruler.before(
      "emphasis",
      "embed_inline",
      getEmbedInline(inlineEmbedMap),
    );

    // Register the renderers
    md.renderer.rules.embed_block = (
      tokens: Token[],
      index: number,
    ): string => {
      const token = tokens[index];
      const ref = token.info;
      const params = token.content;

      const embedConfig = embedMap.get(ref);

      return embedConfig ? embedConfig.setup(params) : "";
    };

    md.renderer.rules.embed_inline = (
      tokens: Token[],
      index: number,
    ): string => {
      const token = tokens[index];
      const ref = token.info;
      const params = token.content;

      const embedConfig = inlineEmbedMap.get(ref);

      return embedConfig ? embedConfig.setup(params) : "";
    };
  }
};
