import type { BlockRule, InlineRule } from "@mdit/helper";
import type { MarkdownIt } from "markdown-it";

import { parseProps } from "./parseProps.js";
import type { AdvancedLinkConfigs, ScannedAtLink } from "./types.js";

const AT = 0x40; /* @ */
const OPEN_BRACKET = 0x5b; /* [ */
const CLOSE_BRACKET = 0x5d; /* ] */
const OPEN_PAREN = 0x28; /* ( */
const CLOSE_PAREN = 0x29; /* ) */
const DOUBLE_QUOTE = 0x22; /* " */
const SINGLE_QUOTE = 0x27; /* ' */
const BACKSLASH = 0x5c; /* \ */
const LINE_FEED = 0x0a; /* \n */
const CARRIAGE_RETURN = 0x0d; /* \r */
const SPACE = 0x20; /*   */
const TAB = 0x09; /* \t */

const MARKUP = "@[...](...)";

const isLineBreak = (code: number): boolean => code === LINE_FEED || code === CARRIAGE_RETURN;

/**
 * Scan an advanced link at the given position
 *
 * 在指定位置扫描高级链接
 *
 * The syntax is `@[name ...props](link)`. Nothing is matched when the name is unregistered, so that
 * markdown-it can process the content normally.
 *
 * 语法为 `@[name ...props](link)`。名称未注册时不匹配，以便 markdown-it 正常处理该内容。
 *
 * @param configs - Registered configs / 已注册的配置
 * @param md - MarkdownIt instance / MarkdownIt 实例
 * @param src - Source string / 源字符串
 * @param start - Start position / 起始位置
 * @param max - Max position / 结束位置
 * @returns Scanned result, or `null` if not matched / 扫描结果，未匹配时为 `null`
 */
export const scanAtLink = (
  configs: AdvancedLinkConfigs,
  md: MarkdownIt,
  src: string,
  start: number,
  max: number,
): ScannedAtLink | null => {
  // requires `@[`
  if (src.charCodeAt(start) !== AT || src.charCodeAt(start + 1) !== OPEN_BRACKET) return null;

  let pos = start + 2;

  // find the matching `]`, while `]` inside quotes belongs to the props
  while (pos < max) {
    const code = src.charCodeAt(pos);

    if (isLineBreak(code)) return null;

    if (code === CLOSE_BRACKET) break;

    if (code === DOUBLE_QUOTE || code === SINGLE_QUOTE) {
      pos++;

      while (pos < max) {
        const innerCode = src.charCodeAt(pos);

        if (isLineBreak(innerCode)) return null;

        // the escaped character never ends the quote
        if (innerCode === BACKSLASH) {
          pos += 2;

          continue;
        }

        if (innerCode === code) break;

        pos++;
      }

      // unterminated quote
      if (pos >= max) return null;
    }

    pos++;
  }

  // no closing `]`
  if (pos >= max) return null;

  const contentStart = start + 2;
  const contentEnd = pos;
  let nameEnd = contentEnd;
  let propsStart = contentEnd;

  // the name ends with the first whitespace, the rest are props
  for (let index = contentStart; index < contentEnd; index++) {
    const code = src.charCodeAt(index);

    if (code === SPACE || code === TAB) {
      nameEnd = index;
      propsStart = index + 1;
      break;
    }
  }

  const name = src.slice(contentStart, nameEnd);

  // the name must not be empty
  if (!name) return null;

  const config = configs.get(name);

  // unregistered names are left to other rules
  if (!config) return null;

  pos = contentEnd + 1;

  // requires `(`
  if (pos >= max || src.charCodeAt(pos) !== OPEN_PAREN) return null;

  const destination = md.helpers.parseLinkDestination(src, pos + 1, max);
  let link: string;

  if (destination.ok) {
    link = destination.str;
    pos = destination.pos;
  } else if (pos + 1 < max && src.charCodeAt(pos + 1) === CLOSE_PAREN) {
    // an empty destination is allowed: `@[name]()`
    link = "";
    pos++;
  } else {
    return null;
  }

  // requires `)`
  if (pos >= max || src.charCodeAt(pos) !== CLOSE_PAREN) return null;

  const props = parseProps(src.slice(propsStart, contentEnd));

  // malformed props are rejected, so that the raw text stays visible
  if (!props) return null;

  return {
    config,
    name,
    props,
    link,
    end: pos + 1,
  };
};

/**
 * Create the block rule
 *
 * 创建块级规则
 *
 * @param configs - Registered configs / 已注册的配置
 * @returns Block rule / 块级规则
 */
export const createBlockRule =
  (configs: AdvancedLinkConfigs): BlockRule =>
  (state, startLine, _endLine, silent): boolean => {
    const start = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];

    const scanned = scanAtLink(configs, state.md, state.src, start, max);

    if (!scanned) return false;

    // the block syntax must occupy the whole line
    for (let pos = scanned.end; pos < max; pos++) {
      const code = state.src.charCodeAt(pos);

      if (code !== SPACE && code !== TAB) return false;
    }

    if (silent) return true;

    const token = state.push("advanced_link_block", "", 0);

    token.block = true;
    token.info = scanned.name;
    token.content = scanned.link;
    token.markup = MARKUP;
    token.map = [startLine, startLine + 1];
    token.meta = scanned.props;

    state.line = startLine + 1;

    return true;
  };

/**
 * Create the inline rule
 *
 * 创建行内规则
 *
 * @param configs - Registered configs / 已注册的配置
 * @returns Inline rule / 行内规则
 */
export const createInlineRule =
  (configs: AdvancedLinkConfigs): InlineRule =>
  (state, silent): boolean => {
    const scanned = scanAtLink(configs, state.md, state.src, state.pos, state.posMax);

    if (!scanned) return false;

    // the inline syntax is opt-in for each config
    if (!scanned.config.inline) return false;

    // markdown-it requires the position to be advanced even in silent mode
    state.pos = scanned.end;

    if (silent) return true;

    const token = state.push("advanced_link_inline", "", 0);

    token.info = scanned.name;
    token.content = scanned.link;
    token.markup = MARKUP;
    token.meta = scanned.props;

    return true;
  };
