import { CLASS_MARKER, ID_MARKER } from "./constant.js";
import type { DelimiterConfig } from "./types.js";

export type DelimiterChecker = (content: string) => boolean;

export const getDelimiterChecker =
  (
    { left, right }: Required<DelimiterConfig>,
    where: "start" | "end" | "only",
  ): DelimiterChecker =>
  (content: string): boolean => {
    const leftLength = left.length;
    const rightLength = right.length;
    // we need minimum three chars, for example {b}
    const minCurlyLength = leftLength + 1 + rightLength;
    const rightDelimiterMinimumShift = leftLength + 1;

    // perform a quick check
    if (
      !content ||
      typeof content !== "string" ||
      content.length < minCurlyLength
    )
      return false;

    const validCurlyLength = (curly: string): boolean =>
      [CLASS_MARKER, ID_MARKER].includes(curly.charAt(leftLength))
        ? curly.length >= minCurlyLength + 1
        : curly.length >= minCurlyLength;

    let start: number;
    let end: number;
    let slice: string;
    let nextChar: string;

    switch (where) {
      case "start": {
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
      }

      case "end": {
        // last char should be }
        start = content.lastIndexOf(left);
        end =
          start === -1
            ? -1
            : content.indexOf(right, start + rightDelimiterMinimumShift);
        end = end === content.length - rightLength ? end : -1;
        break;
      }

      case "only": {
        // '{.a}'
        slice = content.slice(0, leftLength);
        start = slice === left ? 0 : -1;
        slice = content.slice(content.length - rightLength);
        end = slice === right ? content.length - rightLength : -1;
        break;
      }

      default: {
        throw new Error(
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          `Invalid 'where' parameter: ${where}. Expected 'start', 'end', or 'only'.`,
        );
      }
    }

    return (
      start !== -1 &&
      end !== -1 &&
      validCurlyLength(content.substring(start, end + rightLength))
    );
  };
