import { escapeRegExp } from "@mdit/helper";
// import type Token from "markdown-it/lib/token.mjs";

import type { Rule } from "./types.js";
import { addAttrs, getAttrs } from "../attrs.js";
import {
  getDelimiterChecker,
  getMatchingOpeningToken,
  removeDelimiter,
} from "../helper.js";
import type {
  MarkdownItAttrRuleName,
  MarkdownItAttrsOptions,
} from "../options.js";

const getFenceRule = (options: Required<MarkdownItAttrsOptions>): Rule => ({
  /**
   * fenced code blocks
   *
   * ```python {.cls}
   * for i in range(10):
   *     print(i)
   * ```
   */

  // fenced code blocks
  name: "code-block",
  tests: [
    {
      shift: 0,
      block: true,
      info: getDelimiterChecker(options, "end"),
    },
  ],
  transform: (tokens, index): void => {
    const token = tokens[index];
    let lineNumber = "";

    // special handler for VuePress line number
    const results = /{(?:[\d,-]+)}/.exec(token.info);

    if (results) {
      token.info = token.info.replace(results[0], "");
      lineNumber = results[0];
    }

    const attrs = getAttrs(
      token.info,
      token.info.lastIndexOf(options.left),
      options,
    );

    addAttrs(attrs, token);
    token.info = `${removeDelimiter(
      token.info,
      options.left,
      options.right,
    )} ${lineNumber}`.trim();
  },
});

const getInlineRules = (options: Required<MarkdownItAttrsOptions>): Rule[] => [
  /**
   * bla `click()`{.c} ![](img.png){.d}
   *
   * differs from 'inline attributes' as it does
   * not have a closing tag (nesting: -1)
   */
  {
    name: "inline nesting self-close",
    tests: [
      {
        shift: 0,
        type: "inline",
        children: [
          {
            shift: -1,
            type: (str) => str === "image" || str === "code_inline",
          },
          {
            shift: 0,
            type: "text",
            content: getDelimiterChecker(options, "start"),
          },
        ],
      },
    ],
    transform: (tokens, index, childIndex): void => {
      const rightLength = options.right.length;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const token = tokens[index].children![childIndex];

      const endChar = token.content.indexOf(options.right);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const attrToken = tokens[index].children![childIndex - 1];
      const attrs = getAttrs(token.content, 0, options);

      addAttrs(attrs, attrToken);
      if (token.content.length === endChar + rightLength) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        tokens[index].children!.splice(childIndex, 1);
      } else {
        token.content = token.content.slice(endChar + rightLength);
      }
    },
  },

  /**
   * *emphasis*{.with attrs=1}
   */
  {
    name: "inline attributes",
    tests: [
      {
        shift: 0,
        type: "inline",
        children: [
          {
            shift: -1,
            nesting: -1, // closing inline tag, </em>{.a}
          },
          {
            shift: 0,
            type: "text",
            content: getDelimiterChecker(options, "start"),
          },
        ],
      },
    ],
    transform: (tokens, index, childIndex): void => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const token = tokens[index].children![childIndex];
      const { content } = token;
      const attrs = getAttrs(content, 0, options);
      const openingToken = getMatchingOpeningToken(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        tokens[index].children!,
        childIndex - 1,
      );

      addAttrs(attrs, openingToken);
      token.content = content.slice(
        content.indexOf(options.right) + options.right.length,
      );
    },
  },
];

// /**
//  * Hidden table's cells and them inline children,
//  * specially cast inline's content as empty
//  * to prevent that escapes the table's box model
//  * @see https://github.com/markdown-it/markdown-it/issues/639
//  */
// const hideTable = (token: Token): void => {
//   token.hidden = true;
//   token.children?.forEach((childToken) => {
//     childToken.content = "";
//     hideTable(childToken);
//   });
// };

