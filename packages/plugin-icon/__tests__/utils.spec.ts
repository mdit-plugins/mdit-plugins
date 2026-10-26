import { describe, expect, it } from "vitest";

import {
  appendStyle,
  extractAttrs,
  extractColor,
  extractInfo,
  extractSize,
  stringifyAttrs,
} from "../src/utils.js";

describe(extractColor, () => {
  it("should extract color", () => {
    expect(extractColor({ content: "icon" })).toStrictEqual({
      content: "icon",
    });

    expect(extractColor({ content: "icon class1 class2" })).toStrictEqual({
      content: "icon class1 class2",
    });

    expect(extractColor({ content: "icon /red" })).toStrictEqual({
      content: "icon",
      color: "red",
    });

    expect(extractColor({ content: "icon /#ff0000" })).toStrictEqual({
      content: "icon",
      color: "#ff0000",
    });

    expect(extractColor({ content: "icon /rgb(255,0,0)" })).toStrictEqual({
      content: "icon",
      color: "rgb(255,0,0)",
    });

    expect(extractColor({ content: "icon /red other" })).toStrictEqual({
      content: "icon other",
      color: "red",
    });

    expect(extractColor({ content: "icon other /red" })).toStrictEqual({
      content: "icon other",
      color: "red",
    });
  });
});

describe(extractSize, () => {
  it("should extract size", () => {
    expect(extractSize({ content: "icon" })).toStrictEqual({
      content: "icon",
    });

    expect(extractSize({ content: "icon class1 class2" })).toStrictEqual({
      content: "icon class1 class2",
    });

    expect(extractSize({ content: "icon =24" })).toStrictEqual({
      content: "icon",
      size: "24px",
    });

    expect(extractSize({ content: "icon =24px" })).toStrictEqual({
      content: "icon",
      size: "24px",
    });

    expect(extractSize({ content: "icon =1em" })).toStrictEqual({
      content: "icon",
      size: "1em",
    });

    expect(extractSize({ content: "icon =24 other" })).toStrictEqual({
      content: "icon other",
      size: "24px",
    });

    expect(extractSize({ content: "icon other =24" })).toStrictEqual({
      content: "icon other",
      size: "24px",
    });
  });
});

