import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { tasklist } from "../src/index.js";

const markdownIt = new MarkdownIt({ linkify: true }).use(tasklist);

describe("tasklist with link reference definitions", () => {
  it("should not render the checked marker as a link", () => {
    const result = markdownIt.render(`
[x]: /url

- [x] done
`);

    expect(result).not.toContain("<a ");
    expect(result).not.toContain('href="/url"');
    expect(result).toContain('checked="checked"');
    expect(result).toContain('<label class="task-list-item-label" for="task-item-0"> done</label>');
  });

  it("should keep content after the marker", () => {
    const result = markdownIt.render(`
[x]: /url
[foo]: /foo

- [x] [foo]
- [X] [bar](https://example.com)
- [ ] unchecked
`);

    expect(result).not.toContain('href="/url"');
    expect(result).toContain(
      '<label class="task-list-item-label" for="task-item-0"> <a href="/foo">foo</a></label>',
    );
    expect(result).toContain(
      '<label class="task-list-item-label" for="task-item-1"> <a href="https://example.com">bar</a></label>',
    );
    expect(result).toContain(" unchecked</label>");
    expect(result.match(/checked="checked"/g)).toHaveLength(2);
  });

  it("should remove the marker link when label is disabled", () => {
    const markdownItWithoutLabel = new MarkdownIt({ linkify: true }).use(tasklist, {
      label: false,
    });

    const result = markdownItWithoutLabel.render(`
[x]: /url

- [x] done
`);

    expect(result).not.toContain("<a ");
    expect(result).not.toContain("<label");
    expect(result).toContain('checked="checked"');
    expect(result).toContain("> done</li>");
  });
});
