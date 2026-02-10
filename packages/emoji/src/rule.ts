import type { RuleCore } from "markdown-it/lib/parser_core.mjs";
import type MarkdownIt from "markdown-it";
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
        if (offset + match.length < src.length && !REG_ZPCc.test(src[offset + match.length])) {
          return "";
        }
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
    const blockTokens = state.tokens;
    const blockTokensLength = blockTokens.length;
    let autolinkLevel = 0;

    for (let j = 0; j < blockTokensLength; j++) {
      if (blockTokens[j].type !== "inline") {
        continue;
      }
      let tokens = blockTokens[j].children;

      if (!tokens) continue;

      // We scan from the end, to keep position when new tags added.
      // Use reversed logic in links start/end match
      for (let i = tokens.length - 1; i >= 0; i--) {
        const token: Token = tokens[i];

        if ((token.type === "link_open" || token.type === "link_close") && token.info === "auto") {
          autolinkLevel -= token.nesting;
        }

        if (token.type === "text" && autolinkLevel === 0 && scanRE.test(token.content)) {
          // replace current node
          blockTokens[j].children = tokens = arrayReplaceAt(
            tokens,
            i,
            splitTextToken(token.content, token.level, state.Token),
          );
        }
      }
    }
  };
};
