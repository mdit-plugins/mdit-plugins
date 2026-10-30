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

  const minIndentLength = lines.reduce((acc, line) => {
    for (let i = 0; i < line.length; i++)
      if (line[i] !== " " && line[i] !== "\t") return Math.min(i, acc);

    return acc;
  }, Infinity);

  if (minIndentLength < Infinity)
    return lines.map((line) => line.slice(minIndentLength)).join("\n");

  return text;
};
