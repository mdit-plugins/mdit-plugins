import type { MarkdownIt } from "markdown-it";

/** Ruler type that can own a rule / 可持有规则的 ruler 类型 */
export type RuleScope = "block" | "core" | "inline";

interface RulerLike {
  __rules__: { name: string }[];
}

/**
 * Check whether a parser rule is registered on a markdown-it instance.
 *
 * Markdown-it keeps separate core / block / inline rulers and does not enforce unique rule names
 * across them, so pass `scope` to avoid a false positive from another ruler. Within one ruler,
 * repeated registration of the same name is not deduplicated by markdown-it either.
 * `Ruler.getRules()` returns unnamed functions, hence this reads the ruler's internal `__rules__`
 * list.
 *
 * 检查 markdown-it 实例上是否已注册某个解析规则。
 *
 * Markdown-it 的 core / block / inline 是三个独立 ruler，不保证规则名跨 ruler 唯一， 因此可通过 `scope` 限定只检测某一个
 * ruler，避免其它 ruler 的同名规则造成误判。 同一 ruler 内重复注册同名规则 markdown-it 也不会去重。`Ruler.getRules()` 返回的函数不带名字，
 * 因此这里读取内部的 `__rules__`。
 *
 * @param md - Markdown-it instance / markdown-it 实例
 * @param ruleName - Rule name / 规则名
 * @param scope - Ruler to check; defaults to all three / 要检测的 ruler，默认检测三者
 * @returns Whether the rule is registered / 规则是否已注册
 */
export const hasRule = (md: MarkdownIt, ruleName: string, scope?: RuleScope): boolean => {
  const rulers: RulerLike[] = scope
    ? [md[scope].ruler]
    : [md.core.ruler, md.block.ruler, md.inline.ruler];

  return rulers.some((ruler) =>
    // oxlint-disable-next-line eslint/no-underscore-dangle
    ruler.__rules__.some(({ name }) => name === ruleName),
  );
};
