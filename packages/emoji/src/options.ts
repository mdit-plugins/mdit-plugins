export interface EmojiPluginOptions {
  /**
   * Emoji definitions
   *
   * 表情定义
   *
   * @description The key is the emoji name, and the value is the URL of the emoji character.
   * 键是表情名称，值是表情字符。
   */
  definitions?: Record<string, string>;

  /**
   * Enabled emojis
   *
   * 启用的表情
   *
   * @description If specified, only emojis in this list will be rendered. Otherwise, all emojis in the definitions will be rendered.
   * 如果指定了这个选项，只有在这个列表中的表情才会被渲染。否则，定义中的所有表情都会被渲染。
   *
   * @default []
   */
  enabled?: string[];

  /**
   * Shortcut definitions
   *
   * 快捷键定义
   *
   * @description The key is the emoji name, and the value is the shortcut(s) for the emoji.
   * 键是表情名称，值是表情的快捷短语。
   *
   * @default {}
   */
  shortcuts?: Record<string, string | string[]>;
}
