/**
 * Forked and modified from
 * https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/replace.mjs
 */

import type { CoreRule } from "@mdit/helper";
import type { MarkdownIt, Token } from "markdown-it";

interface UCMicro {
  // oxlint-disable-next-line id-length
  Z: RegExp;
  // oxlint-disable-next-line id-length
  P: RegExp;
  Cc: RegExp;
}

export const emojiRule = (
  md: MarkdownIt,
  emojis: Record<string, string>,
  shortcuts: Record<string, string>,
  scanRE: RegExp,
  replaceRE: RegExp,
): CoreRule => {
  // oxlint-disable-next-line id-length
  const { Z, P, Cc } = (md.utils.lib as { ucmicro: UCMicro }).ucmicro;
  const REG_ZPCc = new RegExp([Z.source, P.source, Cc.source].join("|"));

  const splitTextToken = (text: string, level: number, TokenConstructor: typeof Token): Token[] => {
    let lastPos = 0;
    const nodes: Token[] = [];

    text.replace(replaceRE, (match, offset: number, src: string) => {
      let emojiName;

      // Validate emoji name
      if (Object.hasOwn(shortcuts, match)) {
        // replace shortcut with full name
        emojiName = shortcuts[match];

        // Don't allow letters before any shortcut (as in no ":/" in http://)
        if (offset > 0 && !REG_ZPCc.test(src[offset - 1])) return "";

        // Don't allow letters after any shortcut
        if (offset + match.length < src.length && !REG_ZPCc.test(src[offset + match.length]))
          return "";
      } else {
        emojiName = match.slice(1, -1);
      }

      // Add new tokens to pending list
      if (offset > lastPos) {
        const token = new TokenConstructor("text", "", 0);
        token.content = text.slice(lastPos, offset);
        token.level = level;
        nodes.push(token);
      }

      const token = new TokenConstructor("emoji", "", 0);
      token.markup = emojiName;
      token.content = emojis[emojiName];
      token.level = level;
      nodes.push(token);

      lastPos = offset + match.length;
      return "";
    });

    if (lastPos < text.length) {
      const token = new TokenConstructor("text", "", 0);
      token.content = text.slice(lastPos);
      token.level = level;
      nodes.push(token);
    }

    return nodes;
  };

  return (state) => {
    const allTokens = state.tokens;
    const allTokensLength = allTokens.length;
    const TokenConstructor = state.Token;

    for (let i = 0; i < allTokensLength; i++) {
      const blockToken = allTokens[i];

      if (blockToken.type !== "inline") continue;

      // oxlint-disable-next-line typescript/no-non-null-assertion
      const tokens = blockToken.children!;
      const tokensLength = tokens.length;

      // Rebuild the children list in one pass instead of calling `arrayReplaceAt` per matching
      // text token, which copies the whole list every time and makes the pass quadratic.
      // `newTokens` stays `null` until the first replacement, so inline blocks without emoji
      // do not allocate a second list.
      let newTokens: Token[] | null = null;
      let autolinkLevel = 0;

      for (let j = 0; j < tokensLength; j++) {
        const childTokens: Token = tokens[j];

        if (
          (childTokens.type === "link_open" || childTokens.type === "link_close") &&
          childTokens.info === "auto"
        )
          autolinkLevel += childTokens.nesting;

        if (
          childTokens.type === "text" &&
          autolinkLevel === 0 &&
          scanRE.test(childTokens.content)
        ) {
          newTokens ??= tokens.slice(0, j);

          const replacements = splitTextToken(
            childTokens.content,
            childTokens.level,
            TokenConstructor,
          );
          const replacementsLength = replacements.length;

          for (let k = 0; k < replacementsLength; k++) newTokens.push(replacements[k]);
        } else if (newTokens != null) {
          newTokens.push(childTokens);
        }
      }

      if (newTokens != null) blockToken.children = newTokens;
    }
  };
};
