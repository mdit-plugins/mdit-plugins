import type Token from "markdown-it/lib/token.mjs";

export const getMatchingOpeningToken = (
  tokens: Token[],
  index: number,
): Token | null => {
  if (tokens[index].type === "softbreak") return null;

  // non closing blocks, example img
  if (tokens[index].nesting === 0) return tokens[index];

  const level = tokens[index].level;
  const type = tokens[index].type.replace("_close", "_open");

  while (index >= 0) {
    if (tokens[index].type === type && tokens[index].level === level)
      return tokens[index];
    index--;
  }

  /* istanbul ignore next -- @preserve */
  return null;
};
