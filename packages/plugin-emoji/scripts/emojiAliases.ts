/**
 * Aliases of CJK symbol emoji that upstream gemoji only exposes as code point placeholders (for
 * example `u6e80`). The names are pinned so regenerating the data does not depend on changes to
 * CLDR wording; a description-derived fallback (see `resolveAliases`) covers any future entry.
 *
 * 上游 gemoji 仅以码点占位别名（例如 `u6e80`）暴露的部分 CJK 符号表情的别名。固定这些名称，避免重新生成 数据时受 CLDR 描述变化影响；`resolveAliases`
 * 中的描述派生回退可覆盖未来新增条目。
 */
export const PINNED_ALIASES: Readonly<Record<string, string>> = {
  "🈷️": "japanese_monthly_amount_button",
  "🈶": "japanese_not_free_of_charge_button",
  "🈯": "japanese_reserved_button",
  "🈹": "japanese_discount_button",
  "🈚": "japanese_free_of_charge_button",
  "🈲": "japanese_prohibited_button",
  "🈸": "japanese_application_button",
  "🈴": "japanese_passing_grade_button",
  "🈳": "japanese_vacancy_button",
  "🈺": "japanese_open_for_business_button",
  "🈵": "japanese_no_vacancy_button",
};

/**
 * Aliases without names are code point placeholders such as `u6e80` (hex digits after `u`).
 *
 * 无名称的别名是 `u6e80`（`u` 后为十六进制数字）这类码点占位符。
 */
export const PLACEHOLDER_ALIAS_RE: RegExp = /^u[0-9a-f]{4,}$/i;

/**
 * Turn the CLDR description of an emoji into an alias, e.g. "Japanese “no vacancy” button" ->
 * "japanese_no_vacancy_button".
 *
 * 将表情的 CLDR 描述转换为别名，例如 "Japanese “no vacancy” button" -> "japanese_no_vacancy_button"。
 *
 * @param description - CLDR description / CLDR 描述
 * @returns Alias in snake_case, empty when the description has no usable word / snake_case
 *   别名；描述中无可用单词时为空
 */
export const descriptionToAlias = (description: string): string =>
  description
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "_")
    .replaceAll(/^_+|_+$/g, "");

/**
 * Resolve the aliases of one gemoji definition.
 *
 * 解析一个 gemoji 定义的别名。
 *
 * @param aliases - Upstream aliases / 上游别名
 * @param emoji - Emoji character / 表情字符
 * @param description - CLDR description / CLDR 描述
 * @returns Named aliases, without code point placeholders / 不含码点占位符的具名别名
 */
export const resolveAliases = (
  aliases: readonly string[],
  emoji: string,
  description?: string,
): string[] => {
  const namedAliases = aliases.filter((alias) => !PLACEHOLDER_ALIAS_RE.test(alias));

  if (namedAliases.length > 0) return namedAliases;

  // Emoji that upstream never named stay unnamed.
  if (aliases.length === 0) return [];

  const pinned = PINNED_ALIASES[emoji];

  if (pinned) return [pinned];

  const derived = description ? descriptionToAlias(description) : "";

  // Never emit an empty alias, it would match every position.
  return derived ? [derived] : [];
};
