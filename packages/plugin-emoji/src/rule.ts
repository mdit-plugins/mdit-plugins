import type MarkdownIt from "markdown-it";
import type { RuleCore } from "markdown-it/lib/parser_core.mjs";
import type Token from "markdown-it/lib/token.mjs";

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
): RuleCore => {
  const arrayReplaceAt = md.utils.arrayReplaceAt;
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
    let autolinkLevel = 0;

    for (let i = 0; i < allTokensLength; i++) {
      if (allTokens[i].type !== "inline") continue;

      // oxlint-disable-next-line typescript/no-non-null-assertion
      let tokens = allTokens[i].children!;

      // We scan from the end, to keep position when new tags added.
      // Use reversed logic in links start/end match
      for (let j = tokens.length - 1; j >= 0; j--) {
        const childTokens: Token = tokens[j];

        if (
          (childTokens.type === "link_open" || childTokens.type === "link_close") &&
          childTokens.info === "auto"
        )
          autolinkLevel -= childTokens.nesting;

        if (
          childTokens.type === "text" &&
          autolinkLevel === 0 &&
          scanRE.test(childTokens.content)
        ) {
          // replace current node
          allTokens[i].children = tokens = arrayReplaceAt(
            tokens,
            j,
            splitTextToken(childTokens.content, childTokens.level, state.Token),
          );
        }
      }
    }
  };
};
