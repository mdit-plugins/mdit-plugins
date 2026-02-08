import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { tasklist } from "../src/index.js";

const markdownIt = MarkdownIt({ linkify: true }).use(tasklist);

describe(tasklist, () => {
  it("should render", () => {
    const result = markdownIt.render(`
- [ ] unchecked item 1
- [\u00A0] unchecked item 2
- [X] checked item 3
- [x] checked item 4
- [ ]\u00A0unchecked item 4
- [\u00A0]\u00A0unchecked item 6
`);

    expect(result).toContain("label");
    expect(result).toContain("disabled");
    expect(result).toContain("</ul>");
    expect(result).toContain("</li>");
    expect(result).toMatchSnapshot();
  });

  it("should render ordered list", () => {
    const result = markdownIt.render(`
1. [x] checked ordered 1
2. [ ] unchecked ordered 2
3. [X] checked ordered 3
4. [\u00A0] unchecked ordered 4
5. [ ]\u00A0unchecked ordered 5
`);

    expect(result).toContain("label");
    expect(result).toContain("disabled");
    expect(result).toContain("</ol>");
    expect(result).toContain("</li>");
    expect(result).toMatchSnapshot();
  });

  it("should render nested list", () => {
    const ulResult = markdownIt.render(`
- foo
  - [ ] nested unchecked item 1
  - [ ] nested unchecked item 2
  - [x] nested checked item 3
  - [X] nested checked item 4
`);

    expect(ulResult).toContain("label");
    expect(ulResult).toContain("disabled");
    expect(ulResult).toContain("</ul>");
    expect(ulResult).toContain("</li>");
    expect(ulResult).toMatchSnapshot();

    const olResult = markdownIt.render(`
1. foo
   * [ ] nested unchecked item 1
   * not a todo item 2
   * not a todo item 3
   * [x] nested checked item 4
2. bar
3. spam
`);

    expect(olResult).toContain("label");
    expect(olResult).toContain("disabled");
    expect(olResult).toContain("</ol>");
    expect(olResult).toContain("</li>");
    expect(olResult).toMatchSnapshot();
  });

  it("should not render label", () => {
    const markdownItWithOutLabel = MarkdownIt({ linkify: true }).use(tasklist, {
      label: false,
    });

    const result = markdownItWithOutLabel.render(`
- [ ] unchecked item 1
- [ ] unchecked item 2
- [ ] unchecked item 3
- [x] checked item 4
`);

    expect(result).not.toContain("label");
    expect(result).toContain("disabled");
    expect(result).toMatchSnapshot();
  });

  it("should increase id", () => {
    const result = markdownIt.render(`
- [ ] unchecked item 1
- [ ] unchecked item 2
- [ ] unchecked item 3
- [x] checked item 4

Some content

- [ ] unchecked item 1
- [ ] unchecked item 2
- [ ] unchecked item 3
- [x] checked item 4
  - [ ] unchecked item 1
  - [ ] unchecked item 2
  - [ ] unchecked item 3
  - [x] checked item 4
`);

    expect(result).toContain("label");
    expect(result).toContain("disabled");
    expect(result).toMatchSnapshot();
  });

  it("should render with items containing other markdown syntax", () => {
    const result = markdownIt.render(`
- [ ] unchecked [link](https://example.com)
- [ ] unchecked **item 2**
- [ ] _unchecked_ item 3
- [x] ~~checked item 4~~
`);

    expect(result).toContain("label");
    expect(result).toContain("disabled");
    expect(result).toMatchSnapshot();
  });

  it("should support disabled option", () => {
    const markdownItWithDisabledFalse = MarkdownIt({ linkify: true }).use(tasklist, {
      disabled: false,
    });

    const result = markdownItWithDisabledFalse.render(`
- [ ] unchecked item 1
- [ ] unchecked item 2
- [ ] unchecked item 3
- [x] checked item 4
`);

    expect(result).toContain("label");
    expect(result).not.toContain("disabled");
    expect(result).toMatchSnapshot();
  });

  it("should not render", () => {
    const result = markdownIt.render(`
- [ ]
- [  ] not a todo item 2
- [ x] not a todo item 3
- [x ] not a todo item 4
- [ x ] not a todo item 5
- [a] not a todo item 6
- [ ]not a todo item 7
- [x]not a todo item 8
- [X]not a todo item 9
`);

    expect(result).not.toContain("label");
    expect(result).not.toContain("input");
    expect(result).toMatchSnapshot();
  });
});