describe(extractAttrs, () => {
  it("only classes", () => {
    expect(extractAttrs({ content: "class1 class2" })).toStrictEqual({
      attrs: {},
      content: "class1 class2",
    });
  });

  it("safe attribute names", () => {
    expect(
      extractAttrs({ content: `class=c id=i title=t aria-label=a data-test=d` }),
    ).toStrictEqual({
      attrs: { class: "c", id: "i", title: "t", "aria-label": "a", "data-test": "d" },
      content: "",
    });
  });

  it("drops event handler and dangerous URL attributes", () => {
    expect(
      extractAttrs({
        content: `onclick="alert(1)" OnClick=alert(1) srcdoc="x" href=javascript:alert(1)`,
      }),
    ).toStrictEqual({ attrs: {}, content: "" });

    expect(
      extractAttrs({
        content: `data-test=ok style="color:red" href="https://example.com"`,
      }),
    ).toStrictEqual({
      attrs: { "data-test": "ok", style: "color:red", href: "https://example.com" },
      content: "",
    });
  });

  it("detects obfuscated dangerous URL schemes", () => {
    expect(extractAttrs({ content: `href=" javascript:alert(1)"` }).attrs).toStrictEqual({});
    expect(extractAttrs({ content: `href="java\tscript:alert(1)"` }).attrs).toStrictEqual({});
    expect(extractAttrs({ content: `href="vbscript:msgbox(1)"` }).attrs).toStrictEqual({});
    expect(extractAttrs({ content: `href="image.png"` }).attrs).toStrictEqual({
      href: "image.png",
    });
    expect(extractAttrs({ content: `srcset="image.png 1x"` }).attrs).toStrictEqual({});
  });

  describe("only attrs", () => {
    it("simple value without quotes", () => {
      expect(extractAttrs({ content: "data-key1=value1 data-key2=value2" })).toStrictEqual({
        attrs: { "data-key1": "value1", "data-key2": "value2" },
        content: "",
      });
    });

    it("complex attribute", () => {
      expect(
        extractAttrs({ content: `aria-hidden=true data-multi-word=complex-value2` }),
      ).toStrictEqual({
        attrs: { "aria-hidden": "true", "data-multi-word": "complex-value2" },
        content: "",
      });
    });

    it("value with single quotes", () => {
      expect(
        extractAttrs({
          content: `data-key1='value with space' data-key2='complex-value2' data-key3='I am "God"!' data-key4='I am \\'God\\'!'`,
        }),
      ).toStrictEqual({
        attrs: {
          "data-key1": "value with space",
          "data-key2": "complex-value2",
          "data-key3": 'I am "God"!',
          "data-key4": "I am 'God'!",
        },
        content: "",
      });
    });

    it("value with double quotes", () => {
      expect(
        extractAttrs({
          content: `data-key1="value with space" data-key2="complex-value2" data-key3="I am 'God'!"`,
        }),
      ).toStrictEqual({
        attrs: {
          "data-key1": "value with space",
          "data-key2": "complex-value2",
          "data-key3": "I am 'God'!",
        },
        content: "",
      });
    });

    it("value needs encoding", () => {
      expect(
        extractAttrs({
          content: `data-key1="value with &" data-key2="value with <tag>" data-key3="value with =equals"`,
        }),
      ).toStrictEqual({
        attrs: {
          "data-key1": "value with &",
          "data-key2": "value with <tag>",
          "data-key3": "value with =equals",
        },
        content: "",
      });

      expect(
        extractAttrs({
          content: `data-key1="value with &" data-key2="value with <tag\\>" data-key3="value with =equals"`,
        }),
      ).toStrictEqual({
        attrs: {
          "data-key1": "value with &",
          "data-key2": String.raw`value with <tag\>`,
          "data-key3": "value with =equals",
        },
        content: "",
      });
    });

    it("value with mixed quotes", () => {
      expect(
        extractAttrs({ content: `data-key1="value with space" data-key2=value2` }),
      ).toStrictEqual({
        attrs: { "data-key1": "value with space", "data-key2": "value2" },
        content: "",
      });

      expect(
        extractAttrs({ content: `data-key1="value with space" data-key2="value2"` }),
      ).toStrictEqual({
        attrs: { "data-key1": "value with space", "data-key2": "value2" },
        content: "",
      });

      expect(
        extractAttrs({ content: `data-key1="value with space" data-key2='value'` }),
      ).toStrictEqual({
        attrs: { "data-key1": "value with space", "data-key2": "value" },
        content: "",
      });

      expect(
        extractAttrs({ content: `data-key1='value with space' data-key2="value"` }),
      ).toStrictEqual({
        attrs: { "data-key1": "value with space", "data-key2": "value" },
        content: "",
      });

      expect(
        extractAttrs({
          content: `data-key1='value with space' data-key2="value with space"`,
        }),
      ).toStrictEqual({
        attrs: { "data-key1": "value with space", "data-key2": "value with space" },
        content: "",
      });

      expect(
        extractAttrs({
          content: `data-key1="value with space" data-key2="value with &"`,
        }),
      ).toStrictEqual({
        attrs: { "data-key1": "value with space", "data-key2": "value with &" },
        content: "",
      });
    });

    it("empty attrs", () => {
      expect(extractAttrs({ content: `data-key1="" data-key2=''` })).toStrictEqual({
        attrs: {
          "data-key1": "",
          "data-key2": "",
        },
        content: "",
      });
    });
  });

  it("classes and attrs", () => {
    expect(
      extractAttrs({ content: `class1 class2 data-key1=value1 data-key2=value2` }),
    ).toStrictEqual({
      attrs: { "data-key1": "value1", "data-key2": "value2" },
      content: "class1 class2",
    });

    expect(
      extractAttrs({ content: `class1 class2 data-key1="value1" data-key2="value2"` }),
    ).toStrictEqual({
      attrs: { "data-key1": "value1", "data-key2": "value2" },
      content: "class1 class2",
    });

    expect(
      extractAttrs({ content: `class1 class2 data-key1="value1" data-key2=value2` }),
    ).toStrictEqual({
      attrs: { "data-key1": "value1", "data-key2": "value2" },
      content: "class1 class2",
    });

    expect(
      extractAttrs({ content: `class1 class2 data-key1=value1 data-key2="value2"` }),
    ).toStrictEqual({
      attrs: { "data-key1": "value1", "data-key2": "value2" },
      content: "class1 class2",
    });

    expect(
      extractAttrs({
        content: `class1 class2 data-key1="value with space" data-key2=value2`,
      }),
    ).toStrictEqual({
      attrs: { "data-key1": "value with space", "data-key2": "value2" },
      content: "class1 class2",
    });

    expect(
      extractAttrs({
        content: `class1 class2 data-key1="value with space" data-key2="value2"`,
      }),
    ).toStrictEqual({
      attrs: { "data-key1": "value with space", "data-key2": "value2" },
      content: "class1 class2",
    });

    expect(
      extractAttrs({
        content: `class1 class2 data-key1="value with space" data-key2='value'`,
      }),
    ).toStrictEqual({
      attrs: { "data-key1": "value with space", "data-key2": "value" },
      content: "class1 class2",
    });

    expect(
      extractAttrs({
        content: `class1 data-key1='value with space' data-key2="value" class2`,
      }),
    ).toStrictEqual({
      attrs: { "data-key1": "value with space", "data-key2": "value" },
      content: "class1 class2",
    });
  });

  it("should not parse invalid attribute names", () => {
    expect(extractAttrs({ content: "a]=1" })).toStrictEqual({
      attrs: {},
      content: "a]=1",
    });

    expect(extractAttrs({ content: "a]data-x=1" })).toStrictEqual({
      attrs: { "data-x": "1" },
      content: "a]",
    });
  });
});

