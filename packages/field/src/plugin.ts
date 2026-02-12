import type { PluginWithOptions } from "markdown-it";

import type { MarkdownItFieldOptions } from "./options.js";
import {
  defaultFieldCloseRender,
  getDefaultFieldOpenRender,
  defaultFieldsCloseRender,
  defaultFieldsOpenRender,
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
    fieldsOpenRender = defaultFieldsOpenRender,
    fieldsCloseRender = defaultFieldsCloseRender,
    fieldOpenRender,
    fieldCloseRender = defaultFieldCloseRender,
  } = {},
) => {
  const normalizedAttributes = normalizeAttributes(allowedAttributes);
  const fieldsScanner = getFieldsScanner(name);
  const resolvedFieldOpenRender = fieldOpenRender ?? getDefaultFieldOpenRender(classPrefix);

  md.block.ruler.before("fence", name, getFieldsRule(name, classPrefix), {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  md.block.ruler.before(
    "paragraph",
    `${name}_item`,
    getFieldItemRule(name, normalizedAttributes, shouldParseAttributes),
    {
      alt: ["paragraph", "reference", "blockquote", "list"],
    },
  );

  md.renderer.rules[`${name}_fields_open`] = fieldsOpenRender;
  md.renderer.rules[`${name}_fields_close`] = fieldsCloseRender;
  md.renderer.rules[`${name}_fields_inner_open`] = defaultFieldsOpenRender;
  md.renderer.rules[`${name}_fields_inner_close`] = defaultFieldsCloseRender;

  md.renderer.rules[`${name}_field_open`] = resolvedFieldOpenRender;
  md.renderer.rules[`${name}_field_close`] = fieldCloseRender;

  // Run the scanner as a core rule to hide pre-field content in parse phase
  md.core.ruler.push(`${name}_fields_scanner`, (state) => {
    fieldsScanner(state.tokens);
  });
};
