import type { Token } from "markdown-it";

import type { FootnoteOptions } from "./options.js";
import type { FootNoteEnv, FootNoteToken } from "./types.js";

/** Token nesting value used by markdown-it / markdown-it 使用的 token 嵌套值 */
type TokenNesting = Token["nesting"];

/** Constructor of markdown-it tokens, exposed as `state.Token` / markdown-it Token 构造函数 */
export type TokenConstructor = new (type: string, tag: string, nesting: TokenNesting) => Token;

type FootNoteMeta = FootNoteToken["meta"];

/** `↩` with the variation selector to prevent it being displayed as an Apple emoji on iOS */
const BACK_REFERENCE_TEXT = "\u21A9\uFE0E";

/**
 * Create a markdown-it token with attributes / 创建带属性的 markdown-it token
 *
 * @param Token - Token constructor / Token 构造函数
 * @param type - Token type / token 类型
 * @param tag - HTML tag name / HTML 标签名
 * @param nesting - Token nesting / token 嵌套层级
 * @param attrs - Initial attributes / 初始属性
 * @returns The created token / 创建的 token
 */
export const createToken = (
  Token: TokenConstructor,
  type: string,
  tag: string,
  nesting: TokenNesting,
  attrs?: [string, string][],
): Token => {
  const token = new Token(type, tag, nesting);

  if (attrs) token.attrs = attrs;

  return token;
};

/**
 * Create a block markdown-it token with attributes / 创建带属性的块级 markdown-it token
 *
 * @param Token - Token constructor / Token 构造函数
 * @param type - Token type / token 类型
 * @param tag - HTML tag name / HTML 标签名
 * @param nesting - Token nesting / token 嵌套层级
 * @param attrs - Initial attributes / 初始属性
 * @returns The created block token / 创建的块级 token
 */
export const createBlockToken = (
  Token: TokenConstructor,
  type: string,
  tag: string,
  nesting: TokenNesting,
  attrs?: [string, string][],
): Token => {
  const token = createToken(Token, type, tag, nesting, attrs);

  token.block = true;

  return token;
};

/**
 * Create a text token / 创建文本 token
 *
 * @param Token - Token constructor / Token 构造函数
 * @param content - Text content / 文本内容
 * @returns The created token / 创建的 token
 */
export const createTextToken = (Token: TokenConstructor, content: string): Token => {
  const token = new Token("text", "", 0);

  token.content = content;

  return token;
};

/**
 * Merge caller-provided attributes into a token / 将调用方提供的属性合并到 token
 *
 * `class` is appended to the existing classes so that the built-in class is preserved; other
 * attributes are set directly and override the generated value.
 *
 * `class` 会追加到已有类名之后，以保留内置类名；其他属性会直接设置，从而覆盖生成的值。
 *
 * @param token - Token to modify / 要修改的 token
 * @param attrs - Extra attributes / 额外属性
 */
export const applyAttrs = (
  token: Token,
  attrs?: Readonly<Record<string, string | number>>,
): void => {
  if (!attrs) return;

  for (const [name, value] of Object.entries(attrs)) {
    if (name === "class") {
      const classValue = String(value);

      // Ignore empty class values so `class=""` does not leave a trailing space.
      if (classValue) token.attrJoin(name, classValue);
    } else {
      token.attrSet(name, String(value));
    }
  }
};

/**
 * Clone a token and replace its children / 克隆 token 并替换其 children
 *
 * Tokens from `env.footnotes.list` are reused when the same environment is rendered again; mutating
 * their children would corrupt the cached parse result. This helper renders a copy instead.
 *
 * 同一个环境被重复渲染时会复用 `env.footnotes.list` 中的 token；直接修改它们的 children 会污染 缓存的解析结果，因此这里改为渲染副本。
 *
 * @param Token - Token constructor / Token 构造函数
 * @param token - Token to clone / 要克隆的 token
 * @param children - Replacement children / 替换后的 children
 * @returns The cloned token / 克隆后的 token
 */
export const cloneTokenWithChildren = (
  Token: TokenConstructor,
  token: Token,
  children: Token[],
): Token => {
  const cloned = new Token(token.type, token.tag, token.nesting);

  Object.assign(cloned, token);
  cloned.children = children;

  return cloned;
};

/**
 * Create the id suffix for duplicated footnote references / 创建重复脚注引用的 id 后缀
 *
 * @param subId - Reference index of the same footnote / 同一脚注的引用序号
 * @returns `:n` for duplicated references, otherwise an empty string / 重复引用返回 `:n`，否则返回空字符串
 */
export const getFootnoteSuffix = (subId = 0): string => (subId > 0 ? `:${subId.toString()}` : "");

/**
 * Create the anchor name used in generated ids and hrefs / 创建生成 id 和 href 使用的锚点名
 *
 * @param env - Markdown-it environment / markdown-it 环境
 * @param id - Footnote index / 脚注序号
 * @returns The anchor name / 锚点名
 */
export const getFootnoteAnchorName = (env: FootNoteEnv, id: number): string => {
  const docId = env.docId;

  // `docId` is escaped by the renderer when it serializes the attribute.
  return `${typeof docId === "string" ? `-${docId}-` : ""}${(id + 1).toString()}`;
};

/**
 * Create the visible caption of a footnote reference / 创建脚注引用的可见标题
 *
 * @param id - Footnote index / 脚注序号
 * @param subId - Reference index of the same footnote / 同一脚注的引用序号
 * @returns The caption, e.g. `[1]` or `[1:1]` / 例如 `[1]` 或 `[1:1]`
 */
