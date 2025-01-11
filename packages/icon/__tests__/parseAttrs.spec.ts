import { describe, expect, it } from "vitest";

import { parseAttrs } from "../src/utils.js";

describe("parseAttrs", () => {
  it("Only classes", () => {
    expect(parseAttrs("class1 class2")).toEqual({
      classes: ["class1", "class2"],
      attrs: {},
    });
  });

  it("Only attrs", () => {
    expect(parseAttrs("key1=value1 key2=value2")).toEqual({
      classes: [],
      attrs: { key1: "value1", key2: "value2" },
    });

    expect(parseAttrs(`key1='value with space' key2=value2`)).toEqual({
      classes: [],
      attrs: { key1: "value with space", key2: "value2" },
    });

    expect(parseAttrs(`key1="value with space" key2=value2`)).toEqual({
      classes: [],
      attrs: { key1: "value with space", key2: "value2" },
    });

    expect(parseAttrs(`key1="value with space" key2="value2"`)).toEqual({
      classes: [],
      attrs: { key1: "value with space", key2: "value2" },
    });

    expect(parseAttrs(`key1="value with space" key2='value'`)).toEqual({
      classes: [],
      attrs: { key1: "value with space", key2: "value" },
    });

    expect(parseAttrs(`key1='value with space' key2="value"`)).toEqual({
      classes: [],
      attrs: { key1: "value with space", key2: "value" },
    });

    expect(
      parseAttrs(`key1='value with space' key2="value with space"`),
    ).toEqual({
      classes: [],
      attrs: { key1: "value with space", key2: "value with space" },
    });

    expect(
      parseAttrs(`key1="value with space" key2="value with space"`),
    ).toEqual({
      classes: [],
      attrs: { key1: "value with space", key2: "value with space" },
    });
  });

  it("Classes and attrs", () => {
    expect(parseAttrs(`class1 class2 key1=value1 key2=value2`)).toEqual({
      classes: ["class1", "class2"],
      attrs: { key1: "value1", key2: "value2" },
    });

    expect(parseAttrs(`class1 class2 key1="value1" key2="value2"`)).toEqual({
      classes: ["class1", "class2"],
      attrs: { key1: "value1", key2: "value2" },
    });

    expect(parseAttrs(`class1 class2 key1="value1" key2=value2`)).toEqual({
      classes: ["class1", "class2"],
      attrs: { key1: "value1", key2: "value2" },
    });

    expect(parseAttrs(`class1 class2 key1=value1 key2="value2"`)).toEqual({
      classes: ["class1", "class2"],
      attrs: { key1: "value1", key2: "value2" },
    });

    expect(
      parseAttrs(`class1 class2 key1="value with space" key2=value2`),
    ).toEqual({
      classes: ["class1", "class2"],
      attrs: { key1: "value with space", key2: "value2" },
    });

    expect(
      parseAttrs(`class1 class2 key1="value with space" key2="value2"`),
    ).toEqual({
      classes: ["class1", "class2"],
      attrs: { key1: "value with space", key2: "value2" },
    });

    expect(
      parseAttrs(`class1 class2 key1="value with space" key2='value'`),
    ).toEqual({
      classes: ["class1", "class2"],
      attrs: { key1: "value with space", key2: "value" },
    });

    expect(
      parseAttrs(`class1  key1='value with space' key2="value" class2`),
    ).toEqual({
      classes: ["class1", "class2"],
      attrs: { key1: "value with space", key2: "value" },
    });
  });
});
