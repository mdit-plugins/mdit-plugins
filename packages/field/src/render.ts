import { escapeHtml } from "@mdit/helper";
import type { RenderRule } from "markdown-it/lib/renderer.mjs";

import type { MarkdownItFieldOpenRender } from "./options.js";

export const getDefaultFieldOpenRender =
  (classPrefix: string): MarkdownItFieldOpenRender =>
  (tokens, index): string => {
    const token = tokens[index];
    const { name, level, attributes } = token.meta;

    let metaHtml = "";

    attributes.forEach((attr) => {
      const { name, value, attr: key } = attr;
      const escapedName = escapeHtml(name);

      if (value === true) {
        metaHtml += `\
    <span class="${classPrefix}attr ${classPrefix}attr-${key}">${escapedName}</span>
`;
      } else {
        metaHtml += `\
    <span class="${classPrefix}attr ${classPrefix}attr-${key}">${escapedName}: ${escapeHtml(String(value))}</span>
`;
      }
    });

    return `\
<div class="${classPrefix}item" data-level="${level}">
  <div class="${classPrefix}header">
    <span class="${classPrefix}name">${escapeHtml(name)}</span>\
${metaHtml}
  </div>
  <div class="${classPrefix}content">
`;
  };

export const defaultFieldCloseRender: RenderRule = () => `\
  </div>
</div>
`;

export const defaultFieldsOpenRender: RenderRule = (tokens, index, options, _env, self) =>
  self.renderToken(tokens, index, options);

export const defaultFieldsCloseRender: RenderRule = (tokens, index, options, _env, self) =>
  self.renderToken(tokens, index, options);
