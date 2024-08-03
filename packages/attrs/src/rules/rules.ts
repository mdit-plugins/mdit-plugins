import type { Rule } from "./types.js";
import { addAttrs, getAttrs } from "../attrs.js";
import {
  getMatchingOpeningToken,
  hasDelimiters,
  removeDelimiter,
} from "../helper.js";
import type {
  MarkdownItAttrRuleName,
  MarkdownItAttrsOptions,
} from "../options.js";
import { escapeRegExp } from "../utils.js";

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
      info: hasDelimiters("end", options.left, options.right),
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

    const start = token.info.lastIndexOf(options.left);
    const attrs = getAttrs(token.info, start, options);

    addAttrs(attrs, token);
    token.info = `${removeDelimiter(
      token.info,
      options.left,
      options.right,
    )} ${lineNumber}`;
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
    name: "inline nesting 0",
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
            content: hasDelimiters("start", options.left, options.right),
          },
        ],
      },
    ],
    transform: (tokens, index, childIndex): void => {
      const token = tokens[index].children![childIndex];

      const endChar = token.content.indexOf(options.right);
      const attrToken = tokens[index].children![childIndex - 1];
      const attrs = getAttrs(token.content, 0, options);

      addAttrs(attrs, attrToken);
      if (token.content.length === endChar + options.right.length)
        tokens[index].children!.splice(childIndex, 1);
      else token.content = token.content.slice(endChar + options.right.length);
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
            content: hasDelimiters("start", options.left, options.right),
          },
        ],
      },
    ],
    transform: (tokens, index, childIndex): void => {
      const token = tokens[index].children![childIndex];
      const { content } = token;
      const attrs = getAttrs(content, 0, options);
      const openingToken = getMatchingOpeningToken(
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

const getTableRule = (options: Required<MarkdownItAttrsOptions>): Rule => ({
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
      content: hasDelimiters("only", options.left, options.right),
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
});

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
            content: hasDelimiters("only", options.left, options.right),
          },
        ],
      },
    ],
    transform: (tokens, indx, childIndex): void => {
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
        content: hasDelimiters("only", options.left, options.right),
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
            content: hasDelimiters("end", options.left, options.right),
          },
        ],
      },
    ],
    transform: (tokens, index, childIndex): void => {
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
          content: hasDelimiters("only", options.left, options.right),
        },
      ],
    },
  ],
  transform: (tokens, index, childIndex): void => {
    const token = tokens[index].children![childIndex];
    const attrs = getAttrs(token.content, 0, options);

    // find last closing tag
    let ii = index + 1;

    while (tokens[ii + 1] && tokens[ii + 1].nesting === -1) ii++;

    const openingToken = getMatchingOpeningToken(tokens, ii);

    addAttrs(attrs, openingToken);
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
          content: hasDelimiters("end", options.left, options.right),
          type: (type) => type !== "code_inline" && type !== "math_inline",
        },
      ],
    },
  ],
  transform: (tokens, indx, childIndex): void => {
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

const availableRules: MarkdownItAttrRuleName[] = [
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
          options.rule.filter((item) => availableRules.includes(item))
        : availableRules;

  const rules: Rule[] = [];

  if (enabledRules.includes("fence")) rules.push(getFenceRule(options));
  if (enabledRules.includes("inline")) rules.push(...getInlineRules(options));
  if (enabledRules.includes("list")) rules.push(...getListRules(options));
  if (enabledRules.includes("table")) rules.push(getTableRule(options));
  if (enabledRules.includes("softbreak")) rules.push(getSoftBreakRule(options));
  if (enabledRules.includes("hr")) rules.push(getHrRule(options));
  if (enabledRules.includes("block")) rules.push(getBlockRule(options));

  return rules;
};
