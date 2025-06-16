export const dedent = (text: string): string => {
  const lines = text.split("\n");

  const minIndentLength = lines.reduce((acc, line) => {
    for (let i = 0; i < line.length; i++)
      if (line[i] !== " " && line[i] !== "\t") return Math.min(i, acc);

    return acc;
  }, Infinity);

  if (minIndentLength < Infinity)
    return lines.map((x) => x.slice(minIndentLength)).join("\n");

  return text;
};
