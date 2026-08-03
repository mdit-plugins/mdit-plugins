import type { LiteElement } from "@mathjax/src/js/adaptors/lite/Element.js";
import type { TeX } from "@mathjax/src/js/input/tex.js";
import { HandlerType } from "@mathjax/src/js/input/tex/HandlerTypes.js";

interface TeXMacroMap {
  map: Map<string, unknown>;
}

const USER_MAPS: { handler: HandlerType; name: string }[] = [
  { handler: HandlerType.MACRO, name: "new-Command" },
  { handler: HandlerType.ENVIRONMENT, name: "new-Environment" },
  { handler: HandlerType.DELIMITER, name: "new-Delimiter" },
];

/**
 * Clear user-defined TeX state (macros/environments/delimiters) on a MathJax TeX input jax.
 *
 * MathJax stores user-defined macros, environments and delimiters in dedicated `new-*` maps that
 * are separate from the built-in maps, and `InputJax.reset()` does not clear them, so they would
 * leak across documents rendered by the same instance. This reaches into the internal maps to
 * remove only user-defined entries.
 *
 * 清除 MathJax TeX 输入 jax 上由 `\newcommand`/`\def`/`\newenvironment` 等定义的用户状态。
 *
 * MathJax 将用户自定义的宏、环境与分隔符存放在独立的 `new-*` 映射中，与内置映射分离，且 `InputJax.reset()`
 * 不会清除它们，因此同一实例渲染多篇文档时状态会跨文档泄漏。此处直接访问内部映射，仅移除用户自定义条目。
 *
 * @param InputJax - MathJax TeX input jax / MathJax TeX 输入 jax
 */
export const clearUserState = (InputJax: TeX<LiteElement, string, HTMLElement>): void => {
  for (const { handler, name } of USER_MAPS) {
    const handlerMap = InputJax.parseOptions.handlers.get(handler);
    const userMap = handlerMap.retrieve(name) as unknown as TeXMacroMap | null;

    userMap?.map.clear();
  }
};
