/**
 * Removes the common leading whitespace from each line.
 *
 * Blank and whitespace-only lines are ignored when computing the common indent; a tab counts as one
 * indentation character.
 *
 * 移除每行共同的前导空白。
 *
 * 计算公共缩进时会忽略空行与纯空白行；制表符按一个缩进字符计算。
 *
 * @param text - The text to dedent / 要移除缩进的文本
 * @returns The dedented text / 移除缩进后的文本
 */
export const dedent = (text: string): string => {
  const lines = text.split("\n");
  let minIndentLength = Infinity;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const { length } = line;

    for (let index = 0; index < length; index++) {
      const charCode = line.charCodeAt(index);

      if (charCode !== 32 /* space */ && charCode !== 9 /* tab */) {
        // At least one line starts at column 0, so removing the common indent is a no-op.
        if (index === 0) return text;

        if (index < minIndentLength) minIndentLength = index;
        break;
      }
    }
  }

  // Every line is blank or whitespace-only, so there is nothing to remove.
  if (minIndentLength === Infinity) return text;

  return lines.map((line) => line.slice(minIndentLength)).join("\n");
};
