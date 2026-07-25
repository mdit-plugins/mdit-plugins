import { escapeHtml } from "@mdit/helper";
import type { RenderRule } from "markdown-it/lib/renderer.mjs";

import type { MarkdownItFieldOpenRender } from "./options.js";

export const getDefaultFieldOpenRender =
  (classPrefix: string): MarkdownItFieldOpenRender =>
  (tokens, index): string => {
    const token = tokens[index];
    const { name, level, attributes } = token.meta;

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

export const defaultFieldCloseRender: RenderRule = () => `</dd>\n`;

export const defaultFieldsOpenRender: RenderRule = (tokens, index, options, _env, self) =>
  self.renderToken(tokens, index, options);

export const defaultFieldsCloseRender: RenderRule = (tokens, index, options, _env, self) =>
  self.renderToken(tokens, index, options);
