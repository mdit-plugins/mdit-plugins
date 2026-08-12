/** Forked and modified from https://github.com/markdown-it/markdown-it-abbr/blob/master/index.mjs */

import type { BlockRule, CoreRule, PluginSimple } from "@mdit/helper";
import type { Env, StateBlock, StateCore } from "markdown-it";

interface AbbrEnv extends Env {
  abbreviations?: Record<string, string>;
}

interface AbbrStateBlock extends StateBlock {
  env: AbbrEnv;
}

interface AbbrStateCore extends StateCore {
  env: AbbrEnv;
}

const ESCAPE_RE = /\\(?<char>.)/g;

const abbrDefinition: BlockRule = (state: AbbrStateBlock, startLine, _endLine, silent) => {
  let labelEnd = -1;
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];

  if (
    pos + 2 >= max ||
    state.src.charCodeAt(pos++) !== 42 /* * */ ||
    state.src.charCodeAt(pos++) !== 91 /* [ */
  )
    return false;

  const labelStart = pos;

  while (pos < max) {
    const ch = state.src.charCodeAt(pos);

    if (ch === 91 /* [ */) return false;

    if (ch === 93 /* ] */) {
      labelEnd = pos;
      break;
    }
    if (ch === 92 /* \ */) pos++;

    pos++;
  }

  if (labelEnd < 0 || state.src.charCodeAt(labelEnd + 1) !== 58 /* : */) return false;

  if (silent) return true;

  const label = state.src.slice(labelStart, labelEnd).replaceAll(ESCAPE_RE, "$<char>");

  // .trim() strips all JS whitespace (not just space/tab), matching markdown-it-abbr
  const title = state.src.slice(labelEnd + 2, max).trim();

  if (label.length === 0 || title.length === 0) return false;

  // prepend ':' to avoid conflict with Object.prototype members
  (state.env.abbreviations ??= {})[`_${label}`] ??= title;

  state.line = startLine + 1;

  return true;
};

export const abbr: PluginSimple = (md) => {
  const { arrayReplaceAt, escapeRE, lib } = md.utils;

  // ASCII characters in Cc, Sc, Sm, Sk categories we should terminate on;
  // you can check character classes here:
  // http://www.unicode.org/Public/UNIDATA/UnicodeData.txt
  const OTHER_CHARS = " \r\n$+<=>^`|~";
  const UNICODE_PUNCTUATION_REGEXP = lib.ucmicro.P.source;
  const UNICODE_SPACE_REGEXP = lib.ucmicro.Z.source;
  // oxlint-disable-next-line unicorn/no-array-callback-reference
  const WORDING_REGEXP_TEXT = `${UNICODE_PUNCTUATION_REGEXP}|${UNICODE_SPACE_REGEXP}|[${OTHER_CHARS.split("").map(escapeRE).join("")}]`;

  const abbrReplace: CoreRule = (state: AbbrStateCore) => {
    const tokens = state.tokens;
    const abbreviations = state.env.abbreviations;

    if (!abbreviations) return;

    const abbreviationsRegExpText = Object.keys(abbreviations)
      .map((item) => item.slice(1))
      .sort((a, b) => b.length - a.length)
      // oxlint-disable-next-line unicorn/no-array-callback-reference
      .map(escapeRE)
      .join("|");

    const regexpSimple = new RegExp(`(?:${abbreviationsRegExpText})`);

    const regExp = new RegExp(
      `(^|${WORDING_REGEXP_TEXT})(${abbreviationsRegExpText})($|${WORDING_REGEXP_TEXT})`,
      "g",
    );

    const tokensLength = tokens.length;

    for (let i = 0; i < tokensLength; i++) {
      const token = tokens[i];

      if (token.type !== "inline") continue;

      // oxlint-disable-next-line typescript/no-non-null-assertion
      let children = token.children!;

      // We scan from the end, to keep position when new tags added.
      for (let index = children.length - 1; index >= 0; index--) {
        const currentToken = children[index];

        if (currentToken.type !== "text") continue;

        const text = currentToken.content;

        regExp.lastIndex = 0;

        // fast regexp run to determine whether there are any abbreviated words
        // in the current token
        if (!regexpSimple.test(text)) continue;

        const nodes = [];
        let match: RegExpExecArray | null;
        let pos = 0;

        while ((match = regExp.exec(text))) {
          const [, before, word, after] = match;

          if (match.index > 0 || before.length > 0) {
            const textToken = new state.Token("text", "", 0);

            textToken.content = text.slice(pos, match.index + before.length);
            nodes.push(textToken);
          }

          const abbrOpenToken = new state.Token("abbr_open", "abbr", 1);

          abbrOpenToken.attrPush(["title", abbreviations[`_${word}`]]);
          nodes.push(abbrOpenToken);

          const textToken = new state.Token("text", "", 0);

          textToken.content = word;
          nodes.push(textToken);

          const abbrCloseToken = new state.Token("abbr_close", "abbr", -1);

          nodes.push(abbrCloseToken);

          regExp.lastIndex -= after.length;
          pos = regExp.lastIndex;
        }

        if (nodes.length === 0) continue;

        if (pos < text.length) {
          const textToken = new state.Token("text", "", 0);

          textToken.content = text.slice(pos);
          nodes.push(textToken);
        }

        // replace current node
        token.children = children = arrayReplaceAt(children, index, nodes);
      }
    }
  };

  md.block.ruler.before("reference", "abbr_definition", abbrDefinition, {
    alt: ["paragraph", "reference"],
  });

  md.core.ruler.after("linkify", "abbr_replace", abbrReplace);
};