const getTableRules = (options: Required<MarkdownItAttrsOptions>): Rule[] => [
  {
    /**
     * | h1 |
     * | -- |
     * | c1 |
     *
     * {.c}
     */
    name: "table",
    tests: [
      {
        // let this token be i, such that for-loop continues at
        // next token after tokens.splice
        shift: 0,
        type: "table_close",
      },
      {
        shift: 1,
        type: "paragraph_open",
      },
      {
        shift: 2,
        type: "inline",
        content: getDelimiterChecker(options, "only"),
      },
    ],
    transform: (tokens, index): void => {
      const token = tokens[index + 2];
      const tableOpen = getMatchingOpeningToken(tokens, index);
      const attrs = getAttrs(token.content, 0, options);

      // add attributes
      addAttrs(attrs, tableOpen);
      // remove <p>{.c}</p>
      tokens.splice(index + 1, 3);
    },
  },
  {
    /**
     * | A | B |
     * | -- | -- |
     * | 1 | 2 |
     *
     * | C | D |
     * | -- | -- |
     *
     * only `| A | B |` sets the colsnum metadata
     */
    name: "table thead metadata",
    tests: [
      {
        shift: 0,
        type: "tr_close",
      },
      {
        shift: 1,
        type: "thead_close",
      },
      {
        shift: 2,
        type: "tbody_open",
      },
    ],
    transform: (tokens, index): void => {
      const trToken = getMatchingOpeningToken(tokens, index);
      const thToken = tokens[index - 1];

      let colsnum = 0;
      let currentIndex = index;

      while (--currentIndex) {
        if (tokens[currentIndex] === trToken) {
          tokens[currentIndex - 1].meta = {
            ...(tokens[currentIndex + 2].meta as Record<string, unknown>),
            colsnum,
          };
          break;
        }

        // Count columns by checking if current token is a table header cell
        if (
          tokens[currentIndex].level === thToken.level &&
          tokens[currentIndex].type === thToken.type
        ) {
          colsnum += 1;
        }
      }

      tokens[index + 2].meta = {
        ...(tokens[index + 2].meta as Record<string, unknown>),
        colsnum,
      };
    },
  },
  // {
  //   /**
  //    * | A | B | C | D |
  //    * | -- | -- | -- | -- |
  //    * | 1 | 11 | 111 | 1111 {rowspan=3} |
  //    * | 2 {colspan=2 rowspan=2} | 22 | 222 | 2222 |
  //    * | 3 | 33 | 333 | 3333 |
  //    */
  //   name: "table tbody calculate",
  //   tests: [
  //     {
  //       shift: 0,
  //       type: "tbody_close",
  //       hidden: false,
  //     },
  //   ],
  //   transform: (tokens, index): void => {
  //     /** index of the tbody beginning */
  //     let tbodyOpenIndex = index - 2;

  //     while (
  //       tbodyOpenIndex > 0 &&
  //       "tbody_open" !== tokens[--tbodyOpenIndex].type
  //     );

  //     const calc = Number(tokens[tbodyOpenIndex].meta.colsnum) || 0;

  //     if (calc < 2) return;

  //     const level = tokens[index].level + 2;

  //     for (let n = tbodyOpenIndex; n < index; n++) {
  //       if (tokens[n].level > level) continue;

  //       const token = tokens[n];
  //       const rows = token.hidden ? 0 : Number(token.attrGet("rowspan")) || 0;
  //       const cols = token.hidden ? 0 : Number(token.attrGet("colspan")) || 0;

  //       if (rows > 1) {
  //         let colsnum = calc - (cols > 0 ? cols : 1);

  //         for (let k = n, num = rows; k < index, num > 1; k++) {
  //           if ("tr_open" == tokens[k].type) {
  //             tokens[k].meta = Object.assign({}, tokens[k].meta);
  //             if (tokens[k].meta?.colsnum) {
  //               colsnum -= 1;
  //             }
  //             tokens[k].meta.colsnum = colsnum;
  //             num--;
  //           }
  //         }
  //       }

  //       if ("tr_open" == token.type && token.meta?.colsnum) {
  //         const max = token.meta.colsnum;

  //         for (let k = n, num = 0; k < index; k++) {
  //           if ("td_open" == tokens[k].type) {
  //             num += 1;
  //           } else if ("tr_close" == tokens[k].type) {
  //             break;
  //           }
  //           num > max && (tokens[k].hidden || hideTable(tokens[k]));
  //         }
  //       }

  //       if (cols > 1) {
  //         const one: number[] = [];
  //         /** last index of the row's children */
  //         let end = n + 3;
  //         /** number of the row's children */
  //         let num = calc;

  //         for (let k = n; k > tbodyOpenIndex; k--) {
  //           if ("tr_open" == tokens[k].type) {
  //             num = tokens[k].meta?.colsnum || num;
  //             break;
  //           } else if ("td_open" === tokens[k].type) {
  //             one.unshift(k);
  //           }
  //         }

  //         for (let k = n + 2; k < index; k++) {
  //           if ("tr_close" == tokens[k].type) {
  //             end = k;
  //             break;
  //           } else if ("td_open" == tokens[k].type) {
  //             one.push(k);
  //           }
  //         }

  //         const off = one.indexOf(n);
  //         let real = num - off;

  //         real = real > cols ? cols : real;
  //         cols > real && token.attrSet("colspan", real + "");

  //         for (let k = one.slice(num + 1 - calc - real)[0]; k < end; k++) {
  //           tokens[k].hidden || hideTable(tokens[k]);
  //         }
  //       }
  //     }
  //   },
  // },
];

