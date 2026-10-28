// @vitest-environment happy-dom

import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { tasklist } from "../src/index.js";

const source = `\
- [ ] unchecked
- [x] checked
`;

const countMatches = (html: string, pattern: RegExp): number => html.match(pattern)?.length ?? 0;

const getCheckboxIds = (html: string): string[] =>
  [...html.matchAll(/<input\b[^>]*\bid="(?<id>[^"]+)"/g)].map(({ groups }) => groups?.id ?? "");

const getElement = <T extends Element>(
  container: ParentNode,
  selector: string,
  constructor: new () => T,
): T => {
  const element = container.querySelector(selector);

  if (!(element instanceof constructor)) throw new Error(`Missing element: ${selector}`);

  return element;
};

describe("tasklist repeated installation", () => {
  it("should be idempotent when used multiple times", () => {
    const singleUse = new MarkdownIt().use(tasklist);
    const multipleUses = new MarkdownIt().use(tasklist).use(tasklist).use(tasklist);

    const expected = singleUse.render(source);
    const result = multipleUses.render(source);

    expect(result).toBe(expected);
    expect(countMatches(result, /<input\b/g)).toBe(2);
    expect(countMatches(result, /<label\b/g)).toBe(2);
    expect(countMatches(result, /<\/label>/g)).toBe(2);
  });

  it("should keep the options from the first use", () => {
    const md = new MarkdownIt()
      .use(tasklist, { label: false, checkboxClass: "first-checkbox" })
      .use(tasklist, { label: true, checkboxClass: "second-checkbox" });

    const result = md.render("- [ ] unchecked");

    expect(result).not.toContain("<label");
    expect(result).not.toContain("</label>");
    expect(result).toContain('class="first-checkbox"');
    expect(result).not.toContain("second-checkbox");
  });
});

describe("tasklist multiple renders", () => {
  it("should not emit checkbox ids across renders", () => {
    const md = new MarkdownIt().use(tasklist);
    const html = [
      md.render("- [ ] first"),
      md.render("- [ ] second"),
      new MarkdownIt().use(tasklist).render("- [ ] third"),
    ].join("");
    const ids = getCheckboxIds(html);

    expect(ids).toStrictEqual([]);
  });

  it("should keep each label associated with its checkbox", () => {
    const md = new MarkdownIt().use(tasklist, { disabled: false });
    const container = document.createElement("div");

    container.innerHTML = md.render("- [ ] first");

    const label = getElement(container, "label", HTMLLabelElement);
    const input = getElement(container, "input", HTMLInputElement);

    expect(label.contains(input)).toBe(true);
    expect(label.hasAttribute("for")).toBe(false);
    expect(input.hasAttribute("id")).toBe(false);
    expect(label.control).toBe(input);
    label.click();
    expect(input.checked).toBe(true);
  });
});
