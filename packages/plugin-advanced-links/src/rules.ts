import type { BlockRule, InlineRule } from "@mdit/helper";
import type { MarkdownIt, StateInline } from "markdown-it";

import { scanProps } from "./scanProps.js";
import type { AdvancedLinkContext, ScannedAtLink } from "./types.js";

const AT = 0x40; /* @ */
const OPEN_BRACKET = 0x5b; /* [ */
const CLOSE_BRACKET = 0x5d; /* ] */
const OPEN_PAREN = 0x28; /* ( */
const CLOSE_PAREN = 0x29; /* ) */
const LINE_FEED = 0x0a; /* \n */
const CARRIAGE_RETURN = 0x0d; /* \r */
const SPACE = 0x20; /*   */
const TAB = 0x09; /* \t */

const MARKUP = "@[...](...)";

const isLineBreak = (code: number): boolean => code === LINE_FEED || code === CARRIAGE_RETURN;

/**
 * Scan cache of one inline block
 *
 * 一个行内块的扫描缓存
 *
 * Markdown-it creates an inline state for each inline block of each render, so a memo keyed by the
 * state can never be shared between renders. A memo only describes one line: the first candidate of
 * another line resets it. Nothing here is part of the public API.
 *
 * Markdown-it 会为每次渲染的每个行内块创建行内状态，因此以该状态为键的缓存绝不会跨渲染共享。缓存只描述一行： 另一行的首个候选会重置它。这里的任何内容都不属于公开 API。
 */
interface ScanMemo {
  /**
   * Start of the line the memo describes, at most the real line start
   *
   * 缓存所描述的行起始位置，不会大于真实行首
   */
  lineStart: number;

  /**
   * Position of the line break that ends the line, `-1` until one is found
   *
   * 结束本行的换行符位置，未找到前为 `-1`
   */
  lineBreak: number;

  /**
   * Every position of `[lineStart, searchedTo)` was checked for a line break, so the search never
   * repeats work when `max` shrinks (a link label) or grows again
   *
   * `[lineStart, searchedTo)` 中的每个位置都已检查过换行符，因此 `max` 缩小（链接文本）或再次变大时都不会重复搜索
   */
  searchedTo: number;

  /**
   * Bound of the failure range below, `-1` while there is none
   *
   * 下面失败范围的边界，没有失败范围时为 `-1`
   */
  bound: number;

  /**
   * Props starts at or after this position always fail on the line
   *
   * 本行中该位置及之后的属性起始位置一定无法匹配
   */
  deadFrom: number;

  /**
   * Props starts are only rejected below this position
   *
   * 只会拒绝该位置之前的属性起始位置
   */
  deadUntil: number;
}

const SCAN_MEMOS = new WeakMap<StateInline, ScanMemo>();

/**
 * Create the memo of an inline state
 *
 * 创建行内状态的缓存
 *
 * A memo only helps after a candidate failed, so the inline rule creates it lazily and successful
 * candidates never pay for it.
 *
 * 缓存只在候选失败后才有帮助，因此行内规则延迟创建它，成功的候选无需为它付出代价。
 *
 * @param state - Inline state / 行内状态
 * @returns Memo of the state / 该状态的缓存
 */
const createScanMemo = (state: StateInline): ScanMemo => {
  const memo: ScanMemo = {
    lineStart: 0,
    lineBreak: -1,
    searchedTo: 0,
    bound: -1,
    deadFrom: 0,
    deadUntil: 0,
  };

  SCAN_MEMOS.set(state, memo);

  return memo;
};

/**
 * Reset the memo to the line that starts at `start`
 *
 * 将缓存重置为从 `start` 开始的行
 *
 * @param memo - Scan memo / 扫描缓存
 * @param start - Start position of the line / 行的起始位置
 */
const resetLine = (memo: ScanMemo, start: number): void => {
  memo.lineStart = start;
  memo.lineBreak = -1;
  memo.searchedTo = start;
  memo.bound = -1;
  // the failure range of the previous line no longer applies
  memo.deadFrom = 0;
  memo.deadUntil = 0;
};

/**
 * Search the line break of the memo's line up to `max`, reusing the previous searches
 *
 * 在 `max` 之前查找缓存所在行的换行符，复用之前的搜索结果
 *
 * @param memo - Scan memo / 扫描缓存
 * @param src - Source string / 源字符串
 * @param max - Max position / 结束位置
 */
const searchLineBreak = (memo: ScanMemo, src: string, max: number): void => {
  if (memo.lineBreak !== -1 || max <= memo.searchedTo) return;

  for (let pos = memo.searchedTo; pos < max; pos++) {
    if (isLineBreak(src.charCodeAt(pos))) {
      memo.lineBreak = pos;
      break;
    }
  }

  memo.searchedTo = max;
};

