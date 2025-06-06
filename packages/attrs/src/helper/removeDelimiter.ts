import { escapeRegExp } from "@mdit/helper";

export const removeDelimiter = (
  str: string,
  left: string,
  right: string,
): string => {
  const start = escapeRegExp(left);
  const end = escapeRegExp(right);
  const pos = str.search(
    new RegExp(`[ \\n]?${start}[^${start}${end}]+${end}$`),
  );

  return pos !== -1 ? str.slice(0, pos) : str;
};
