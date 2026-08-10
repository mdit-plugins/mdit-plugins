import { escapeHtml } from "@mdit/helper";
import type { RendererRule } from "markdown-it";

import type { MarkdownItFieldOpenRender } from "./options.js";

export const getDefaultFieldOpenRender =
  (classPrefix: string): MarkdownItFieldOpenRender =>
  (meta): string => {
    const { name, level, attributes } = meta;

    let metaHtml = "";

    attributes.forEach((attribute) => {
      const escapedName = escapeHtml(attribute.name);

      metaHtml += `<span class="${classPrefix}attr ${classPrefix}attr-${attribute.attr}">${
        attribute.value === true ? escapedName : `${escapedName}: ${escapeHtml(attribute.value)}`
      }</span>\n`;
    });

    return `\
<dt class="${classPrefix}name" data-level="${level}">${escapeHtml(name)}</dt>
<dd class="${classPrefix}content" data-level="${level}">
${metaHtml}`;
  };

export const defaultFieldCloseRender: RendererRule = () => `</dd>\n`;

export const defaultFieldsOpenRender: RendererRule = (tokens, index, options, _env, self) =>
  self.renderToken(tokens, index, options);

export const defaultFieldsCloseRender: RendererRule = (tokens, index, options, _env, self) =>
  self.renderToken(tokens, index, options);