const getListRules = (options: Required<MarkdownItAttrsOptions>): Rule[] => [
  /**
   * - item
   * {.a}
   */
  {
    name: "list softbreak",
    tests: [
      {
        shift: -2,
        type: "list_item_open",
      },
      {
        shift: 0,
        type: "inline",
        children: [
          {
            position: -2,
            type: "softbreak",
          },
          {
            position: -1,
            type: "text",
            content: getDelimiterChecker(options, "only"),
          },
        ],
      },
    ],
    transform: (tokens, indx, childIndex): void => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const token = tokens[indx].children![childIndex];
      const attrs = getAttrs(token.content, 0, options);
      let ii = indx - 2;

      while (
        tokens[ii - 1] &&
        tokens[ii - 1].type !== "ordered_list_open" &&
        tokens[ii - 1].type !== "bullet_list_open"
      )
        ii--;

      addAttrs(attrs, tokens[ii - 1]);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      tokens[indx].children = tokens[indx].children!.slice(0, -2);
    },
  },

  /**
   * - nested list
   *   - with double \n
   *   {.a} <-- apply to nested ul
   *
   * {.b} <-- apply to root <ul>
   */
  {
    name: "list double softbreak",
    tests: [
      {
        // let this token be i = 0 so that we can erase
        // the <p>{.a}</p> tokens below
        shift: 0,
        type: (type) =>
          type === "bullet_list_close" || type === "ordered_list_close",
      },
      {
        shift: 1,
        type: "paragraph_open",
      },
      {
        shift: 2,
        type: "inline",
        content: getDelimiterChecker(options, "only"),
        children: (children) => children.length === 1,
      },
      {
        shift: 3,
        type: "paragraph_close",
      },
    ],
    transform: (tokens, index): void => {
      const token = tokens[index + 2];
      const attrs = getAttrs(token.content, 0, options);
      const openingToken = getMatchingOpeningToken(tokens, index);

      addAttrs(attrs, openingToken);
      tokens.splice(index + 1, 3);
    },
  },

  /**
   * - end of {.list-item}
   */
  {
    name: "list item end",
    tests: [
      {
        shift: -2,
        type: "list_item_open",
      },
      {
        shift: 0,
        type: "inline",
        children: [
          {
            position: -1,
            type: "text",
            content: getDelimiterChecker(options, "end"),
          },
        ],
      },
    ],
    transform: (tokens, index, childIndex): void => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const token = tokens[index].children![childIndex];
      const { content } = token;
      const attrs = getAttrs(
        content,
        content.lastIndexOf(options.left),
        options,
      );

      addAttrs(attrs, tokens[index - 2]);

      const trimmed = content.slice(0, content.lastIndexOf(options.left));

      token.content =
        trimmed[trimmed.length - 1] === " " ? trimmed.slice(0, -1) : trimmed;
    },
  },
];

