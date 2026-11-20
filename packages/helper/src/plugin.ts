import type {
  PluginSimple,
  PluginWithOptions,
  UniversalPluginSimple,
  UniversalPluginWithOptions,
} from "./types.js";

/**
 * Marks a plugin written against markdown-it as a plugin that any markdown-it compatible engine can
 * install, such as markdown-exit.
 *
 * Apart from assigning `Function.name` when a name is passed, the runtime value is returned
 * unchanged. Pass the options type as a type argument when the plugin takes options; without it the
 * option-less overload matches and `md.use(plugin, options)` is rejected by the compiler.
 *
 * An optional name can be passed to keep `Function.name` meaningful: a plugin written as an inline
 * callback loses its inferred name, and test runners, stack traces and debugging tools display that
 * name.
 *
 * 将按 markdown-it 编写的插件标记为任意 markdown-it 兼容引擎（如 markdown-exit）都可安装的插件。
 *
 * 运行时原样返回插件，仅影响类型。插件带选项时需要把选项类型作为类型参数传入，否则会匹配无选项重载， `md.use(plugin, options)` 将无法通过类型检查。
 *
 * 可选的名称用于保持 `Function.name` 有意义：以内联回调形式编写的插件会失去推断出的名称，而测试运行器、 调用栈和调试工具会显示该名称。
 *
 * @example
 *   ```ts
 *   export const mark = definePlugin("mark", (md) => {
 *     // md is typed as MarkdownIt
 *   });
 *
 *   export const attrs: UniversalPluginWithOptions<AttrsOptions> = definePlugin<AttrsOptions>(
 *     "attrs",
 *     (md, options) => {
 *       // options is typed as AttrsOptions | undefined
 *     },
 *   );
 *   ```;
 *
 * @param name - Optional plugin name assigned to `Function.name` / 可选的插件名，会赋给 `Function.name`
 * @param plugin - Plugin to mark / 要标记的插件
 * @returns The same plugin, typed for markdown-it compatible engines / 原插件，类型为 markdown-it 兼容引擎可用
 */
export function definePlugin(name: string, plugin: PluginSimple): UniversalPluginSimple;
/**
 * @param plugin - Plugin to mark / 要标记的插件
 * @returns The same plugin, typed for markdown-it compatible engines / 原插件，类型为 markdown-it 兼容引擎可用
 */
export function definePlugin(plugin: PluginSimple): UniversalPluginSimple;
/**
 * @param name - Optional plugin name assigned to `Function.name` / 可选的插件名，会赋给 `Function.name`
 * @param plugin - Plugin to mark / 要标记的插件
 * @returns The same plugin, typed for markdown-it compatible engines / 原插件，类型为 markdown-it 兼容引擎可用
 */
export function definePlugin<T>(
  name: string,
  plugin: PluginWithOptions<T>,
): UniversalPluginWithOptions<T>;
/**
 * @param plugin - Plugin to mark / 要标记的插件
 * @returns The same plugin, typed for markdown-it compatible engines / 原插件，类型为 markdown-it 兼容引擎可用
 */
export function definePlugin<T>(plugin: PluginWithOptions<T>): UniversalPluginWithOptions<T>;
export function definePlugin(
  nameOrPlugin: string | PluginSimple | PluginWithOptions,
  maybePlugin?: PluginSimple | PluginWithOptions,
): UniversalPluginSimple | UniversalPluginWithOptions {
  const name = typeof nameOrPlugin === "string" ? nameOrPlugin : "";
  const plugin = typeof nameOrPlugin === "string" ? maybePlugin : nameOrPlugin;

  if (typeof plugin !== "function")
    throw new TypeError("@mdit/helper: definePlugin expects a plugin function.");

  if (name) Object.defineProperty(plugin, "name", { value: name, configurable: true });

  return plugin as unknown as UniversalPluginSimple | UniversalPluginWithOptions;
}