/**
 * Get the end of the line that holds `start`, resetting the memo when it describes another line
 *
 * 获取 `start` 所在行的行尾，缓存的不是该行时重置缓存
 *
 * Props never cross a line break, so bounding the props scan by the line end never changes the
 * result, while it lets every candidate of the line share the same failure range. The bound also
 * depends on `max`, which is not constant: markdown-it tokenizes a link label again with `posMax`
 * set to the label end, so the failure range is dropped whenever the bound changes, while the line
 * break search is only extended, never restarted.
 *
 * 属性不会跨越换行，因此以行尾为界不会改变扫描结果，同时还能让本行的所有候选共享同一个失败范围。边界还取决于 `max`，而 `max` 并非恒定：markdown-it 会以文本结尾作为
 * `posMax` 重新解析链接文本，因此边界变化时会丢弃失败 范围，而换行符的搜索只会向后延伸，不会重新开始。
 *
 * @param memo - Scan memo / 扫描缓存
 * @param src - Source string / 源字符串
 * @param start - Start position of the candidate / 候选的起始位置
 * @param max - Max position / 结束位置
 * @returns End of the line, capped by `max` / 行尾，不会超过 `max`
 */
const getLineBound = (memo: ScanMemo, src: string, start: number, max: number): number => {
  // a candidate outside the cached line describes another line
  if (start < memo.lineStart || (memo.lineBreak !== -1 && start >= memo.lineBreak))
    resetLine(memo, start);

  searchLineBreak(memo, src, max);

  // the search can find the line break before `start`, which means `start` is on the next line
  if (memo.lineBreak !== -1 && start >= memo.lineBreak) {
    resetLine(memo, start);
    searchLineBreak(memo, src, max);
  }

  const bound = memo.lineBreak === -1 || memo.lineBreak > max ? max : memo.lineBreak;

  // the failure range is only valid for the bound it was recorded with
  if (bound !== memo.bound) {
    memo.bound = bound;
    memo.deadFrom = 0;
    memo.deadUntil = 0;
  }

  return bound;
};

/**
 * Reject after recording that the later candidates of the line cannot match either
 *
 * 拒绝，并记录本行后续候选同样无法匹配
 *
 * The scan stopped at `until`, either at the `]` that ends the props or at the line end, and a
 * later candidate starting after the last boundary it skipped reads the very same tokens from there
 * and therefore stops at the same position and fails the same way. Positions before the props start
 * were never inspected, and a position hidden inside a quoted value or an escape cannot restart the
 * scan at a token boundary, hence `from` starts after the last one of them.
 *
 * 扫描停在 `until`，即结束属性的 `]` 或行尾；从最后一个被跳过的边界之后开始的后续候选会读到完全相同的片段，
 * 因此停在同一位置并以同样的方式失败。属性起始位置之前并未被检查过，而引号或转义中隐藏的位置无法作为片段起点 重新扫描，因此 `from` 从最后一个此类位置之后开始。
 *
 * @param memo - Scan memo, or `undefined` when the scan is not memoized / 扫描缓存，不缓存时为 `undefined`
 * @param from - First props start that fails on the line / 本行首个一定失败的属性起始位置
 * @param until - Exclusive end of the rejected range / 被拒绝范围的结束位置（不含）
 * @returns Always `null` / 始终为 `null`
 */
const markDead = (memo: ScanMemo | undefined, from: number, until: number): null => {
  if (memo) {
    memo.deadFrom = from;
    memo.deadUntil = until;
  }

  return null;
};

/**
 * Normalize and validate a link destination
 *
 * 规范化并校验链接地址
 *
 * @param md - MarkdownIt instance / MarkdownIt 实例
 * @param link - Raw link destination / 原始链接地址
 * @returns Normalized link, or `null` when it is invalid / 规范化后的链接，地址无效时为 `null`
 */
const resolveLink = (md: MarkdownIt, link: string): string | null => {
  const normalizedLink = md.normalizeLink(link);

  return md.validateLink(normalizedLink) ? normalizedLink : null;
};

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
 * @param context - Parser context / 解析上下文
 * @param src - Source string / 源字符串
 * @param start - Start position / 起始位置
 * @param max - Max position / 结束位置
 * @param memo - Scan memo, given by the inline rule only / 扫描缓存，仅行内规则会提供
 * @returns Scanned result, or `null` if not matched / 扫描结果，未匹配时为 `null`
 */
