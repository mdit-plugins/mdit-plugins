import { describe, expect, it } from "vitest";

import {
  defaultRender,
  fontawesomeRender,
  iconfontRender,
  iconifyRender,
} from "../src/render.js";

describe("defaultRender", () => {
  it("should render default icon", () => {
    expect(defaultRender("test")).toBe('<i icon="test"></i>');
  });

  it("should render default icon with size and color", () => {
    expect(defaultRender("test =24 /blue")).toBe(
      '<i icon="test" style="font-size:24px;color:blue"></i>',
    );
  });

  it("should render default icon with additional classes", () => {
    expect(defaultRender("test class1 class2")).toBe(
      '<i icon="test class1 class2"></i>',
    );
  });

  it("should render default icon with additional classes, size, and color", () => {
    expect(defaultRender("test class1 class2 =24 /blue")).toBe(
      '<i icon="test class1 class2" style="font-size:24px;color:blue"></i>',
    );
  });
});

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

describe("iconfontRender", () => {
  it("should render iconfont icon", () => {
    expect(iconfontRender("test")).toBe(
      '<span class="iconfont icon-test"></span>',
    );
  });

  it("should render iconfont icon with size and color", () => {
    expect(iconfontRender("test =24 /blue")).toBe(
      '<span class="iconfont icon-test" style="font-size:24px;color:blue"></span>',
    );
  });

  it("should render iconfont icon with additional classes", () => {
    expect(iconfontRender("test class1 class2")).toBe(
      '<span class="iconfont icon-test class1 class2"></span>',
    );
  });

  it("should render iconfont icon with additional classes, size, and color", () => {
    expect(iconfontRender("test class1 class2 =24 /blue")).toBe(
      '<span class="iconfont icon-test class1 class2" style="font-size:24px;color:blue"></span>',
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
    expect(fontawesomeRender("solid:icon")).toBe(
      '<i class="fa-solid fa-icon"></i>',
    );
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
    expect(fontawesomeRender("icon fad =20 /#f00")).toBe(
      `<i class="fa-icon fad fa-solid" style="font-size:20px;color:#f00"></i>`,
    );
    expect(fontawesomeRender("icon fass =20 /#f00")).toBe(
      `<i class="fa-icon fass" style="font-size:20px;color:#f00"></i>`,
    );
  });
});
