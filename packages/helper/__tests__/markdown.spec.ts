import MarkdownIt from "markdown-it";
import type { StateBlock } from "markdown-it";
import { describe, expect, it } from "vitest";

import { scanFence } from "../src/markdown.js";

const createState = (content: string, blkIndent = 0): StateBlock => {
  const md = new MarkdownIt();
  const state = new md.block.State(content, md, {}, []);

  state.blkIndent = blkIndent;

  return state;
};

describe(scanFence, () => {
  it("should scan a closed backtick fence", () => {
    const state = createState("```\ncode\n```\ntext");

    expect(scanFence(state, 0, 4, 0)).toBe(3);
  });

  it("should scan a closed tilde fence", () => {
    const state = createState("~~~\ncode\n~~~\n");

    expect(scanFence(state, 0, 3, 0)).toBe(3);
  });

  it("should autoclose an unclosed fence at endLine", () => {
    const state = createState("```\ncode");

    expect(scanFence(state, 0, 2, 0)).toBe(2);
  });

  it("should return null for an indented code block", () => {
    const state = createState("    ```\n");

    expect(scanFence(state, 0, 1, 0)).toBeNull();
  });

  it("should return null for a too-short marker", () => {
    const state = createState("`` a\n");

    expect(scanFence(state, 0, 1, 0)).toBeNull();
  });

  it("should return null for a too-short line", () => {
    const state = createState("ab\n");

    expect(scanFence(state, 0, 1, 0)).toBeNull();
  });

  it("should return null when the line is not a fence", () => {
    const state = createState("aaa\n");

    expect(scanFence(state, 0, 1, 0)).toBeNull();
  });

  it("should return null when a backtick fence info contains a backtick", () => {
    const state = createState("``` a`b\ncode\n```\n");

    expect(scanFence(state, 0, 3, 0)).toBeNull();
  });

  it("should respect blkIndent for an indented fence", () => {
    const state = createState("  ```\n  code\n  ```\n");

    expect(scanFence(state, 0, 3, 2)).toBe(3);
  });

  it("should break when the closing line is outdented below blkIndent", () => {
    const state = createState("  ```\n  code\n```\n");

    expect(scanFence(state, 0, 3, 2)).toBe(2);
  });

  it("should not accept an over-indented closing line", () => {
    const state = createState("```\ncode\n    ```\n");

    expect(scanFence(state, 0, 3, 0)).toBe(3);
  });

  it("should not accept a shorter closing marker", () => {
    const state = createState("```\ncode\n``\n");

    expect(scanFence(state, 0, 3, 0)).toBe(3);
  });

  it("should not accept a closing line with trailing content", () => {
    const state = createState("```\ncode\n``` x\n");

    expect(scanFence(state, 0, 3, 0)).toBe(3);
  });

  it("should not accept a closing line with a different marker", () => {
    const state = createState("```\ncode\n~~~\n");

    expect(scanFence(state, 0, 3, 0)).toBe(3);
  });
});
