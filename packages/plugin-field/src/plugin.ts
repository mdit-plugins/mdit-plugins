import type { PluginWithOptions } from "@mdit/helper";
import type { MarkdownIt } from "markdown-it";

import type { FieldMeta, MarkdownItFieldOptions } from "./options.js";
import {
  defaultFieldCloseRenderer,
  getDefaultFieldOpenRender,
  defaultFieldsCloseRenderer,
  defaultFieldsOpenRenderer,
} from "./render.js";
import { getFieldItemRule, getFieldsRule, getFieldsScanner } from "./rules.js";
import { normalizeAttributes } from "./utils.js";

/**
 * Field plugin
 *
 * 字段插件
 *
 * @param md - MarkdownIt instance / MarkdownIt 实例
 * @param options - Field options / 字段选项
 */
export const field: PluginWithOptions<MarkdownItFieldOptions> = (
  md,
  {
    name = "fields",
    classPrefix = "field-",
    parseAttributes: shouldParseAttributes = true,
    allowedAttributes,
    fieldsOpenRenderer = defaultFieldsOpenRenderer,
    fieldsCloseRenderer = defaultFieldsCloseRenderer,
    fieldOpenRenderer = getDefaultFieldOpenRender(classPrefix),
    fieldCloseRenderer = defaultFieldCloseRenderer,
  } = {},
) => {
  const normalizedAttributes = normalizeAttributes(allowedAttributes);
  const fieldsScanner = getFieldsScanner(name);

  // Repeated installation of the same configuration must not register the rules twice. The
  // configurable `name` may collide with a built-in or another plugin's rule name (`table`,
  // `layout_item`, ...), so the plugin namespaces its own parser rules and tracks installed names
  // on the markdown-it instance; a repeated installation of the same name is a true no-op.
  const mdWithState = md as MarkdownIt & { __fieldNames?: Set<string> };
  // oxlint-disable-next-line no-underscore-dangle
  const installedNames = (mdWithState.__fieldNames ??= new Set<string>());

  if (installedNames.has(name)) return;

  installedNames.add(name);

  md.block.ruler.before("fence", `field_${name}`, getFieldsRule(name, classPrefix), {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  md.block.ruler.before(
    "paragraph",
    `field_${name}_item`,
    getFieldItemRule(name, normalizedAttributes, shouldParseAttributes),
    {
      alt: ["paragraph", "reference", "blockquote", "list"],
    },
  );

  md.renderer.rules[`${name}_fields_open`] = fieldsOpenRenderer;
  md.renderer.rules[`${name}_fields_close`] = fieldsCloseRenderer;
  md.renderer.rules[`${name}_fields_inner_open`] = defaultFieldsOpenRenderer;
  md.renderer.rules[`${name}_fields_inner_close`] = defaultFieldsCloseRenderer;

  md.renderer.rules[`${name}_field_open`] = (tokens, index, options, env, self): string => {
    const meta = tokens[index].meta as FieldMeta;

    return fieldOpenRenderer(meta, tokens, index, options, env, self);
  };
  md.renderer.rules[`${name}_field_close`] = fieldCloseRenderer;

  // Run the scanner as a core rule to hide pre-field content in parse phase
  md.core.ruler.push(`field_${name}_fields_scanner`, (state) => {
    fieldsScanner(state.tokens);
  });
};
