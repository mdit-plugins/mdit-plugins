import { escapeRegExp } from "@mdit/helper";
import type Token from "markdown-it/lib/token.mjs";

export const hasDelimiters =
  (
    where: "start" | "end" | "only",
    left: string,
    right: string,
  ): ((content: string) => boolean) =>
  (content: string): boolean => {
    const leftLength = left.length;
    const rightLength = right.length;
    // we need minimum three chars, for example {b}
    const minCurlyLength = leftLength + 1 + rightLength;

    if (
      !content ||
      typeof content !== "string" ||
      content.length < minCurlyLength
    )
      return false;

    const validCurlyLength = (curly: string): boolean => {
      const isClass = curly.charAt(leftLength) === ".";
      const isId = curly.charAt(leftLength) === "#";

      return isClass || isId
        ? curly.length >= minCurlyLength + 1
        : curly.length >= minCurlyLength;
    };

    let start, end, slice, nextChar;
    const rightDelimiterMinimumShift = minCurlyLength - rightLength;

    switch (where) {
      case "start":
        // first char should be {, } found in char 2 or more
        slice = content.slice(0, leftLength);
        start = slice === left ? 0 : -1;
        end =
          start === -1
            ? -1
            : content.indexOf(right, rightDelimiterMinimumShift);
        // check if next character is not one of the delimiters
        nextChar = content.charAt(end + rightLength);
        if (nextChar && right.includes(nextChar)) end = -1;
        break;

      case "end":
        // last char should be }
        start = content.lastIndexOf(left);
        end =
          start === -1
            ? -1
            : content.indexOf(right, start + rightDelimiterMinimumShift);
        end = end === content.length - rightLength ? end : -1;
        break;

      case "only":
        // '{.a}'
        slice = content.slice(0, leftLength);
        start = slice === left ? 0 : -1;
        slice = content.slice(content.length - rightLength);
        end = slice === right ? content.length - rightLength : -1;
        break;
    }

    return (
      start !== -1 &&
      end !== -1 &&
      validCurlyLength(content.substring(start, end + rightLength))
    );
  };

export const removeDelimiter = (
  str: string,
  left: string,
  right: string,
): string => {
  const start = escapeRegExp(left);
  const end = escapeRegExp(right);
  const pos = str.search(
    new RegExp(`[ \\n]?${start}[^${start}${end}]+${end}$`),
  );

  return pos !== -1 ? str.slice(0, pos) : str;
};

export const getMatchingOpeningToken = (
  tokens: Token[],
  index: number,
): Token | null => {
  if (tokens[index].type === "softbreak") return null;

  // non closing blocks, example img
  if (tokens[index].nesting === 0) return tokens[index];

  const level = tokens[index].level;
  const type = tokens[index].type.replace("_close", "_open");

  for (; index >= 0; --index)
    if (tokens[index].type === type && tokens[index].level === level)
      return tokens[index];

  return null;
};
