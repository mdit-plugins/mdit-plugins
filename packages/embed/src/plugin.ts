import type MarkdownIt from "markdown-it";
import type { PluginWithOptions } from "markdown-it";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";
import type { RuleInline } from "markdown-it/lib/parser_inline.mjs";
import type Token from "markdown-it/lib/token.mjs";

import type { EmbedConfig, MarkdownItEmbedOptions } from "./options.js";

/**
 * Check if a character is whitespace (space or tab)
 */
const isWhitespace = (char: string): boolean => char === " " || char === "\t";

/**
 * Validate embed content format: must have whitespace at both ends and valid structure
 */
const validateEmbedContent = (
  content: string,
): {
  isValid: boolean;
  embedName: string;
  params: string;
} => {
  // Content must have at least one space at the beginning and end
  if (
    content.length < 3 ||
    !isWhitespace(content.charAt(0)) ||
    !isWhitespace(content.charAt(content.length - 1))
  ) {
    return { isValid: false, embedName: "", params: "" };
  }

  // Extract the trimmed content for parsing
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    return { isValid: false, embedName: "", params: "" };
  }

  // Split into name and params
  const spaceIndex = trimmedContent.search(/[\s\t]/);
  const embedName =
    spaceIndex === -1 ? trimmedContent : trimmedContent.slice(0, spaceIndex);
  const params =
    spaceIndex === -1 ? "" : trimmedContent.slice(spaceIndex + 1).trim();

  return { isValid: true, embedName, params };
};

/*
 * Parse inline embed with bracket syntax: {%...%}
 */
const getEmbedInline =
  (inlineEmbedMap: Map<string, EmbedConfig>): RuleInline =>
  (state, silent) => {
    const start = state.pos;
    const max = state.src.length;

    // minimum length check for inline embed - at least 5 characters: {% %}
    if (max - start < 5) return false;

    // check opening marker
    if (state.src.charAt(start) !== "{" || state.src.charAt(start + 1) !== "%")
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

    // Find the closing %}
    let closingPos = -1;

    for (pos = start + 2; pos + 1 < max; pos++) {
      if (state.src.charAt(pos) === "%" && state.src.charAt(pos + 1) === "}") {
        closingPos = pos;
        break;
      }
    }

    // No closing marker found
    if (closingPos === -1) return false;

    // Extract content between {% and %}
    const content = state.src.slice(start + 2, closingPos);

    // Check that content doesn't contain {% or %}
    if (content.includes("{%") || content.includes("%}")) return false;

    // Validate embed content format and extract name/params
    const { isValid, embedName, params } = validateEmbedContent(content);

    if (!isValid) return false;

    // Check if embed name exists in the map
    if (!embedName || !inlineEmbedMap.has(embedName)) return false;

    // Update parser position
    state.pos = closingPos + 2;

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

    // minimum length check for block embed - at least 5 characters: {% %}
    if (lineMax - lineStart < 5) return false;

    // check opening marker
    if (
      state.src.charAt(lineStart) !== "{" ||
      state.src.charAt(lineStart + 1) !== "%"
    )
      return false;

    // Find the closing %} on the same line
    let closingPos = -1;

    for (let pos = lineStart + 2; pos + 1 < lineMax; pos++) {
      if (state.src.charAt(pos) === "%" && state.src.charAt(pos + 1) === "}") {
        closingPos = pos;
        break;
      }
    }

    // No closing marker found on the same line
    if (closingPos === -1) return false;

    // Extract content between {% and %}
    const content = state.src.slice(lineStart + 2, closingPos);

    // Check that content doesn't contain {% or %}
    if (content.includes("{%") || content.includes("%}")) return false;

    // Validate embed content format and extract name/params
    const { isValid, embedName, params } = validateEmbedContent(content);

    if (!isValid) return false;

    // Check if embed name exists in the map
    if (!embedName || !embedMap.has(embedName)) return false;

    // Check that this is the only embed on the line (for true block behavior)
    // There should be only whitespace before {% and after %}
    const afterEmbedPos = closingPos + 2;
    const afterEmbed = state.src.slice(afterEmbedPos, lineMax);

    // Check if there's non-whitespace content before the embed (besides line indentation)
    const lineContent = state.src.slice(lineStart, lineMax);
    const embedStartInLine = lineContent.indexOf("{%");
    const beforeEmbedContent = lineContent.slice(0, embedStartInLine);

    if (beforeEmbedContent.trim() !== "") return false;

    // Check if there's non-whitespace content after the embed
    if (afterEmbed.trim() !== "") return false;

    if (silent) return true;

    const token = state.push("embed_block", "embed", 0);

    token.block = true;
    token.info = embedName;
    token.content = params;
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
