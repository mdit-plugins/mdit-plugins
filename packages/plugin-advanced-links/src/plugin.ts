import type { PluginWithOptions } from "@mdit/helper";
import type { MarkdownIt, RendererRule } from "markdown-it";

import type { AdvancedLinkProps, MarkdownItAdvancedLinksOptions } from "./options.js";
import { createBlockRule, createInlineRule } from "./rules.js";
import type { AdvancedLinkConfigs } from "./types.js";

const INVALID_NAME_CHARS = " \t\n\r[]()\"'";

/**
 * State stored on a MarkdownIt instance
 *
 * 存储在 MarkdownIt 实例上的状态
 */
interface AdvancedLinkState {
  /**
   * Registered configs
   *
   * 已注册的配置
   */
  configs: AdvancedLinkConfigs;
  /**
   * Whether the parser rules are registered
   *
   * 解析规则是否已注册
   */
  registered: boolean;
}

/**
 * MarkdownIt instance with the shared state
 *
 * 带有共享状态的 MarkdownIt 实例
 *
 * The state is stored on the instance instead of in a module scoped map, so that even multiple
 * copies of this module (e.g. an ESM build and an UMD build loaded together) share the same state.
 *
 * 状态存储在实例上而不是模块作用域的映射中，这样即使本模块存在多份副本（例如同时加载 ESM 构建与 UMD 构建）， 也能共享同一份状态。
 */
type MarkdownItWithState = MarkdownIt & { __advancedLinkState?: AdvancedLinkState };

const isValidName = (name: string): boolean => {
  if (!name) return false;

  for (let index = 0; index < name.length; index++)
    if (INVALID_NAME_CHARS.includes(name.charAt(index))) return false;

  return true;
};

const createRenderer =
  (configs: AdvancedLinkConfigs): RendererRule =>
  (tokens, index, _options, env): string => {
    const token = tokens[index];
    const config = configs.get(token.info);

    // tokens created outside the parser have no config
    if (!config) return "";

    return config.renderer(token.content, (token.meta as AdvancedLinkProps | null) ?? {}, env);
  };

/**
 * Register the parser rules
 *
 * 注册解析规则
 *
 * `Ruler.before` does not deduplicate rules, so this must only be called once per instance.
 *
 * `Ruler.before` 不会对规则去重，因此每个实例只能调用一次。
 *
 * @param md - MarkdownIt instance / MarkdownIt 实例
 * @param configs - Registered configs / 已注册的配置
 */
const registerParserRules = (md: MarkdownIt, configs: AdvancedLinkConfigs): void => {
  md.block.ruler.before("paragraph", "advanced_link_block", createBlockRule(configs), {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  md.inline.ruler.before("link", "advanced_link_inline", createInlineRule(configs));
};

/**
 * Register the renderers
 *
 * 注册渲染器
 *
 * @param md - MarkdownIt instance / MarkdownIt 实例
 * @param configs - Registered configs / 已注册的配置
 */
const registerRenderers = (md: MarkdownIt, configs: AdvancedLinkConfigs): void => {
  md.renderer.rules.advanced_link_block = createRenderer(configs);
  md.renderer.rules.advanced_link_inline = createRenderer(configs);
};

/**
 * Advanced links plugin
 *
 * 高级链接插件
 *
 * Provides the `@[name ...props](link)` syntax. The plugin can be used multiple times with
 * different names, and each name can have its own renderer.
 *
 * 提供 `@[name ...props](link)` 语法。插件可使用多次以注册不同的名称，每个名称可以有自己的渲染器。
 *
 * @example
 *   ```ts
 *   const md = new MarkdownIt()
 *   .use(advancedLinks, {
 *   name: "video",
 *   renderer: (link) => `<video src="${link}" controls></video>`,
 *   })
 *   .use(advancedLinks, {
 *   name: "badge",
 *   inline: true,
 *   renderer: (link, props) => `<span class="${link}">${props.text || link}</span>`,
 *   });
 *   ```
 *
 * @param md - MarkdownIt instance / MarkdownIt 实例
 * @param options - Plugin options / 插件选项
 */
export const advancedLinks: PluginWithOptions<MarkdownItAdvancedLinksOptions> = (md, options) => {
  if (typeof options !== "object" || options == null)
    throw new TypeError('[@mdit/plugin-advanced-links]: "options" is required.');

  const { name, inline = false, renderer } = options;

  if (typeof name !== "string" || !isValidName(name)) {
    throw new TypeError(
      '[@mdit/plugin-advanced-links]: "name" must be a non-empty string without whitespace, "[", "]", "(", ")", "\'" and \'"\'.',
    );
  }

  if (typeof renderer !== "function")
    throw new TypeError('[@mdit/plugin-advanced-links]: "renderer" must be a function.');

  const mdWithState = md as MarkdownItWithState;
  // oxlint-disable-next-line no-underscore-dangle
  const state = (mdWithState.__advancedLinkState ??= { configs: new Map(), registered: false });

  // register the parser rules only once, so that repeated calls just add configs
  if (!state.registered) {
    registerParserRules(md, state.configs);
    state.registered = true;
  }

  // restore renderers removed by other code, without touching the parser rules
  if (!("advanced_link_block" in md.renderer.rules)) registerRenderers(md, state.configs);

  state.configs.set(name, { inline, renderer });
};
