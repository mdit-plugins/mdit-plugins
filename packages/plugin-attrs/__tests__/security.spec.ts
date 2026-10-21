import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { attrs, parseAttrs } from "../src/index.js";

describe("plugin-attrs: security", () => {
  const markdownIt = new MarkdownIt().use(attrs);

  it("should drop event handler attributes", () => {
    expect(markdownIt.render(`[text](url){onclick="alert(1)"}`)).toBe(
      '<p><a href="url">text</a></p>\n',
    );
    expect(markdownIt.render(`# title {onMouseOver="alert(1)"}`)).toBe("<h1>title</h1>\n");
    expect(markdownIt.render(`![alt](img.png){onerror="alert(1)"}`)).toBe(
      '<p><img src="img.png" alt="alt"></p>\n',
    );
    expect(markdownIt.render(`# title {on=1}`)).toBe("<h1>title</h1>\n");
    expect(markdownIt.render(`# title {one=1}`)).toBe("<h1>title</h1>\n");
  });

  it("should drop dangerous url schemes", () => {
    expect(markdownIt.render(`[text](url){href="javascript:alert(1)"}`)).toBe(
      '<p><a href="url">text</a></p>\n',
    );
    expect(markdownIt.render(`[text](url){href=" vbscript:msgbox(1)"}`)).toBe(
      '<p><a href="url">text</a></p>\n',
    );
    expect(markdownIt.render(`![alt](img.png){src="javascript:alert(1)"}`)).toBe(
      '<p><img src="img.png" alt="alt"></p>\n',
    );
    expect(markdownIt.render(`[text](url){href="file:///etc/passwd"}`)).toBe(
      '<p><a href="url">text</a></p>\n',
    );
    expect(markdownIt.render(`![alt](img.png){src="FILE:///etc/passwd"}`)).toBe(
      '<p><img src="img.png" alt="alt"></p>\n',
    );
  });

  it("should only keep data urls accepted by markdown-it", () => {
    const acceptedDataUrls = [
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg",
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ",
      "data:image/webp;base64,UklGRiIAAABXRUJQVlA4",
      "DATA:IMAGE/PNG;base64,iVBORw0KGgoAAAANSUhEUg",
    ];

    acceptedDataUrls.forEach((src) => {
      expect(parseAttrs(`{src="${src}"}`)).toStrictEqual([["src", src]]);
    });

    expect(parseAttrs(`{href="data:text/html;base64,PHNjcmlwdD4="}`)).toStrictEqual([]);
    expect(parseAttrs(`{href="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4="}`)).toStrictEqual([]);
    // markdown-it requires the `;` parameter separator in the image data URL
    expect(parseAttrs(`{src="data:image/png,abc"}`)).toStrictEqual([]);
    expect(markdownIt.render(`# title {src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUg"}`)).toBe(
      '<h1 src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUg">title</h1>\n',
    );
    expect(markdownIt.render(`# title {src="data:text/html;base64,PHNjcmlwdD4="}`)).toBe(
      "<h1>title</h1>\n",
    );
    expect(parseAttrs(`{href="file:///etc/passwd"}`)).toStrictEqual([]);
  });

  it("should keep normal attributes", () => {
    expect(
      markdownIt.render(
        `[text](https://example.com){class="c" id="i" style="color:red" data-x="1" aria-label="label"}`,
      ),
    ).toBe(
      '<p><a href="https://example.com" class="c" id="i" style="color:red" data-x="1" aria-label="label">text</a></p>\n',
    );
    expect(markdownIt.render(`# title {opacity=0.5}`)).toBe('<h1 opacity="0.5">title</h1>\n');
    expect(markdownIt.render(`[text](url){href="https://example.com"}`)).toBe(
      '<p><a href="https://example.com">text</a></p>\n',
    );
    expect(markdownIt.render(`# title {class="c" onclick="alert(1)"}`)).toBe(
      '<h1 class="c">title</h1>\n',
    );
  });

  it("should drop dangerous attrs in programmatic parsing", () => {
    expect(parseAttrs(`{href="javascript:alert(1)"}`)).toStrictEqual([]);
    expect(parseAttrs(`{href="java\tscript:alert(1)"}`)).toStrictEqual([]);
    expect(parseAttrs(`{href="java\nscript:alert(1)"}`)).toStrictEqual([]);
    expect(parseAttrs(`{href="java\rscript:alert(1)"}`)).toStrictEqual([]);
    expect(parseAttrs(`{href=" \u0001javascript:alert(1)"}`)).toStrictEqual([]);
    expect(parseAttrs(`{HREF=javascript:alert(1)}`)).toStrictEqual([]);
    expect(parseAttrs(`{href=vbscript:msgbox(1)}`)).toStrictEqual([]);

    expect(parseAttrs(`{href=javascript}`)).toStrictEqual([["href", "javascript"]]);
    expect(parseAttrs(`{href=java:alert(1)}`)).toStrictEqual([["href", "java:alert(1)"]]);
  });

  it("should keep normal attributes in programmatic parsing", () => {
    expect(parseAttrs(`{.a #b href=https://example.com style="color:red"}`)).toStrictEqual([
      ["class", "a"],
      ["id", "b"],
      ["href", "https://example.com"],
      ["style", "color:red"],
    ]);
    expect(parseAttrs(`{opacity=0.5}`)).toStrictEqual([["opacity", "0.5"]]);
  });

  it("should not let allowed option bypass the safety filter", () => {
    expect(parseAttrs(`{onclick="alert(1)"}`, { allowed: ["onclick"] })).toStrictEqual([]);
    expect(parseAttrs(`{href="javascript:alert(1)"}`, { allowed: ["href"] })).toStrictEqual([]);
  });
});
