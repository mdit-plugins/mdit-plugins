import { describe, expect, it } from "vitest";

import { defaultRender, fontawesomeRender, iconfontRender, iconifyRender } from "../src/render.js";

describe(defaultRender, () => {
  it("should render default icon", () => {
    expect(defaultRender("test")).toBe('<i icon="test"></i>');
  });

  it("should render default icon with size and color", () => {
    expect(defaultRender("test =24 /blue")).toBe(
      '<i icon="test" style="font-size:24px;color:blue"></i>',
    );
  });

  it("should render default icon with additional classes", () => {
    expect(defaultRender("test class1 class2")).toBe('<i icon="test class1 class2"></i>');
  });

  it("should render default icon with additional classes, size, and color", () => {
    expect(defaultRender("test class1 class2 =24 /blue")).toBe(
      '<i icon="test class1 class2" style="font-size:24px;color:blue"></i>',
    );
  });

  it("should escape icon content", () => {
    expect(defaultRender('a"b')).toBe('<i icon="a&quot;b"></i>');
    expect(defaultRender("a&b<c>d")).toBe('<i icon="a&amp;b&lt;c&gt;d"></i>');
  });
});

describe(iconifyRender, () => {
  it("should render iconify icon", () => {
    expect(iconifyRender("test:icon")).toBe('<iconify-icon icon="test:icon"></iconify-icon>');
  });

  it("should render iconify icon with size and color", () => {
    expect(iconifyRender("test:icon =0.8em /red")).toBe(
      `<iconify-icon icon="test:icon" style="font-size:0.8em;color:red"></iconify-icon>`,
    );
  });

  it("should escape icon content", () => {
    expect(iconifyRender('a"b')).toBe('<iconify-icon icon="a&quot;b"></iconify-icon>');
    expect(iconifyRender("a&b<c>d")).toBe('<iconify-icon icon="a&amp;b&lt;c&gt;d"></iconify-icon>');
  });
});

describe(iconfontRender, () => {
  it("should render iconfont icon", () => {
    expect(iconfontRender("test")).toBe('<span class="iconfont icon-test"></span>');
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

  it("should escape icon content", () => {
    expect(iconfontRender('a"b')).toBe('<span class="iconfont icon-a&quot;b"></span>');
    expect(iconfontRender("a&b<c>d")).toBe('<span class="iconfont icon-a&amp;b&lt;c&gt;d"></span>');
  });
});

describe(fontawesomeRender, () => {
  it("should render fontawesome icon with classes", () => {
    expect(fontawesomeRender("fa-test")).toBe('<i class="fa-test fa-solid"></i>');

    expect(fontawesomeRender("test")).toBe('<i class="fa-test fa-solid"></i>');
  });

  it("should render fontawesome icon with explicit family", () => {
    expect(fontawesomeRender("fas:icon")).toBe('<i class="fas fa-icon"></i>');
    expect(fontawesomeRender("s:icon")).toBe('<i class="fas fa-icon"></i>');
    expect(fontawesomeRender("solid:icon")).toBe('<i class="fa-solid fa-icon"></i>');
    expect(fontawesomeRender("b:icon")).toBe('<i class="fab fa-icon"></i>');
    expect(fontawesomeRender("brands:icon")).toBe('<i class="fa-brands fa-icon"></i>');
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

  it("should escape icon content", () => {
    expect(fontawesomeRender('a"b')).toBe('<i class="fa-a&quot;b fa-solid"></i>');
  });
});
