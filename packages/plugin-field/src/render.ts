import { escapeHtml } from "@mdit/helper";
import type { RendererRule } from "markdown-it";

import type { MarkdownItFieldOpenRenderer } from "./options.js";

export const getDefaultFieldOpenRender =
  (classPrefix: string): MarkdownItFieldOpenRenderer =>
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

export const defaultFieldCloseRenderer: RendererRule = () => `</dd>\n`;

export const defaultFieldsOpenRenderer: RendererRule = (tokens, index, options, _env, self) =>
  self.renderToken(tokens, index, options);

export const defaultFieldsCloseRenderer: RendererRule = (tokens, index, options, _env, self) =>
  self.renderToken(tokens, index, options);
