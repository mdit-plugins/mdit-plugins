import { type PluginWithOptions } from "markdown-it";
import { type RuleCore } from "markdown-it/lib/parser_core.js";
import type Token from "markdown-it/lib/token.js";

import {
  type MarkdownItStylizeConfig,
  type MarkdownItStylizeOptions,
} from "./options.js";

const scanTokens = (
  tokens: Token[],
  config: MarkdownItStylizeConfig[],
  skipContents: string[] = [],
): void => {
  for (let index = 1, len = tokens.length; index < len - 1; index++) {
    const token = tokens[index];
    const { content, type } = token;

    // skip current token
    if (type !== "text" || skipContents.includes(content)) continue;

    const configItem = config.find(({ matcher }) =>
      typeof matcher === "string" ? matcher === content : matcher.test(content),
    );
    const tokenPrev = tokens[index - 1];
    const tokenNext = tokens[index + 1];

    if (
      configItem &&
      tokenPrev.tag === tokenNext.tag &&
      tokenPrev.nesting === 1 &&
      tokenNext.nesting === -1
    ) {
      const result = configItem.replacer({
        tag: tokenPrev.tag,
        content: token.content,
        attrs: Object.fromEntries(tokenPrev.attrs || []),
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

export const stylize: PluginWithOptions<MarkdownItStylizeOptions> = (
  md,
  options = {},
) => {
  if (options.config?.length == 0) return;

  const stylizeRule: RuleCore = ({ env, tokens }) => {
    const localConfig = options.localConfigGetter?.(env) ?? [];

    tokens.forEach(({ type, children }) => {
      if (type === "inline" && children)
        scanTokens(children, [
          // local config has higher priority
          ...localConfig,
          ...(options.config ?? []),
        ]);
    });
  };

  md.core.ruler.push("stylize_tag", stylizeRule);
};
