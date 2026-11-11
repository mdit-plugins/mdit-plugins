import type { Env, Token } from "markdown-it";

/**
 * Metadata carried by footnote tokens.
 *
 * Token renderers only serialize these fields (plus `token.attrs`), so changing them from a core
 * rule updates the output without overriding the renderer rules.
 *
 * 脚注 token 携带的元数据。
 *
 * Token 渲染器只序列化这些字段（以及 `token.attrs`），因此可以在 core 规则中修改它们来调整输出，而无需覆盖渲染规则。
 */
export interface FootNoteMeta {
  /** Zero-based footnote index. / 从 0 开始的脚注索引。 */
  id: number;
  /** Index of duplicated references to the same footnote. / 同一脚注的重复引用索引。 */
  subId?: number;
  /** Source label of the footnote. / 脚注的原始标签。 */
  label?: string;
  /** Raw target of the reference link, e.g. `#footnote-1`. / 引用链接的原始目标，例如 `#footnote-1`。 */
  href?: string;
  /** Raw id of the scroll anchor inside the reference. / 引用内部滚动锚点的原始 id。 */
  anchorId?: string;
  /** Class of the scroll anchor inside the reference. / 引用内部滚动锚点的类名。 */
  anchorClass?: string;
  /** Text of the back reference link. / 返回引用链接的文本。 */
  text?: string;
  /** Class of the footnote separator. / 脚注分隔线的类名。 */
  separatorClass?: string;
  /** Class of the footnote list. / 脚注列表的类名。 */
  listClass?: string;
}

/**
 * Footnote token with typed metadata.
 *
 * 带有类型化元数据的脚注 token。
 */
export type FootNoteToken = Token & {
  meta: FootNoteMeta;
};

/**
 * Metadata of a `footnote_ref` token.
 *
 * `footnote_ref` token 的元数据。
 */
export interface FootnoteRefMeta extends FootNoteMeta {
  href: string;
  anchorId: string;
  anchorClass: string;
}

/**
 * Metadata of a `footnote_anchor` token.
 *
 * `footnote_anchor` token 的元数据。
 */
export interface FootnoteAnchorMeta extends FootNoteMeta {
  subId: number;
  text: string;
}

/**
 * Metadata of a `footnote_block_open` token.
 *
 * `footnote_block_open` token 的元数据。
 */
export interface FootnoteBlockOpenMeta {
  /** Class of the footnote separator. / 脚注分隔线的类名。 */
  separatorClass: string;
  /** Class of the footnote list. / 脚注列表的类名。 */
  listClass: string;
}

export interface FootNoteEnv extends Env {
  docId?: string;
  footnotes?: {
    label?: string;
    refs?: Record<string, number>;
    list?: {
      label?: string;
      count?: number;
      content?: string;
      tokens?: Token[] | null;
    }[];
  };
}
