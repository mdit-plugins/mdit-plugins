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

  describe("only attrs", () => {
    it("simple value without quotes", () => {
      expect(extractAttrs({ content: "key1=value1 key2=value2" })).toStrictEqual({
        attrs: { key1: "value1", key2: "value2" },
        content: "",
      });
    });

    it("complex attribute", () => {
      expect(extractAttrs({ content: `a11y=true multi-word=complex-value2` })).toStrictEqual({
        attrs: { a11y: "true", "multi-word": "complex-value2" },
        content: "",
      });
    });

    it("value with single quotes", () => {
      expect(
        extractAttrs({
          content: `key1='value with space' key2='complex-value2' key3='I am "God"!' key4='I am \\'God\\'!'`,
        }),
      ).toStrictEqual({
        attrs: {
          key1: "value with space",
          key2: "complex-value2",
          key3: 'I am "God"!',
          key4: "I am 'God'!",
        },
        content: "",
      });
    });

    it("value with double quotes", () => {
      expect(
        extractAttrs({
          content: `key1="value with space" key2="complex-value2" key3="I am 'God'!"`,
        }),
      ).toStrictEqual({
        attrs: {
          key1: "value with space",
          key2: "complex-value2",
          key3: "I am 'God'!",
        },
        content: "",
      });
    });

    it("value needs encoding", () => {
      expect(
        extractAttrs({
          content: `key1="value with &" key2="value with <tag>" key3="value with =equals"`,
        }),
      ).toStrictEqual({
        attrs: {
          key1: "value with &",
          key2: "value with <tag>",
          key3: "value with =equals",
        },
        content: "",
      });

      expect(
        extractAttrs({
          content: `key1="value with &" key2="value with <tag\\>" key3="value with =equals"`,
        }),
      ).toStrictEqual({
        attrs: {
          key1: "value with &",
          key2: "value with <tag\\>",
          key3: "value with =equals",
        },
        content: "",
      });
    });

    it("value with mixed quotes", () => {
      expect(extractAttrs({ content: `key1="value with space" key2=value2` })).toStrictEqual({
        attrs: { key1: "value with space", key2: "value2" },
        content: "",
      });

      expect(extractAttrs({ content: `key1="value with space" key2="value2"` })).toStrictEqual({
        attrs: { key1: "value with space", key2: "value2" },
        content: "",
      });

      expect(extractAttrs({ content: `key1="value with space" key2='value'` })).toStrictEqual({
        attrs: { key1: "value with space", key2: "value" },
        content: "",
      });

      expect(extractAttrs({ content: `key1='value with space' key2="value"` })).toStrictEqual({
        attrs: { key1: "value with space", key2: "value" },
        content: "",
      });

      expect(
        extractAttrs({
          content: `key1='value with space' key2="value with space"`,
        }),
      ).toStrictEqual({
        attrs: { key1: "value with space", key2: "value with space" },
        content: "",
      });

      expect(
        extractAttrs({
          content: `key1="value with space" key2="value with &"`,
        }),
      ).toStrictEqual({
        attrs: { key1: "value with space", key2: "value with &" },
        content: "",
      });
    });

    it("empty attrs", () => {
      expect(extractAttrs({ content: `key1="" key2=''` })).toStrictEqual({
        attrs: {
          key1: "",
          key2: "",
        },
        content: "",
      });
    });
  });

  it("classes and attrs", () => {
    expect(extractAttrs({ content: `class1 class2 key1=value1 key2=value2` })).toStrictEqual({
      attrs: { key1: "value1", key2: "value2" },
      content: "class1 class2",
    });

    expect(extractAttrs({ content: `class1 class2 key1="value1" key2="value2"` })).toStrictEqual({
      attrs: { key1: "value1", key2: "value2" },
      content: "class1 class2",
    });

    expect(extractAttrs({ content: `class1 class2 key1="value1" key2=value2` })).toStrictEqual({
      attrs: { key1: "value1", key2: "value2" },
      content: "class1 class2",
    });

    expect(extractAttrs({ content: `class1 class2 key1=value1 key2="value2"` })).toStrictEqual({
      attrs: { key1: "value1", key2: "value2" },
      content: "class1 class2",
    });

    expect(
      extractAttrs({
        content: `class1 class2 key1="value with space" key2=value2`,
      }),
    ).toStrictEqual({
      attrs: { key1: "value with space", key2: "value2" },
      content: "class1 class2",
    });

    expect(
      extractAttrs({
        content: `class1 class2 key1="value with space" key2="value2"`,
      }),
    ).toStrictEqual({
      attrs: { key1: "value with space", key2: "value2" },
      content: "class1 class2",
    });

    expect(
      extractAttrs({
        content: `class1 class2 key1="value with space" key2='value'`,
      }),
    ).toStrictEqual({
      attrs: { key1: "value with space", key2: "value" },
      content: "class1 class2",
    });

    expect(
      extractAttrs({
        content: `class1 key1='value with space' key2="value" class2`,
      }),
    ).toStrictEqual({
      attrs: { key1: "value with space", key2: "value" },
      content: "class1 class2",
    });
  });
});

describe(extractInfo, () => {
  it("should extract info", () => {
    expect(
      extractInfo({
        content: `class1 link='https://baidu.com' =size /color text="pi=3.14" class2`,
      }),
    ).toStrictEqual({
      attrs: {
        link: "https://baidu.com",
        text: "pi=3.14",
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
    expect(stringifyAttrs({ key1: "value1" })).toBe(' key1="value1"');
  });

  it("multiple attrs", () => {
    expect(stringifyAttrs({ key1: "value1", key2: "value2" })).toBe(' key1="value1" key2="value2"');
  });

  it("attrs with special characters", () => {
    expect(stringifyAttrs({ key1: "value with space", key2: "value&" })).toBe(
      ' key1="value with space" key2="value&amp;"',
    );

    expect(stringifyAttrs({ key1: 'value with "quotes"', key2: "value&" })).toBe(
      ' key1="value with &quot;quotes&quot;" key2="value&amp;"',
    );

    expect(stringifyAttrs({ key1: "value with 'single quotes'", key2: "value&" })).toBe(
      ' key1="value with &#39;single quotes&#39;" key2="value&amp;"',
    );

    expect(stringifyAttrs({ key1: "value with <tag>", key2: "value&" })).toBe(
      ' key1="value with &lt;tag&gt;" key2="value&amp;"',
    );

    expect(stringifyAttrs({ key1: "value with =equals", key2: "value&" })).toBe(
      ' key1="value with =equals" key2="value&amp;"',
    );
  });
});
