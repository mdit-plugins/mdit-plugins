import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import {
  defaultRender,
  fontawesomeRender,
  icon,
  iconfontRender,
  iconifyRender,
} from "../src/index.js";
import type { MarkdownItIconOptions } from "../src/options.js";

type Renderer = NonNullable<MarkdownItIconOptions["render"]>;

const rendererCases: [name: string, render: Renderer][] = [
  ["defaultRender", defaultRender],
  ["fontawesomeRender", fontawesomeRender],
  ["iconfontRender", iconfontRender],
  ["iconifyRender", iconifyRender],
];

describe.each(rendererCases)("built-in renderer %s", (_name, render) => {
  const md = new MarkdownIt().use(icon, { render });

  it.each([
    ["lowercase quoted", `::fa-user onclick="alert(1)"::`],
    ["mixed-case quoted", `::fa-user OnClick="alert(1)"::`],
    ["uppercase quoted", `::fa-user ONCLICK="alert(1)"::`],
    ["unquoted", `::fa-user onclick=alert(1)::`],
    ["onmouseover", `::fa-user onmouseover="alert(1)"::`],
    ["onerror", `::fa-user onerror="alert(1)"::`],
  ])("drops the %s event handler attribute", (_case, payload) => {
    const output = md.render(payload);

    expect(output).not.toMatch(/\son[a-z]+=/i);
    expect(output).not.toContain("alert(1)");
  });

  it("drops srcdoc and URL attributes with dangerous schemes", () => {
    expect(md.render(`::fa-user srcdoc="alert(1)"::`)).not.toContain("srcdoc");
    // oxlint-disable-next-line no-script-url -- asserting that the URL is dropped
    expect(md.render(`::fa-user href="javascript:alert(1)"::`)).not.toContain("javascript:");
    expect(md.render(`::fa-user href="vbscript:msgbox(1)"::`)).not.toContain("vbscript:");
    expect(md.render(`::fa-user href="https://example.com"::`)).toContain(
      'href="https://example.com"',
    );
  });

  it("keeps other attributes and inline styles", () => {
    const attributes = md.render(
      `::fa-user data-test="ok" aria-label="icon" id="my-icon" title="My icon" role="img"::`,
    );

    expect(attributes).toContain('data-test="ok"');
    expect(attributes).toContain('aria-label="icon"');
    expect(attributes).toContain('id="my-icon"');
    expect(attributes).toContain('title="My icon"');
    expect(attributes).toContain('role="img"');

    expect(md.render(`::fa-user style="color:red"::`)).toContain('style="color:red"');
  });

  it("escapes attribute values", () => {
    const output = md.render(`::fa-user title="a&quot; onmouseover=alert(1)"::`);

    expect(output).not.toContain('onmouseover="alert(1)"');
  });

  it("still supports the size and color syntax", () => {
    expect(md.render(`::fa-user =24 /red::`)).toContain("font-size:24px");
    expect(md.render(`::fa-user =24 /red::`)).toContain("color:red");
  });
});

describe("default plugin renderer", () => {
  it("only escapes the icon content", () => {
    const md = new MarkdownIt().use(icon);
    const output = md.render(`::fa-user onclick="alert(1)"::`);

    expect(output).not.toContain('onclick="alert(1)"');
  });
});
