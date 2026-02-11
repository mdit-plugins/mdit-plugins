import { CLASS_MARKER, ID_MARKER } from "./constants.js";
import type { DelimiterConfig } from "./types.js";
import type { DelimiterChecker } from "../rules/types.js";

/**
 * Get a function to check if a string matches the delimiter pattern
 * 获取一个函数来检查字符串是否匹配分隔符模式
 *
 * @param options - Delimiter configuration / 分隔符配置
 * @param where - Position for matching: start, end, or only / 匹配位置：开始、结束或仅匹配
 * @returns A function that checks if content matches the delimiter pattern / 检查内容是否匹配分隔符模式的函数
 */
export const createDelimiterChecker = (
  options: DelimiterConfig,
  where: "start" | "end" | "only",
): DelimiterChecker => {
  if (!["start", "end", "only"].includes(where))
    throw new Error(`Invalid 'where' parameter: ${where}. Expected 'start', 'end', or 'only'.`);

  // Cache frequently used values
  const left = options.left;
  const right = options.right;
  const leftLength = left.length;
  const rightLength = right.length;
  const minContentLength = leftLength + 1 + rightLength;

  return (content) => {
    // Quick check for minimum length requirements
    if (typeof content !== "string" || content.length < minContentLength) return false;

    let start: number;
    let end: number;

    if (where === "start") {
      // Check if content starts with left delimiter
      if (!content.startsWith(left)) return false;

      start = leftLength;
      end = content.indexOf(right, leftLength + 1);

      if (end === -1) return false;

      // Check if next character is not part of right delimiter
      const nextCharPos = end + rightLength;

      if (nextCharPos < content.length && right.includes(content.charAt(nextCharPos))) return false;
    } else if (where === "end") {
      // Check if content ends with right delimiter
      start = content.lastIndexOf(left);

      if (start === -1) return false;

      end = content.indexOf(right, start + leftLength + 1);
      start += leftLength;

      if (end === -1 || end + rightLength !== content.length) return false;
    } else {
      // Check if content is wrapped by delimiters ('{.a}')
      if (!content.startsWith(left) || !content.endsWith(right)) return false;

      start = leftLength;
      end = content.length - rightLength;
    }

    // Check if content between delimiters is valid
    const firstCharCode = content.charCodeAt(start);
    const length = end - start;

    const isValid =
      firstCharCode === CLASS_MARKER || firstCharCode === ID_MARKER ? length >= 2 : length >= 1;

    if (!isValid) return false;

    return [start, end];
  };
};
