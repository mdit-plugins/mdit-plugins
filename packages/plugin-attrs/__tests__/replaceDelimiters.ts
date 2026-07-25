export const replaceDelimiters = (text: string, options: { left: string; right: string }): string =>
  text.replaceAll("{", options.left).replaceAll("}", options.right);
