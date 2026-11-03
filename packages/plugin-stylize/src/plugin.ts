import { hasRule } from "@mdit/helper";
import type { CoreRule, PluginWithOptions } from "@mdit/helper";
import type { Token } from "markdown-it";

import type { MarkdownItStylizeConfig, MarkdownItStylizeOptions } from "./options.js";

// Try to apply a single config to the text token between `tokenPrev` and `tokenNext`; returns
// whether the replacer produced a result.
const applyConfig = <
  // oxlint-disable-next-line typescript/no-explicit-any
  MarkdownEnv extends Record<string, any>,
>(
  config: MarkdownItStylizeConfig<MarkdownEnv>,
  token: Token,
  tokenPrev: Token,
  tokenNext: Token,
  env: MarkdownEnv,
): boolean => {
  const content = token.content;
  const matcher = config.matcher;

  if (typeof matcher === "string") {
    if (matcher !== content) return false;
  } else {
    // reset `lastIndex` for stateful regexps so a `g`/`y` flag does not carry state across
    // tokens or renders (which would make matches alternate unexpectedly); `test` ignores
    // `lastIndex` for other regexps
    if (matcher.global || matcher.sticky) matcher.lastIndex = 0;

    if (!matcher.test(content)) return false;
  }

  const result = config.replacer({
    tag: tokenPrev.tag,
    content,
    // the previous token usually has no attrs at all, so skip building an iterable for them
    attrs: tokenPrev.attrs ? Object.fromEntries(tokenPrev.attrs) : {},
    env,
  });

  if (!result) return false;

  tokenPrev.tag = tokenNext.tag = result.tag;
  // Guard against user replacers omitting optional fields at runtime
  tokenPrev.attrs = Object.entries(result.attrs ?? {});
  token.content = result.content ?? content;

  return true;
};

const scanTokens = <
  // oxlint-disable-next-line typescript/no-explicit-any
  MarkdownEnv extends Record<string, any>,
>(
  tokens: Token[],
  localConfig: MarkdownItStylizeConfig<MarkdownEnv>[] | null,
  globalConfig: MarkdownItStylizeConfig<MarkdownEnv>[],
  env: MarkdownEnv,
): void => {
  for (let index = 1, len = tokens.length; index < len - 1; index++) {
    const token = tokens[index];

    // skip current token
    if (token.type !== "text") continue;

    const tokenPrev = tokens[index - 1];
    const tokenNext = tokens[index + 1];

    // quick check for prev/next token
    if (tokenPrev.tag !== tokenNext.tag || tokenPrev.nesting !== 1 || tokenNext.nesting !== -1)
      continue;

    let matched = false;

    // Try local configs first, then the global ones: matching is not enough, the replacer result
    // decides whether the next config gets a chance.
    if (localConfig) {
      for (const config of localConfig) {
        if (applyConfig(config, token, tokenPrev, tokenNext, env)) {
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      for (const config of globalConfig) {
        if (applyConfig(config, token, tokenPrev, tokenNext, env)) {
          matched = true;
          break;
        }
      }
    }

    // skip 2 tokens
    if (matched) index += 2;
  }
};

export const stylize: PluginWithOptions<MarkdownItStylizeOptions> = (md, options = {}) => {
  // A second installation would apply the replacer twice to the same tokens.
  if (hasRule(md, "stylize_tag", "core")) return;

  const globalConfig = options.config ?? [];
  const localConfigGetter = options.localConfigGetter;

  if (globalConfig.length === 0 && !localConfigGetter) {
    // oxlint-disable-next-line no-console
    console.error(
      "[@mdit/plugin-stylize]: No global config or localConfigGetter provided, plugin will be inactive.",
    );

    return;
  }

  const stylizeRule: CoreRule = (state) => {
    const tokens = state.tokens;

    // The local configs are resolved once per render; keeping them in a separate array avoids
    // copying the global configs on every render.
    let localConfig: MarkdownItStylizeConfig[] | null = null;

    if (localConfigGetter) {
      // oxlint-disable-next-line typescript/no-explicit-any
      const config = localConfigGetter(state.env as Record<string, any>);

      if (config && config.length > 0) localConfig = config;
    }

    if (globalConfig.length === 0 && !localConfig) return;

    const length = tokens.length;

    for (let i = 0; i < length; i++) {
      const token = tokens[i];

      if (token.type === "inline" && token.children)
        scanTokens(token.children, localConfig, globalConfig, state.env);
    }
  };

  md.core.ruler.push("stylize_tag", stylizeRule);
};