const getSoftBreakRule = (options: Required<MarkdownItAttrsOptions>): Rule => ({
  /**
   * something with softbreak
   * {.cls}
   */

  name: "\n{.a} softbreak then curly in start",
  tests: [
    {
      shift: 0,
      type: "inline",
      children: [
        {
          position: -2,
          type: "softbreak",
        },
        {
          position: -1,
          type: "text",
          content: getDelimiterChecker(options, "only"),
        },
      ],
    },
  ],
  transform: (tokens, index, childIndex): void => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const token = tokens[index].children![childIndex];
    const attrs = getAttrs(token.content, 0, options);

    // find last closing tag
    let ii = index + 1;

    while (tokens[ii + 1] && tokens[ii + 1].nesting === -1) ii++;

    const openingToken = getMatchingOpeningToken(tokens, ii);

    addAttrs(attrs, openingToken);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    tokens[index].children = tokens[index].children!.slice(0, -2);
  },
});

const getHrRule = (options: Required<MarkdownItAttrsOptions>): Rule => ({
  /**
   * horizontal rule --- {#id}
   */
  name: "horizontal rule",
  tests: [
    {
      shift: 0,
      type: "paragraph_open",
    },
    {
      shift: 1,
      type: "inline",
      children: (children) => children.length === 1,
      content: (content) =>
        new RegExp(
          `^ {0,3}[-*_]{3,} ?${escapeRegExp(options.left)}[^${escapeRegExp(
            options.right,
          )}]`,
        ).test(content),
    },
    {
      shift: 2,
      type: "paragraph_close",
    },
  ],
  transform: (tokens, index): void => {
    const token = tokens[index];

    token.type = "hr";
    token.tag = "hr";
    token.nesting = 0;

    const { content } = tokens[index + 1];
    const start = content.lastIndexOf(options.left);
    const attrs = getAttrs(content, start, options);

    addAttrs(attrs, token);
    token.markup = content;
    tokens.splice(index + 1, 2);
  },
});

const getBlockRule = (options: Required<MarkdownItAttrsOptions>): Rule => ({
  /**
   * end of {.block}
   */

  name: "end of block",
  tests: [
    {
      shift: 0,
      type: "inline",
      children: [
        {
          position: -1,
          content: getDelimiterChecker(options, "end"),
          type: (type) => type !== "code_inline" && type !== "math_inline",
        },
      ],
    },
  ],
  transform: (tokens, indx, childIndex): void => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const token = tokens[indx].children![childIndex];
    const { content } = token;
    const attrs = getAttrs(content, content.lastIndexOf(options.left), options);
    let ii = indx + 1;

    while (tokens[ii + 1] && tokens[ii + 1].nesting === -1) ii++;

    const openingToken = getMatchingOpeningToken(tokens, ii);

    addAttrs(attrs, openingToken);

    const trimmed = content.slice(0, content.lastIndexOf(options.left));

    token.content =
      trimmed[trimmed.length - 1] === " " ? trimmed.slice(0, -1) : trimmed;
  },
});

const AVAILABLE_RULES: MarkdownItAttrRuleName[] = [
  "fence",
  "inline",
  "table",
  "list",
  "hr",
  "softbreak",
  "block",
];

export const getRules = (options: Required<MarkdownItAttrsOptions>): Rule[] => {
  const enabledRules =
    // disable
    options.rule === false
      ? []
      : Array.isArray(options.rule)
        ? // user specific rules
          options.rule.filter((item) => AVAILABLE_RULES.includes(item))
        : AVAILABLE_RULES;

  const rules: Rule[] = [];

  if (enabledRules.includes("fence")) rules.push(getFenceRule(options));
  if (enabledRules.includes("inline")) rules.push(...getInlineRules(options));
  if (enabledRules.includes("table")) rules.push(...getTableRules(options));
  if (enabledRules.includes("list")) rules.push(...getListRules(options));
  if (enabledRules.includes("softbreak")) rules.push(getSoftBreakRule(options));
  if (enabledRules.includes("hr")) rules.push(getHrRule(options));
  if (enabledRules.includes("block")) rules.push(getBlockRule(options));

  return rules;
};
