import MarkdownIt from "markdown-it";
import { resolve } from "upath";
import { describe, expect, it } from "vitest";

import type { IncludeEnv } from "../src/index.js";
import { include } from "../src/index.js";

const fixturePath = resolve(__dirname, "./__fixtures__/deepInclude.md");

describe("include repeated use", () => {
  it("should not expand nested directives twice", () => {
    const options = {
      currentPath: (env: IncludeEnv): string => env.filePath as string,
    };
    const source = `<!-- @include: ${fixturePath} -->\n`;
    const single = new MarkdownIt({ html: true }).use(include, options);
    const doubled = new MarkdownIt({ html: true }).use(include, options).use(include, options);

    const singleOutput = single.render(source, { filePath: __filename });
    const doubleOutput = doubled.render(source, { filePath: __filename });

    expect(singleOutput).toContain("Heading 3");
    expect(doubleOutput).toBe(singleOutput);
  });
});
