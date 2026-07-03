export const uniqueSlug = (
  slug: string,
  slugs: Record<string, boolean>,
  failOnNonUnique: boolean,
  startIndex: number,
): string => {
  let uniq = slug;
  let index = startIndex;

  if (failOnNonUnique && Object.hasOwn(slugs, uniq)) {
    throw new Error(
      `User defined "id" attribute "${slug}" is not unique. Please fix it in your Markdown to continue.`,
    );
  }

  while (Object.hasOwn(slugs, uniq)) {
    uniq = `${slug}-${index}`;
    index += 1;
  }

  slugs[uniq] = true;

  return uniq;
};

export const isLevelSelectedNumber =
  (selection: number) =>
  (level: number): boolean =>
    level >= selection;

export const isLevelSelectedArray =
  (selection: number[]) =>
  (level: number): boolean =>
    selection.includes(level);

// #region Permalink utilities

export const renderHref = (slug: string): string => `#${slug}`;

export const renderAttrs = (_slug: string): Record<string, string | number> => ({});

export const position: Record<string, "push" | "unshift"> = {
  false: "push",
  true: "unshift",
  after: "push",
  before: "unshift",
};

export const permalinkSymbolMeta = {
  isPermalinkSymbol: true,
};

export const mergeDuplicateClassAttrs = (
  attrs: [string, string | number][],
): [string, string | number][] => {
  const classValues: string[] = [];
  const mergedAttrs = attrs.filter(([key, value]) => {
    if (key !== "class") return true;

    classValues.push(String(value));

    return false;
  });

  if (classValues.length > 0) mergedAttrs.unshift(["class", classValues.join(" ")]);

  return mergedAttrs;
};
