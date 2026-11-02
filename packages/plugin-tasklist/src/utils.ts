import type { Token } from "markdown-it";

export const setTokenAttr = (token: Token, name: string, value: string): void => {
  const index = token.attrIndex(name);
  const attr: [string, string] = [name, value];

  if (index < 0) token.attrPush(attr);
  // oxlint-disable-next-line typescript/no-non-null-assertion
  else token.attrs![index] = attr;
};

export const isInlineToken = (token: Token): boolean => token.type === "inline";

export const isParagraphToken = (token: Token): boolean => token.type === "paragraph_open";

export const isListItemToken = (token: Token): boolean => token.type === "list_item_open";
