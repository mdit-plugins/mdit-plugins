import type MarkdownIt from "markdown-it";
import type { PluginWithOptions } from "markdown-it";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";
import type { RuleInline } from "markdown-it/lib/parser_inline.mjs";
import type StateBlock from "markdown-it/lib/rules_block/state_block.mjs";
import type StateInline from "markdown-it/lib/rules_inline/state_inline.mjs";
import type Token from "markdown-it/lib/token.mjs";

import type { EmbedConfig, MarkdownItEmbedOptions } from "./options.js";

export const embed: PluginWithOptions<MarkdownItEmbedOptions> = (
  md: MarkdownIt,
  { config = [] }: MarkdownItEmbedOptions = {},
) => {
  // Create maps for quick lookup
  const embedMap = new Map<string, EmbedConfig>();
  const blockEmbedMap = new Map<string, EmbedConfig>();
  const inlineEmbedMap = new Map<string, EmbedConfig>();

  config.forEach((item) => {
    embedMap.set(item.name, item);
    // Block-level embeds are supported for all configurations
    blockEmbedMap.set(item.name, item);
    // Inline embeds are only supported when allowInline is true
    if (item.allowInline) {
      inlineEmbedMap.set(item.name, item);
    }
  });

  // Helper function to check if there's a word boundary at position
  const isWordBoundary = (src: string, pos: number): boolean => {
    // At start or end of string is always a word boundary
    if (pos <= 0 || pos >= src.length) return true;
    
    const char = src.charCodeAt(pos);
    
    // Check if current character is non-word character (whitespace, punctuation, etc.)
    const isWordChar = (c: number): boolean => 
      (c >= 0x30 && c <= 0x39) || // 0-9
      (c >= 0x41 && c <= 0x5A) || // A-Z
      (c >= 0x61 && c <= 0x7A) || // a-z
      c === 0x5F;                 // _
    
    return !isWordChar(char);
  };

  // Helper function to check word boundary before position
  const isWordBoundaryBefore = (src: string, pos: number): boolean => {
    if (pos <= 0) return true;
    return isWordBoundary(src, pos - 1);
  };

  const embedRegex = /^{%\s*(\w+)\s+(.+?)\s*%}$/;

  // Block rule for block-level embeds
  const embedBlockRule: RuleBlock = (
    state: StateBlock,
    startLine: number,
    _endLine: number,
    silent: boolean,
  ) => {
    const start = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    const content = state.src.slice(start, max).trim();

    const match = embedRegex.exec(content);

    if (!match) return false;

    const [, tokenName, params] = match;
    const embedConfig = blockEmbedMap.get(tokenName);

    if (!embedConfig) return false;

    // If silent mode, just return true to indicate we can parse this
    if (silent) return true;

    // Create embed token
    const token = state.push("embed_block", "", 0);

    token.content = params;
    token.info = tokenName;
    token.map = [startLine, startLine + 1];

    state.line = startLine + 1;

    return true;
  };

  // Inline rule for inline embeds with word boundary support
  const embedInlineRule: RuleInline = (state: StateInline, silent: boolean) => {
    const start = state.pos;
    const max = state.posMax;

    // Check if we have enough characters for minimum syntax
    if (start + 5 >= max) return false;

    // Check for opening {%
    if (
      state.src.charCodeAt(start) !== 0x7b ||
      state.src.charCodeAt(start + 1) !== 0x25
    ) {
      return false;
    }

    // Check word boundary before {%
    if (!isWordBoundaryBefore(state.src, start)) return false;

    // Parse the content step by step to find a valid embed
    let pos = start + 2;
    
    // Skip whitespace after {%
    while (pos < max && /\s/.test(state.src[pos])) pos++;
    
    // Find the token name (word characters only)
    const tokenStart = pos;
    while (pos < max && /\w/.test(state.src[pos])) pos++;
    
    if (pos === tokenStart) return false; // No token name found
    
    const tokenName = state.src.slice(tokenStart, pos);
    
    // Check if this token is configured for inline use
    const embedConfig = inlineEmbedMap.get(tokenName);
    if (!embedConfig) return false;
    
    // Skip whitespace after token name
    while (pos < max && /\s/.test(state.src[pos])) pos++;
    
    // Find the parameters - everything until %} (with word boundary check)
    const paramStart = pos;
    let foundEnd = false;
    let endPos = pos;
    let paramEnd = pos;
    
    while (pos < max - 1) {
      if (
        state.src.charCodeAt(pos) === 0x25 &&
        state.src.charCodeAt(pos + 1) === 0x7d
      ) {
        // Found potential end, check word boundary
        endPos = pos + 2;
        if (isWordBoundary(state.src, endPos)) {
          paramEnd = pos; // Parameters end at the '%' character
          foundEnd = true;
          break;
        }
      }
      pos++;
    }
    
    if (!foundEnd) return false;
    
    // Extract and trim parameters (from paramStart to paramEnd)
    const params = state.src.slice(paramStart, paramEnd).trim();
    
    // Validate that we have parameters
    if (!params) return false;
    
    if (silent) return true;

    // Create inline embed token
    const token = state.push("embed_inline", "", 0);

    token.content = params;
    token.info = tokenName;

    state.pos = endPos;

    return true;
  };

  // Register the block rule
  md.block.ruler.before("paragraph", "embed_block", embedBlockRule);

  // Register the inline rule
  md.inline.ruler.before("emphasis", "embed_inline", embedInlineRule);

  // Register the renderers
  md.renderer.rules.embed_block = (tokens: Token[], index: number): string => {
    const token = tokens[index];
    const tokenName = token.info;
    const params = token.content;

    const embedConfig = embedMap.get(tokenName);

    if (!embedConfig) {
      // Fallback to plain text if config not found
      return `<p>{% ${tokenName} ${params} %}</p>`;
    }

    return embedConfig.setup(params);
  };

  md.renderer.rules.embed_inline = (tokens: Token[], index: number): string => {
    const token = tokens[index];
    const tokenName = token.info;
    const params = token.content;

    const embedConfig = embedMap.get(tokenName);

    if (!embedConfig) {
      // Fallback to plain text if config not found
      return `{% ${tokenName} ${params} %}`;
    }

    return embedConfig.setup(params);
  };
};
