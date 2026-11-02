export const uniqueSlug = (
  slug: string,
  slugs: Record<string, boolean>,
  failOnNonUnique: boolean,
  startIndex: number,
  nextIndices: Map<string, number>,
): string => {
  if (failOnNonUnique) {
    if (Object.hasOwn(slugs, slug)) {
      throw new Error(
        `User defined "id" attribute "${slug}" is not unique. Please fix it in your Markdown to continue.`,
      );
    }

    slugs[slug] = true;

    return slug;
  }

  if (!Object.hasOwn(slugs, slug)) {
    slugs[slug] = true;

    return slug;
  }

  // Used slugs are append-only, so every candidate below the index found by a
  // previous duplicate is permanently taken. Resuming the scan from there keeps
  // a long duplicate chain linear instead of rescanning it per heading.
  let index = nextIndices.get(slug) ?? startIndex;
  let uniq = `${slug}-${index}`;

  while (Object.hasOwn(slugs, uniq)) {
    index += 1;
    uniq = `${slug}-${index}`;
  }

  nextIndices.set(slug, index + 1);
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
