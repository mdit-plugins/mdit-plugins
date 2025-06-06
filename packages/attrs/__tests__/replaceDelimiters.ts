export const replaceDelimiters = (
  text: string,
  options: { left: string; right: string },
): string => text.replace(/{/g, options.left).replace(/}/g, options.right);
