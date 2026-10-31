import { escapeHtml } from "@mdit/helper";
import type { RendererRule } from "markdown-it";

import type { MarkdownItFieldOpenRenderer } from "./options.js";

export const getDefaultFieldOpenRender = (classPrefix: string): MarkdownItFieldOpenRenderer => {
  // The prefix is interpolated into `class` attributes, so it must be escaped
  // like any other attribute value.
  const escapedClassPrefix = escapeHtml(classPrefix);

  return (meta): string => {
    const { name, level, attributes } = meta;

    let metaHtml = "";

    attributes.forEach((attribute) => {
      const escapedName = escapeHtml(attribute.name);
      const attrClass = `${escapedClassPrefix}attr-${escapeHtml(attribute.attr)}`;

      metaHtml += `<span class="${escapedClassPrefix}attr ${attrClass}">${
        attribute.value === true ? escapedName : `${escapedName}: ${escapeHtml(attribute.value)}`
      }</span>\n`;
    });

    return `\
<dt class="${escapedClassPrefix}name" data-level="${level}">${escapeHtml(name)}</dt>
<dd class="${escapedClassPrefix}content" data-level="${level}">
${metaHtml}`;
  };
};

export const defaultFieldCloseRenderer: RendererRule = () => `</dd>\n`;

export const defaultFieldsOpenRenderer: RendererRule = (tokens, index, options, _env, self) =>
  self.renderToken(tokens, index, options);

export const defaultFieldsCloseRenderer: RendererRule = (tokens, index, options, _env, self) =>
  self.renderToken(tokens, index, options);
