import { expect, it } from "vitest";

import { extractColor } from "../src/utils.js";

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
