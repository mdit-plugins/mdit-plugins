import { expect, it } from "vitest";

import { extractSize } from "../src/utils.js";

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