export const scanAtLink = (
  context: AdvancedLinkContext,
  src: string,
  start: number,
  max: number,
  memo?: ScanMemo,
): ScannedAtLink | null => {
  const { configs, md } = context;

  // requires `@[`
  if (src.charCodeAt(start) !== AT || src.charCodeAt(start + 1) !== OPEN_BRACKET) return null;

  // the name ends with the first whitespace or the closing `]`
  const nameStart = start + 2;
  let pos = nameStart;

  while (pos < max) {
    const code = src.charCodeAt(pos);

    if (isLineBreak(code)) return null;

    if (code === CLOSE_BRACKET || code === SPACE || code === TAB) break;

    pos++;
  }

  const name = src.slice(nameStart, pos);

  // the name must not be empty
  if (!name) return null;

  const config = configs.get(name);

  // unregistered names are left to other rules
  if (!config) return null;

  // the name ends before any line break, so the candidate and its props are on the same line
  const bound = memo ? getLineBound(memo, src, start, max) : max;
  const propsStart = pos;

  // a previous candidate of the line already failed for every props start in this range
  if (memo && propsStart >= memo.deadFrom && propsStart < memo.deadUntil) return null;

  // the rest until `]` are the props
  const scanned = scanProps(src, propsStart, bound);

  // A later candidate can only repeat the failure once its scan restarts at a token boundary, which
  // is every position after a boundary hidden in a quoted value or an escape. When no `]` was read
  // at all, nothing can close the props of a later candidate either, so the whole tail fails.
  // 后续候选只有从片段起点重新扫描时才会重复同样的失败，即引号或转义中隐藏的边界之后的位置。若完全没有读取到
  // `]`，后续候选也不可能闭合属性，因此整段都会失败。
  const repeatFrom =
    !scanned.sawClose || scanned.lastHidden < propsStart ? propsStart : scanned.lastHidden + 2;

  // malformed props are rejected, so that the raw text stays visible
  if (scanned.props == null || scanned.end >= bound) {
    // the scan consumed the whole range: no later candidate can be closed by a `]` of this line
    if (scanned.end >= bound) return markDead(memo, repeatFrom, bound);

    return null;
  }

  // the scan only stops before the bound at the `]` that ends the props
  const close = scanned.end;

  pos = close + 1;

  // requires `(`
  if (src.charCodeAt(pos) !== OPEN_PAREN) return markDead(memo, repeatFrom, close);

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
    return markDead(memo, repeatFrom, close);
  }

  // requires `)`
  if (pos >= max || src.charCodeAt(pos) !== CLOSE_PAREN) return markDead(memo, repeatFrom, close);

  // Normalize and validate the destination the same way as a regular Markdown link: normalization
  // percent-encodes control characters, so an entity-decoded tab or newline cannot hide a dangerous
  // scheme from the validation. The renderer still has to HTML-escape the link and the props.
  // 与普通 Markdown 链接一样规范化并校验目标地址：规范化会对控制字符进行百分号编码，因此实体解码得到的
  // 制表符或换行无法在校验时藏匿危险 scheme。渲染器生成 HTML 时仍必须对链接与属性值做 HTML 转义。
  const normalizedLink = resolveLink(md, link);

  if (normalizedLink == null) return markDead(memo, repeatFrom, close);

  return {
    config,
    name,
    props: scanned.props,
    link: normalizedLink,
    end: pos + 1,
  };
};

/**
 * Create the block rule
 *
 * 创建块级规则
 *
 * @param context - Parser context / 解析上下文
 * @returns Block rule / 块级规则
 */
export const createBlockRule =
  (context: AdvancedLinkContext): BlockRule =>
  (state, startLine, _endLine, silent): boolean => {
    const start = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];

    // a block only occupies one line, so its scan needs no memo
    const scanned = scanAtLink(context, state.src, start, max);

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
 * @param context - Parser context / 解析上下文
 * @returns Inline rule / 行内规则
 */
export const createInlineRule =
  (context: AdvancedLinkContext): InlineRule =>
  (state, silent): boolean => {
    const { src, pos, posMax } = state;

    // The rule runs at every position of the inline content, so check the markup before touching
    // the memo of the state. / 规则会在行内内容的每个位置运行，因此先检查标记，再访问状态上的缓存。
    if (src.charCodeAt(pos) !== AT || src.charCodeAt(pos + 1) !== OPEN_BRACKET) return false;

    // A memo only helps after a failed candidate, so successful links never pay for it.
    const memo = SCAN_MEMOS.get(state);
    const scanned = scanAtLink(context, src, pos, posMax, memo);

    // On the first failure, rescan once with a memo so the dead range is recorded for the rest of
    // the line; every later failed candidate of the line is then rejected without a scan. Silent
    // look-ahead scans (e.g. markdown-it's label pre-scan) use another `posMax`, so they leave the
    // memo to the real tokenization.
    // 首次失败时补扫一次以记录本行后续候选的失败范围，之后同一行的失败候选无需再扫描。静默预查
    // （例如 markdown-it 的链接标签预查）使用的是另一个 `posMax`，因此把缓存的创建留给真正的解析。
    if (!scanned) {
      if (!memo && !silent) scanAtLink(context, src, pos, posMax, createScanMemo(state));

      return false;
    }

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
