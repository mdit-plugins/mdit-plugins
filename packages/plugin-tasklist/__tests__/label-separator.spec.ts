import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { tasklist } from "../src/index.js";

const markdownIt = new MarkdownIt({ linkify: true }).use(tasklist);

describe("task list item label separator", () => {
  it("should drop the space separator before the label text", () => {
    const result = markdownIt.render("- [x] unchecked");

    expect(result).toContain(
      '<label class="task-list-item-label"><input type="checkbox" class="task-list-item-checkbox" checked="checked" disabled="disabled">unchecked</label>',
    );
  });

  it("should drop the non-breaking space separator before the label text", () => {
    const result = markdownIt.render("- [x]\u00A0unchecked");

    expect(result).toContain(
      '<label class="task-list-item-label"><input type="checkbox" class="task-list-item-checkbox" checked="checked" disabled="disabled">unchecked</label>',
    );
  });

  it("should drop only one separator when the label starts with extra spaces", () => {
    const result = markdownIt.render("- [x]  a");

    expect(result).toContain(
      '<label class="task-list-item-label"><input type="checkbox" class="task-list-item-checkbox" checked="checked" disabled="disabled"> a</label>',
    );
  });

  it("should drop only the non-breaking space when a normal space follows", () => {
    const result = markdownIt.render("- [x]\u00A0 a");

    expect(result).toContain(
      '<label class="task-list-item-label"><input type="checkbox" class="task-list-item-checkbox" checked="checked" disabled="disabled"> a</label>',
    );
  });

  it("should drop the separator when the label starts with inline markup", () => {
    const result = markdownIt.render("- [x] *unchecked*");

    expect(result).toContain(
      '<label class="task-list-item-label"><input type="checkbox" class="task-list-item-checkbox" checked="checked" disabled="disabled"><em>unchecked</em></label>',
    );
  });

  it("should drop the separator when the marker is parsed as a link", () => {
    const result = markdownIt.render(`\
[x]: /url

- [x] done
`);

    expect(result).not.toContain("<a ");
    expect(result).toContain(
      '<label class="task-list-item-label"><input type="checkbox" class="task-list-item-checkbox" checked="checked" disabled="disabled">done</label>',
    );
  });

  it("should drop the separator after a marker link followed by inline markup", () => {
    const result = markdownIt.render(`\
[x]: /url

- [x] *done*
`);

    expect(result).not.toContain("<a ");
    expect(result).toContain(
      '<label class="task-list-item-label"><input type="checkbox" class="task-list-item-checkbox" checked="checked" disabled="disabled"><em>done</em></label>',
    );
  });

  it("should drop the non-breaking space separator after a marker link", () => {
    const result = markdownIt.render(`\
[x]: /url

- [x]\u00A0done
`);

    expect(result).not.toContain("<a ");
    expect(result).toContain(
      '<label class="task-list-item-label"><input type="checkbox" class="task-list-item-checkbox" checked="checked" disabled="disabled">done</label>',
    );
  });

  it("should render an empty label when only the separator follows the marker", () => {
    const result = markdownIt.render("- [x]\u00A0");

    expect(result).toContain(
      '<label class="task-list-item-label"><input type="checkbox" class="task-list-item-checkbox" checked="checked" disabled="disabled"></label>',
    );
  });

  it("should render an empty label when only the separator follows a marker link", () => {
    const result = markdownIt.render(`\
[x]: /url

- [x]\u00A0
`);

    expect(result).not.toContain("<a ");
    expect(result).toContain(
      '<label class="task-list-item-label"><input type="checkbox" class="task-list-item-checkbox" checked="checked" disabled="disabled"></label>',
    );
  });

  it("should not treat a marker link without a separator as a task item", () => {
    const result = markdownIt.render(`\
[x]: /url

- [x]
`);

    expect(result).not.toContain("<input");
    expect(result).toContain('href="/url"');
  });

  it("should not treat a marker without a separator as a task item", () => {
    const result = markdownIt.render("- [x]no space");

    expect(result).not.toContain("<input");
  });
});