describe(extractInfo, () => {
  it("should extract info", () => {
    expect(
      extractInfo({
        content: `class1 data-link='https://baidu.com' =size /color title="pi=3.14" class2`,
      }),
    ).toStrictEqual({
      attrs: {
        "data-link": "https://baidu.com",
        title: "pi=3.14",
      },
      color: "color",
      content: "class1 class2",
      size: "size",
    });
  });
});

describe(appendStyle, () => {
  it("empty style", () => {
    expect(appendStyle({}, "color: red;")).toStrictEqual({
      style: "color: red;",
    });
  });

  it("existing style without semicolon", () => {
    expect(appendStyle({ style: "font-size: 12px" }, "color: red;")).toStrictEqual({
      style: "font-size: 12px;color: red;",
    });
  });

  it("existing style with semicolon", () => {
    expect(appendStyle({ style: "font-size: 12px;" }, "color: red;")).toStrictEqual({
      style: "font-size: 12px;color: red;",
    });
  });

  it("multiple styles", () => {
    expect(
      appendStyle({ style: "font-size: 12px;" }, "color: red; background: blue;"),
    ).toStrictEqual({
      style: "font-size: 12px;color: red; background: blue;",
    });
  });
});

describe(stringifyAttrs, () => {
  it("empty attrs", () => {
    expect(stringifyAttrs({})).toBe("");
  });

  it("single attr", () => {
    expect(stringifyAttrs({ "data-key1": "value1" })).toBe(' data-key1="value1"');
  });

  it("multiple attrs", () => {
    expect(stringifyAttrs({ "data-key1": "value1", "data-key2": "value2" })).toBe(
      ' data-key1="value1" data-key2="value2"',
    );
  });

  it("drops unsafe attrs", () => {
    expect(stringifyAttrs({ onclick: "alert(1)" })).toBe("");
    expect(stringifyAttrs({ srcdoc: "alert(1)" })).toBe("");
    // oxlint-disable-next-line no-script-url -- asserting that the URL is dropped
    expect(stringifyAttrs({ href: "javascript:alert(1)" })).toBe("");
    expect(stringifyAttrs({ style: "color:red", onclick: "alert(1)" })).toBe(' style="color:red"');
    expect(stringifyAttrs({ href: "https://example.com" })).toBe(' href="https://example.com"');
  });

  it("attrs with special characters", () => {
    expect(stringifyAttrs({ "data-key1": "value with space", "data-key2": "value&" })).toBe(
      ' data-key1="value with space" data-key2="value&amp;"',
    );

    expect(stringifyAttrs({ "data-key1": 'value with "quotes"', "data-key2": "value&" })).toBe(
      ' data-key1="value with &quot;quotes&quot;" data-key2="value&amp;"',
    );

    expect(
      stringifyAttrs({ "data-key1": "value with 'single quotes'", "data-key2": "value&" }),
    ).toBe(' data-key1="value with &#39;single quotes&#39;" data-key2="value&amp;"');

    expect(stringifyAttrs({ "data-key1": "value with <tag>", "data-key2": "value&" })).toBe(
      ' data-key1="value with &lt;tag&gt;" data-key2="value&amp;"',
    );

    expect(stringifyAttrs({ "data-key1": "value with =equals", "data-key2": "value&" })).toBe(
      ' data-key1="value with =equals" data-key2="value&amp;"',
    );
  });
});
