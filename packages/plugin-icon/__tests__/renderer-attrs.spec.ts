import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { icon } from "../src/index.js";
import { defaultRender, fontawesomeRender, iconfontRender, iconifyRender } from "../src/render.js";
import { stringifyAttrs } from "../src/utils.js";

describe("plugin-icon: renderer attribute safety", () => {
  it("should not render event handler attributes", () => {
    expect(defaultRender("test onclick=alert(1)")).toBe('<i icon="test"></i>');
    expect(defaultRender('test onMouseOver="alert(1)"')).toBe('<i icon="test"></i>');
    expect(iconifyRender("test:test onload=alert(1)")).toBe(
      '<iconify-icon icon="test:test"></iconify-icon>',
    );
    expect(fontawesomeRender("test onfocus=alert(1)")).toBe('<i class="fa-test fa-solid"></i>');
    expect(iconfontRender("test onclick=alert(1)")).toBe(
      '<span class="iconfont icon-test"></span>',
    );
  });

  it("should keep safe attributes", () => {
    expect(defaultRender("test class=extra data-foo=bar aria-label=hi")).toBe(
      '<i icon="test" class="extra" data-foo="bar" aria-label="hi"></i>',
    );
  });

  it("should not render dangerous url schemes in url attributes", () => {
    expect(defaultRender("test href=javascript:alert(1)")).toBe('<i icon="test"></i>');
    expect(defaultRender('test href=" javascript:alert(1)"')).toBe('<i icon="test"></i>');
    expect(defaultRender('test href="java\tscript:alert(1)"')).toBe('<i icon="test"></i>');
    expect(defaultRender("test src=vbscript:msgbox(1)")).toBe('<i icon="test"></i>');
    expect(defaultRender("test HREF=javascript:alert(1)")).toBe('<i icon="test"></i>');
    expect(defaultRender("test href=https://example.com")).toBe(
      '<i icon="test" href="https://example.com"></i>',
    );
    expect(defaultRender("test href=javascript")).toBe('<i icon="test" href="javascript"></i>');
    expect(defaultRender("test source=javascript:alert(1)")).toBe(
      '<i icon="test" source="javascript:alert(1)"></i>',
    );
  });

  it("should filter attrs in the markdown pipeline", () => {
    const markdownIt = new MarkdownIt().use(icon, { render: defaultRender });

    expect(markdownIt.render("::test onclick=alert(1)::")).toBe('<p><i icon="test"></i></p>\n');
    expect(markdownIt.render("::test class=extra data-foo=bar::")).toBe(
      '<p><i icon="test" class="extra" data-foo="bar"></i></p>\n',
    );
  });

  it("should stringify only safe attrs", () => {
    expect(stringifyAttrs({ onclick: "alert(1)", "data-foo": "bar" })).toBe(' data-foo="bar"');
    expect(stringifyAttrs({ opacity: "0.5" })).toBe(' opacity="0.5"');
    expect(stringifyAttrs({ href: "java\nscript:alert(1)" })).toBe("");
    expect(stringifyAttrs({ href: "java\rscript:alert(1)" })).toBe("");
    expect(stringifyAttrs({ href: "\u0001javascript:alert(1)" })).toBe("");
    expect(stringifyAttrs({ href: "" })).toBe(' href=""');

    expect(stringifyAttrs({})).toBe("");
  });
});
