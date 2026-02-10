export interface EmojiPluginOptions {
  /**
   * Emoji definitions
   *
   * 表情定义
   *
   * @default {}
   */
  defs?: Record<string, string>;

  /**
   * Enabled emojis
   *
   * 启用的表情
   *
   * @default []
   */
  enabled?: string[];

  /**
   * Shortcut definitions
   *
   * 快捷键定义
   *
   * @default {}
   */
  shortcuts?: Record<string, string | string[]>;
}
