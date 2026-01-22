import { describe, expect, it } from "vitest";

import {
  appendStyle,
  extractAttrs,
  extractColor,
  extractInfo,
  extractSize,
  stringifyAttrs,
} from "../src/utils.js";

it("extractColor", () => {
  expect(extractColor({ content: "icon" })).toEqual({
    content: "icon",
  });

  expect(extractColor({ content: "icon class1 class2" })).toEqual({
    content: "icon class1 class2",
  });

  expect(extractColor({ content: "icon /red" })).toEqual({
    content: "icon",
    color: "red",
  });

  expect(extractColor({ content: "icon /#ff0000" })).toEqual({
    content: "icon",
    color: "#ff0000",
  });

  expect(extractColor({ content: "icon /rgb(255,0,0)" })).toEqual({
    content: "icon",
    color: "rgb(255,0,0)",
  });

  expect(extractColor({ content: "icon /red other" })).toEqual({
    content: "icon other",
    color: "red",
  });

  expect(extractColor({ content: "icon other /red" })).toEqual({
    content: "icon other",
    color: "red",
  });
});

it("extractSize", () => {
  expect(extractSize({ content: "icon" })).toEqual({
    content: "icon",
  });

  expect(extractSize({ content: "icon class1 class2" })).toEqual({
    content: "icon class1 class2",
  });

  expect(extractSize({ content: "icon =24" })).toEqual({
    content: "icon",
    size: "24px",
  });

  expect(extractSize({ content: "icon =24px" })).toEqual({
    content: "icon",
    size: "24px",
  });

  expect(extractSize({ content: "icon =1em" })).toEqual({
    content: "icon",
    size: "1em",
  });

  expect(extractSize({ content: "icon =24 other" })).toEqual({
    content: "icon other",
    size: "24px",
  });

  expect(extractSize({ content: "icon other =24" })).toEqual({
    content: "icon other",
    size: "24px",
  });
});

describe("extractAttrs", () => {
  it("Only classes", () => {
    expect(extractAttrs({ content: "class1 class2" })).toEqual({
      attrs: {},
      content: "class1 class2",
    });
  });

  describe("Only attrs", () => {
    it("simple value without quotes", () => {
      expect(extractAttrs({ content: "key1=value1 key2=value2" })).toEqual({
        attrs: { key1: "value1", key2: "value2" },
        content: "",
      });
    });

    it("complex attribute", () => {
      expect(extractAttrs({ content: `a11y=true multi-word=complex-value2` })).toEqual({
        attrs: { a11y: "true", "multi-word": "complex-value2" },
        content: "",
      });
    });

    it("value with single quotes", () => {
      expect(
        extractAttrs({
          content: `key1='value with space' key2='complex-value2' key3='I am "God"!' key4='I am \\'God\\'!'`,
        }),
      ).toEqual({
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
      ).toEqual({
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
      ).toEqual({
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
      ).toEqual({
        attrs: {
          key1: "value with &",
          key2: "value with <tag\\>",
          key3: "value with =equals",
        },
        content: "",
      });
    });

    it("value with mixed quotes", () => {
      expect(extractAttrs({ content: `key1="value with space" key2=value2` })).toEqual({
        attrs: { key1: "value with space", key2: "value2" },
        content: "",
      });

      expect(extractAttrs({ content: `key1="value with space" key2="value2"` })).toEqual({
        attrs: { key1: "value with space", key2: "value2" },
        content: "",
      });

      expect(extractAttrs({ content: `key1="value with space" key2='value'` })).toEqual({
        attrs: { key1: "value with space", key2: "value" },
        content: "",
      });

      expect(extractAttrs({ content: `key1='value with space' key2="value"` })).toEqual({
        attrs: { key1: "value with space", key2: "value" },
        content: "",
      });

      expect(
        extractAttrs({
          content: `key1='value with space' key2="value with space"`,
        }),
      ).toEqual({
        attrs: { key1: "value with space", key2: "value with space" },
        content: "",
      });

      expect(
        extractAttrs({
          content: `key1="value with space" key2="value with &"`,
        }),
      ).toEqual({
        attrs: { key1: "value with space", key2: "value with &" },
        content: "",
      });
    });

    it("empty attrs", () => {
      expect(extractAttrs({ content: `key1="" key2=''` })).toEqual({
        attrs: {
          key1: "",
          key2: "",
        },
        content: "",
      });
    });
  });

  it("Classes and attrs", () => {
    expect(extractAttrs({ content: `class1 class2 key1=value1 key2=value2` })).toEqual({
      attrs: { key1: "value1", key2: "value2" },
      content: "class1 class2",
    });

    expect(extractAttrs({ content: `class1 class2 key1="value1" key2="value2"` })).toEqual({
      attrs: { key1: "value1", key2: "value2" },
      content: "class1 class2",
    });

    expect(extractAttrs({ content: `class1 class2 key1="value1" key2=value2` })).toEqual({
      attrs: { key1: "value1", key2: "value2" },
      content: "class1 class2",
    });

    expect(extractAttrs({ content: `class1 class2 key1=value1 key2="value2"` })).toEqual({
      attrs: { key1: "value1", key2: "value2" },
      content: "class1 class2",
    });

    expect(
      extractAttrs({
        content: `class1 class2 key1="value with space" key2=value2`,
      }),
    ).toEqual({
      attrs: { key1: "value with space", key2: "value2" },
      content: "class1 class2",
    });

    expect(
      extractAttrs({
        content: `class1 class2 key1="value with space" key2="value2"`,
      }),
    ).toEqual({
      attrs: { key1: "value with space", key2: "value2" },
      content: "class1 class2",
    });

    expect(
      extractAttrs({
        content: `class1 class2 key1="value with space" key2='value'`,
      }),
    ).toEqual({
      attrs: { key1: "value with space", key2: "value" },
      content: "class1 class2",
    });

    expect(
      extractAttrs({
        content: `class1 key1='value with space' key2="value" class2`,
      }),
    ).toEqual({
      attrs: { key1: "value with space", key2: "value" },
      content: "class1 class2",
    });
  });
});

describe("extractInfo", () => {
  it("should extract info", () => {
    expect(
      extractInfo({
        content: `class1 link='https://baidu.com' =size /color text="pi=3.14" class2`,
      }),
    ).toEqual({
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

describe("appendStyle", () => {
  it("Empty style", () => {
    expect(appendStyle({}, "color: red;")).toEqual({
      style: "color: red;",
    });
  });

  it("Existing style without semicolon", () => {
    expect(appendStyle({ style: "font-size: 12px" }, "color: red;")).toEqual({
      style: "font-size: 12px;color: red;",
    });
  });

  it("Existing style with semicolon", () => {
    expect(appendStyle({ style: "font-size: 12px;" }, "color: red;")).toEqual({
      style: "font-size: 12px;color: red;",
    });
  });

  it("Multiple styles", () => {
    expect(appendStyle({ style: "font-size: 12px;" }, "color: red; background: blue;")).toEqual({
      style: "font-size: 12px;color: red; background: blue;",
    });
  });
});

describe("stringifyAttrs", () => {
  it("Empty attrs", () => {
    expect(stringifyAttrs({})).toBe("");
  });

  it("Single attr", () => {
    expect(stringifyAttrs({ key1: "value1" })).toBe(' key1="value1"');
  });

  it("Multiple attrs", () => {
    expect(stringifyAttrs({ key1: "value1", key2: "value2" })).toBe(' key1="value1" key2="value2"');
  });

  it("Attrs with special characters", () => {
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
