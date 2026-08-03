/**
 * Get the numeric value of a parsed size dimension.
 *
 * An unspecified (empty or null) dimension is treated as `0`, and a trailing `%` (both the new and
 * legacy syntaxes) is ignored for the numeric comparison.
 *
 * 获取已解析尺寸维度的数值。
 *
 * 未指定（空或 null）的维度视为 `0`，尾随 `%`（新语法与旧语法）在数值比较时忽略。
 *
 * @param value - Parsed dimension string, or null/empty when unspecified / 已解析的维度字符串，未指定时为 null 或空
 * @returns Numeric value of the dimension / 维度的数值
 */
const sizeToNumber = (value: string | null): number => {
  if (!value) return 0;

  const end = value.length - 1;

  return Number(value.charCodeAt(end) === 37 /* % */ ? value.slice(0, end) : value);
};

/**
 * Normalize parsed image size dimensions following the Obsidian syntax behavior:
 *
 * - A dimension with numeric value `0` is treated as unspecified and dropped.
 * - A size with all-zero dimensions is invalid and rejected.
 *
 * 按 Obsidian 语法行为归一化已解析的图片尺寸维度：
 *
 * - 数值为 `0` 的维度视为未指定并丢弃。
 * - 全零尺寸视为无效并拒绝。
 *
 * @param width - Parsed width, null or empty string when unspecified / 已解析的宽度，未指定时为 null 或空
 * @param height - Parsed height, null or empty string when unspecified / 已解析的高度，未指定时为 null 或空
 * @returns Normalized size info, or null when invalid / 归一化后的尺寸信息，无效时返回 null
 */
export const normalizeSize = (
  width: string | null,
  height: string | null,
): { width: string | null; height: string | null } | null => {
  const widthNum = sizeToNumber(width);
  const heightNum = sizeToNumber(height);

  if (!widthNum && !heightNum) return null;

  return {
    width: widthNum ? width : null,
    height: heightNum ? height : null,
  };
};
