import { describe, expect, it, vi } from "vitest";

import { verifyCommit } from "../verifyCommit.js";

const verifyMock = vi.hoisted(() => ({
  verifyCommitMessage: vi.fn<(options: unknown) => Promise<void>>(),
}));

vi.mock(import("@mr-hope/verify-commit-message"), () => ({
  verifyCommitMessage: verifyMock.verifyCommitMessage,
}));

describe("scripts/verifyCommit.ts", () => {
  it("should not verify a commit message when imported", () => {
    expect(verifyMock.verifyCommitMessage).not.toHaveBeenCalled();
  });

  it("should verify the commit message with the docs and packages scopes", async () => {
    verifyMock.verifyCommitMessage.mockClear();

    await verifyCommit();

    expect(verifyMock.verifyCommitMessage).toHaveBeenCalledTimes(1);
    expect(verifyMock.verifyCommitMessage).toHaveBeenCalledWith({
      importMeta: expect.anything(),
      process: expect.anything(),
      packages: ["docs", "packages/*"],
    });
  });
});
