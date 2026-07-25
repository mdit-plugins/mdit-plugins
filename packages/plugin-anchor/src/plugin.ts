import type { PluginWithOptions } from "markdown-it";
import type StateCore from "markdown-it/lib/rules_core/state_core.mjs";

import { defaultGetTokensText, defaultSlugify } from "./defaults.js";
import type { AnchorOptions } from "./options.js";
import { isLevelSelectedArray, isLevelSelectedNumber, uniqueSlug } from "./utils.js";

export const anchor: PluginWithOptions<AnchorOptions> = (md, options = {}): void => {
  const {
    level = 1,
    slugify = defaultSlugify,
    slugifyWithState,
    uniqueSlugStartIndex = 1,
    tabIndex = "-1",
    getTokensText = defaultGetTokensText,
    permalink,
    callback,
  } = options;

  md.core.ruler.push("anchor", (state: StateCore): void => {
    const slugs: Record<string, boolean> = {};
    const { tokens } = state;

    const isLevelSelected = Array.isArray(level)
      ? isLevelSelectedArray(level)
      : isLevelSelectedNumber(level);

    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index];

      if (token.type !== "heading_open") continue;

      if (!isLevelSelected(Number(token.tag.slice(1)))) continue;

      // oxlint-disable-next-line typescript/no-non-null-assertion
      const title = getTokensText(tokens[index + 1].children!);

      let slug = token.attrGet("id");

      slug =
        slug == null
          ? uniqueSlug(
              slugifyWithState ? slugifyWithState(title, state) : slugify(title),
              slugs,
              false,
              uniqueSlugStartIndex,
            )
          : uniqueSlug(slug, slugs, true, uniqueSlugStartIndex);

      token.attrSet("id", slug);

      if (tabIndex !== false) token.attrSet("tabindex", `${tabIndex}`);

      if (typeof permalink === "function")
        permalink(slug, options as Record<string, unknown>, state, index);

      // A permalink renderer could modify the `tokens` array so
      // make sure to get the up-to-date index on each iteration.
      index = tokens.indexOf(token);

      // oxlint-disable-next-line promise/prefer-await-to-callbacks
      if (callback) callback(token, { slug, title });
    }
  });
};
