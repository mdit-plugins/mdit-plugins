import { expect, it } from "vitest";

import { dedent } from "../src/index.js";

it("when 0-level is minimal, do not remove spaces", () => {
  expect(
    dedent(
      [
        //
        "fn main() {",
        '  println!("Hello");',
        "}",
      ].join("\n"),
    ),
  ).toMatchInlineSnapshot(`
      "fn main() {
        println!("Hello");
      }"
    `);
});

it("when 4-level is minimal, remove 4 spaces", () => {
  expect(
    dedent(
      [
        //
        "    let a = {",
        "        value: 42",
        "    };",
      ].join("\n"),
    ),
  ).toMatchInlineSnapshot(`
        "let a = {
            value: 42
        };"
      `);
});

it("when only 1 line is passed, dedent it", () => {
  expect(dedent("    let a = 42;")).toEqual("let a = 42;");
});

it("dedent empty content", () => {
  expect(dedent("")).toEqual("");
});

it("handle tabs as well", () => {
  expect(
    dedent(
      [
        //
        "	let a = {",
        "		value: 42",
        "	};",
      ].join("\n"),
    ),
  ).toMatchInlineSnapshot(`
        "let a = {
        	value: 42
        };"
      `);
});

it("handle empty lines", () => {
  expect(
    dedent(
      [
        //
        "	let a = {",
        "		value: 42",
        "",
        "	};",
      ].join("\n"),
    ),
  ).toMatchInlineSnapshot(`
        "let a = {
        	value: 42

        };"
      `);
});
