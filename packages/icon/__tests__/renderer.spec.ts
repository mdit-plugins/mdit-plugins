import { describe, expect, it } from "vitest";

import { fontawesomeRender, iconifyRender } from "../src/render.js";

describe("iconifyRender", () => {
  it("should render iconify icon", () => {
    expect(iconifyRender("test:icon")).toBe(
      '<iconify-icon icon="test:icon"></iconify-icon>',
    );
  });

  it("should render iconify icon with size and color", () => {
    expect(iconifyRender("test:icon =0.8em /red")).toBe(
      `<iconify-icon icon="test:icon" style="font-size:0.8em;color:red"></iconify-icon>`,
    );
  });
});

describe("fontawesomeRender", () => {
  it("should render fontawesome icon with classes", () => {
    expect(fontawesomeRender("fa-test")).toBe(
      '<i class="fa-test fa-solid"></i>',
    );

    expect(fontawesomeRender("test")).toBe('<i class="fa-test fa-solid"></i>');
  });

  it("should render fontawesome icon with explicit family", () => {
    expect(fontawesomeRender("fas:icon")).toBe('<i class="fas fa-icon"></i>');
    expect(fontawesomeRender("s:icon")).toBe('<i class="fas fa-icon"></i>');
    expect(fontawesomeRender("b:icon")).toBe('<i class="fab fa-icon"></i>');
    expect(fontawesomeRender("brands:icon")).toBe(
      '<i class="fa-brands fa-icon"></i>',
    );
  });

  it("should render fontawesome icon with size and color", () => {
    expect(fontawesomeRender("icon =20 /#f00")).toBe(
      `<i class="fa-icon fa-solid" style="font-size:20px;color:#f00"></i>`,
    );
  });

  it("should render fontawesome icon with extra styling classes", () => {
    expect(fontawesomeRender("icon sm =20 /#f00")).toBe(
      `<i class="fa-icon fa-sm fa-solid" style="font-size:20px;color:#f00"></i>`,
    );
    expect(fontawesomeRender("icon fa-sm =20 /#f00")).toBe(
      `<i class="fa-icon fa-sm fa-solid" style="font-size:20px;color:#f00"></i>`,
    );
  });
});