export const getFootnoteCaption = (id: number, subId = 0): string =>
  `[${(id + 1).toString()}${getFootnoteSuffix(subId)}]`;

/**
 * Create the standard tokens of a footnote reference / 创建脚注引用的标准 token
 *
 * @param Token - Token constructor / Token 构造函数
 * @param meta - Reference token meta / 引用 token 的 meta
 * @param env - Markdown-it environment / markdown-it 环境
 * @param options - Plugin options / 插件选项
 * @returns The replacement tokens / 替换后的 token
 */
export const createFootnoteRefTokens = (
  Token: TokenConstructor,
  meta: FootNoteMeta,
  env: FootNoteEnv,
  options: FootnoteOptions,
): Token[] => {
  const name = getFootnoteAnchorName(env, meta.id);
  const suffix = getFootnoteSuffix(meta.subId);
  const supOpenToken = createToken(Token, "sup_open", "sup", 1, [["class", "footnote-ref"]]);

  applyAttrs(supOpenToken, options.refAttrs);

  return [
    supOpenToken,
    createToken(Token, "link_open", "a", 1, [["href", `#footnote${name}`]]),
    createTextToken(Token, getFootnoteCaption(meta.id, meta.subId)),
    createToken(Token, "link_close", "a", -1),
    createToken(Token, "link_open", "a", 1, [
      ["class", "footnote-anchor"],
      ["id", `footnote-ref${name}${suffix}`],
    ]),
    createToken(Token, "link_close", "a", -1),
    createToken(Token, "sup_close", "sup", -1),
  ];
};

/**
 * Recalculate token levels for a block of tokens / 重新计算一组 token 的层级
 *
 * @param tokens - Tokens to process in place / 就地处理的 token
 */
export const normalizeTokenLevels = (tokens: Token[]): void => {
  let level = 0;

  for (const token of tokens) {
    if (token.nesting === -1) level--;
    token.level = level;
    if (token.nesting === 1) level++;
  }
};

/**
 * Create the standard tokens of a footnote back-reference / 创建脚注反向引用的标准 token
 *
 * @param Token - Token constructor / Token 构造函数
 * @param name - Footnote anchor name / 脚注锚点名
 * @param suffix - Duplicated reference suffix / 重复引用后缀
 * @param options - Plugin options / 插件选项
 * @returns The back-reference tokens / 反向引用 token
 */
export const createBackReferenceTokens = (
  Token: TokenConstructor,
  name: string,
  suffix: string,
  options: FootnoteOptions,
): Token[] => {
  const linkOpenToken = createToken(Token, "link_open", "a", 1, [
    ["href", `#footnote-ref${name}${suffix}`],
    ["class", "footnote-backref"],
  ]);

  applyAttrs(linkOpenToken, options.backrefAttrs);

  const tokens = [
    createTextToken(Token, " "),
    linkOpenToken,
    createTextToken(Token, BACK_REFERENCE_TEXT),
    createToken(Token, "link_close", "a", -1),
  ];

  normalizeTokenLevels(tokens);

  return tokens;
};

/**
 * Remove internal `footnote_ref` tokens from the children of an `image` token / 从 `image` token
 * 的子节点中移除内部 `footnote_ref` token
 *
 * The default image renderer flattens the alt text from `token.children`, so replacing the
 * reference token there would change the rendered `alt` attribute. The reference marker is not
 * rendered inside alt text, therefore the token is dropped.
 *
 * 默认的图片渲染器会从 `token.children` 中扁平化替代文本，因此在其中替换引用 token 会改变渲染出的 `alt` 属性。替代文本中不会渲染引用标记，因此这里直接移除该
 * token。
 *
 * @param tokens - Tokens to process in place / 就地处理的 token
 */
const removeFootnoteRefs = (tokens: Token[]): void => {
  for (let index = tokens.length - 1; index >= 0; index--) {
    const token = tokens[index];

    if (token.type === "footnote_ref") tokens.splice(index, 1);
    else if (token.children) removeFootnoteRefs(token.children);
  }
};

/**
 * Replace the internal `footnote_ref` tokens with standard tokens / 将内部 `footnote_ref` token 替换为标准
 * token
 *
 * @param Token - Token constructor / Token 构造函数
 * @param tokens - Tokens to process in place / 就地处理的 token
 * @param env - Markdown-it environment / markdown-it 环境
 * @param options - Plugin options / 插件选项
 */
export const replaceFootnoteRefs = (
  Token: TokenConstructor,
  tokens: Token[],
  env: FootNoteEnv,
  options: FootnoteOptions,
): void => {
  let depth = 0;

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];

    if (token.nesting === -1) depth--;

    if (token.type === "footnote_ref") {
      const replacement = createFootnoteRefTokens(Token, token.meta as FootNoteMeta, env, options);
      let replacementDepth = depth;

      for (const replacementToken of replacement) {
        if (replacementToken.nesting === -1) replacementDepth--;
        replacementToken.level = replacementDepth;
        if (replacementToken.nesting === 1) replacementDepth++;
      }

      tokens.splice(index, 1, ...replacement);
      index += replacement.length - 1;
    } else if (token.children) {
      if (token.type === "image") removeFootnoteRefs(token.children);
      else replaceFootnoteRefs(Token, token.children, env, options);
    }

    if (token.nesting === 1) depth++;
  }
};
