import { escapeHtml } from "@mdit/helper";
import type { RenderRule } from "markdown-it/lib/renderer.mjs";

import type { MarkdownItFieldOpenRender } from "./options.js";

const SANITIZE_RE = /[^a-zA-Z0-9-]/g;

/**
 * Sanitize a key for use in CSS class names.
 * Only allows alphanumeric characters and hyphens.
 *
 * 清洗用于 CSS 类名的键值。
 * 仅允许字母数字和连字符。
 *
 * @param key - raw attribute key / 原始属性键
 * @returns sanitized key / 清洗后的键
 */
export const sanitizeKey = (key: string): string => key.replace(SANITIZE_RE, "");

export const getDefaultFieldOpenRender =
  (classPrefix: string): MarkdownItFieldOpenRender =>
  (tokens, index): string => {
    const token = tokens[index];
    const { name, level, attributes } = token.meta;

    let metaHtml = "";

    attributes.forEach((attr) => {
      const { name, value, attr: key } = attr;
      const escapedName = escapeHtml(name);
      const sanitizedKey = sanitizeKey(key);

      if (value === true) {
        metaHtml += `\
    <span class="${classPrefix}attr ${classPrefix}attr-${sanitizedKey}">${escapedName}</span>
`;
      } else {
        metaHtml += `\
    <span class="${classPrefix}attr ${classPrefix}attr-${sanitizedKey}">${escapedName}: ${escapeHtml(String(value))}</span>
`;
      }
    });

    return `\
<div class="${classPrefix}item" data-level="${level}">
  <div class="${classPrefix}header">
    <span class="${classPrefix}name">${escapeHtml(name)}</span>\
${metaHtml}
  </div>
  <div class="${classPrefix}content">`;
  };

export const defaultFieldCloseRender: RenderRule = () => `</div></div>`;

export const defaultFieldsOpenRender: RenderRule = (tokens, index, options, _env, self) =>
  self.renderToken(tokens, index, options);

export const defaultFieldsCloseRender: RenderRule = (tokens, index, options, _env, self) =>
  self.renderToken(tokens, index, options);
