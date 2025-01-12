import { describe, expect, it } from "vitest";

import {
  appendStyle,
  extractColor,
  extractSize,
  parseAttrs,
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

    expect(parseAttrs(`key1="value with space" key2="value with &"`)).toEqual({
      classes: [],
      attrs: { key1: "value with space", key2: "value with &" },
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
    expect(
      appendStyle(
        { style: "font-size: 12px;" },
        "color: red; background: blue;",
      ),
    ).toEqual({
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
    expect(stringifyAttrs({ key1: "value1", key2: "value2" })).toBe(
      ' key1="value1" key2="value2"',
    );
  });

  it("Attrs with special characters", () => {
    expect(stringifyAttrs({ key1: "value with space", key2: "value&" })).toBe(
      ' key1="value with space" key2="value&amp;"',
    );

    expect(
      stringifyAttrs({ key1: 'value with "quotes"', key2: "value&" }),
    ).toBe(' key1="value with &quot;quotes&quot;" key2="value&amp;"');

    expect(
      stringifyAttrs({ key1: "value with 'single quotes'", key2: "value&" }),
    ).toBe(' key1="value with &#39;single quotes&#39;" key2="value&amp;"');

    expect(stringifyAttrs({ key1: "value with <tag>", key2: "value&" })).toBe(
      ' key1="value with &lt;tag&gt;" key2="value&amp;"',
    );

    expect(stringifyAttrs({ key1: "value with =equals", key2: "value&" })).toBe(
      ' key1="value with =equals" key2="value&amp;"',
    );
  });
});
