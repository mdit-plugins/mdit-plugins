/**
 * Removes common leading whitespace from each line in the given text.
 *
 * @param text The text to dedent.
 * @returns The dedented text.
 */
export const dedent = (text: string): string => {
  const lines = text.split("\n");

  const minIndentLength = lines.reduce((acc, line) => {
    for (let i = 0; i < line.length; i++)
      if (line[i] !== " " && line[i] !== "\t") return Math.min(i, acc);

    return acc;
  }, Infinity);

  if (minIndentLength < Infinity)
    return lines.map((line) => line.slice(minIndentLength)).join("\n");

  return text;
};
