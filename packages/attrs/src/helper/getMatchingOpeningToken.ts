import type Token from "markdown-it/lib/token.mjs";

export const getMatchingOpeningToken = (
  tokens: Token[],
  index: number,
): Token | null => {
  const token = tokens[index];

  if (token.type === "softbreak") return null;

  // non closing blocks, example img
  if (token.nesting === 0) return token;

  const level = token.level;
  const type = token.type.replace("_close", "_open");

  while (index >= 0) {
    const currentToken = tokens[index];

    if (currentToken.type === type && currentToken.level === level)
      return currentToken;

    index--;
  }

  /* istanbul ignore next -- @preserve */
  return null;
};
