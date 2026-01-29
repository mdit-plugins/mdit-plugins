import type { PluginWithOptions } from "markdown-it";
import type { RuleCore } from "markdown-it/lib/parser_core.mjs";
import type Token from "markdown-it/lib/token.mjs";

import type { MarkdownItStylizeConfig, MarkdownItStylizeOptions } from "./options.js";

const scanTokens = (
  tokens: Token[],
  config: MarkdownItStylizeConfig[],
  skipContents: string[] = [],
): void => {
  for (let index = 1, len = tokens.length; index < len - 1; index++) {
    const token = tokens[index];
    const content = token.content;

    // skip current token
    if (token.type !== "text" || skipContents.includes(content)) continue;

    const tokenPrev = tokens[index - 1];
    const tokenNext = tokens[index + 1];

    // quick check for prev/next token
    if (tokenPrev.tag !== tokenNext.tag || tokenPrev.nesting !== 1 || tokenNext.nesting !== -1)
      continue;

    const matchedConfig = config.find(({ matcher }) =>
      typeof matcher === "string" ? matcher === content : matcher.test(content),
    );

    if (matchedConfig) {
      const result = matchedConfig.replacer({
        tag: tokenPrev.tag,
        content: token.content,
        attrs: Object.fromEntries(tokenPrev.attrs ?? []),
      });

      if (result) {
        tokenPrev.tag = tokenNext.tag = result.tag;
        tokenPrev.attrs = Object.entries(result.attrs);
        token.content = result.content;
      }

      // skip 2 tokens
      index += 2;
    }
  }
};

export const stylize: PluginWithOptions<MarkdownItStylizeOptions> = (md, options = {}) => {
  const globalConfig = options.config ?? [];
  const localConfigGetter = options.localConfigGetter;

  if (globalConfig.length === 0 && !localConfigGetter) {
    // oxlint-disable-next-line no-console
    console.error(
      "[@mdit/plugin-stylize]: No global config or localConfigGetter provided, plugin will be inactive.",
    );

    return;
  }

  const stylizeRule: RuleCore = (state) => {
    const tokens = state.tokens;

    let effectiveConfig = globalConfig;

    if (localConfigGetter) {
      // oxlint-disable-next-line typescript/no-explicit-any
      const localConfig = localConfigGetter(state.env as Record<string, any>);

      if (localConfig && localConfig.length > 0) {
        effectiveConfig =
          effectiveConfig.length > 0 ? localConfig.concat(effectiveConfig) : localConfig;
      }
    }

    if (effectiveConfig.length === 0) return;

    const length = tokens.length;

    for (let i = 0; i < length; i++) {
      const token = tokens[i];

      if (token.type === "inline" && token.children) scanTokens(token.children, effectiveConfig);
    }
  };

  md.core.ruler.push("stylize_tag", stylizeRule);
};
