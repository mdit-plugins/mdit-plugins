// The fake request intentionally mirrors Node's EventEmitter and callback based HTTP APIs.
// oxlint-disable promise/prefer-await-to-callbacks, unicorn/prefer-event-target

import { EventEmitter } from "node:events";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import type { Mock } from "vitest";
import { describe, expect, it, vi } from "vitest";

import {
  SYNC_CONCURRENCY,
  SyncError,
  getPackageNames,
  isEntryPoint,
  main,
  syncNpmMirror,
  syncPackage,
  syncPackages,
} from "../sync.js";

interface FakeResponse extends EventEmitter {
  statusCode: number;
  resume: Mock<() => void>;
}

interface RequestOptions {
  method?: string;
  headers?: Record<string, unknown>;
}

const httpsMock = vi.hoisted(() => ({
  request:
    vi.fn<
      (
        url: string,
        options: RequestOptions,
        onResponse: (response: FakeResponse) => void,
      ) => FakeRequest
    >(),
}));

// oxlint-disable-next-line vitest/prefer-import-in-mock
vi.mock("node:https", () => ({ request: httpsMock.request }));

class FakeRequest extends EventEmitter {
  readonly url: string;
  readonly options: RequestOptions;
  readonly responses: FakeResponse[] = [];
  readonly write = vi.fn<() => void>();
  readonly setTimeout = vi.fn<(timeout: number, callback: () => void) => FakeRequest>(
    (_timeout: number, callback: () => void): FakeRequest => {
      this.timeoutCallback = callback;

      return this;
    },
  );
  readonly destroy = vi.fn<(error?: Error) => FakeRequest>((error?: Error): FakeRequest => {
    if (error) this.emit("error", error);

    return this;
  });
  readonly end = vi.fn<() => FakeRequest>((): FakeRequest => {
    queueMicrotask((): void => {
      this.responder(this);
    });

    return this;
  });

  private timeoutCallback: (() => void) | undefined;
  private finished = false;
  private readonly responder: (request: FakeRequest) => void;
  private readonly onFinish: () => void;
  private readonly onResponse: (response: FakeResponse) => void;

  constructor(
    url: string,
    options: RequestOptions,
    responder: (request: FakeRequest) => void,
    onFinish: () => void,
    onResponse: (response: FakeResponse) => void,
  ) {
    super();
    this.url = url;
    this.options = options;
    this.responder = responder;
    this.onFinish = onFinish;
    this.onResponse = onResponse;
  }

  respond(statusCode: number): void {
    this.finish();

    const response = Object.assign(new EventEmitter(), {
      statusCode,
      resume: vi.fn<() => void>(),
    });

    this.responses.push(response);
    this.onResponse(response);
  }

  fail(error: Error): void {
    this.finish();
    this.emit("error", error);
  }

  triggerTimeout(): void {
    this.finish();
    this.timeoutCallback?.();
  }

  triggerClose(): void {
    this.finish();
    this.emit("close");
  }

  private finish(): void {
    if (this.finished) return;

    this.finished = true;
    this.onFinish();
  }
}

type RequestBehavior = (request: FakeRequest) => void;

interface SyncHarness {
  requests: FakeRequest[];
  responder: RequestBehavior | undefined;
  activeRequests: number;
  maxActiveRequests: number;
}

const respondWith =
  (statusCode: number): RequestBehavior =>
  (request: FakeRequest): void => {
    request.respond(statusCode);
  };

const failWith =
  (message: string): RequestBehavior =>
  (request: FakeRequest): void => {
    request.fail(new Error(message));
  };

const timeoutRequest: RequestBehavior = (request: FakeRequest): void => {
  request.triggerTimeout();
};

const closeRequest: RequestBehavior = (request: FakeRequest): void => {
  request.triggerClose();
};

const respondInSequence = (...behaviors: RequestBehavior[]): RequestBehavior => {
  let index = 0;

  return (request: FakeRequest): void => {
    const behavior = behaviors[Math.min(index, behaviors.length - 1)];

    index += 1;
    behavior?.(request);
  };
};

const packageNameFromUrl = (url: string): string =>
  decodeURIComponent(new URL(url).pathname.split("/").at(-2) ?? "");

const respondByPackage =
  (behaviors: Readonly<Record<string, RequestBehavior>>): RequestBehavior =>
  (request: FakeRequest): void => {
    const behavior = behaviors[packageNameFromUrl(request.url)] ?? respondWith(200);

    behavior(request);
  };

const createHarness = (): SyncHarness => {
  const harness: SyncHarness = {
    requests: [],
    responder: undefined,
    activeRequests: 0,
    maxActiveRequests: 0,
  };

  httpsMock.request.mockReset();
  httpsMock.request.mockImplementation(
    (
      url: string,
      options: RequestOptions,
      onResponse: (response: FakeResponse) => void,
    ): FakeRequest => {
      const fakeRequest = new FakeRequest(
        url,
        options,
        (): void => {
          harness.responder?.(fakeRequest);
        },
        (): void => {
          harness.activeRequests -= 1;
        },
        onResponse,
      );

      harness.requests.push(fakeRequest);
      harness.activeRequests += 1;
      harness.maxActiveRequests = Math.max(harness.maxActiveRequests, harness.activeRequests);

      return fakeRequest;
    },
  );

  return harness;
};

describe("scripts/sync.ts", () => {
  describe("syncNpmMirror()", () => {
    it("should send a PUT request with an empty body", async () => {
      const harness = createHarness();

      harness.responder = respondWith(204);

      await syncNpmMirror("@mdit/plugin-align", { timeout: 1000 });

      expect(httpsMock.request).toHaveBeenCalledTimes(1);
      expect(httpsMock.request.mock.calls[0]?.[0]).toBe(
        "https://registry-direct.npmmirror.com/-/package/%40mdit%2Fplugin-align/syncs",
      );
      expect(httpsMock.request.mock.calls[0]?.[1]).toStrictEqual({
        method: "PUT",
        headers: { "Content-Length": 0 },
      });
      expect(harness.requests[0]?.write).toHaveBeenCalledWith("");
      expect(harness.requests[0]?.end).toHaveBeenCalledTimes(1);
      expect(harness.requests[0]?.setTimeout).toHaveBeenCalledWith(1000, expect.any(Function));
    });

    it("should drain the response of a successful request", async () => {
      const harness = createHarness();

      harness.responder = respondWith(200);

      await syncNpmMirror("@mdit/plugin-mark");

      expect(harness.requests[0]?.responses[0]?.resume).toHaveBeenCalledTimes(1);
    });

    it("should reject with the status code of a non-2xx response", async () => {
      const harness = createHarness();

      harness.responder = respondWith(400);

      const error = await syncNpmMirror("@mdit/plugin-mark").catch((err: unknown): unknown => err);

      expect(error).toBeInstanceOf(SyncError);
      expect(error).toMatchObject({
        packageName: "@mdit/plugin-mark",
        statusCode: 400,
        retryable: false,
      });
    });
  });

  describe("syncPackage()", () => {
    it("should retry retryable responses and resolve after a 2xx response", async () => {
      const harness = createHarness();

      harness.responder = respondInSequence(respondWith(502), respondWith(200));

      await syncPackage("@mdit/plugin-align", { retries: 1, retryDelay: 0 });

      expect(harness.requests).toHaveLength(2);
      expect(harness.requests[0]?.responses[0]?.resume).toHaveBeenCalledTimes(1);
    });

    it("should retry non-2xx responses and fail after the retry limit", async () => {
      const harness = createHarness();

      harness.responder = respondWith(503);

      await expect(
        syncPackage("@mdit/plugin-align", { retries: 2, retryDelay: 0 }),
      ).rejects.toThrow("unexpected HTTP status 503");

      expect(harness.requests).toHaveLength(3);
      expect(
        harness.requests.every((request) => request.responses[0]?.resume.mock.calls.length === 1),
      ).toBe(true);
    });

    it("should not retry non-retryable 4xx responses", async () => {
      const harness = createHarness();

      harness.responder = respondWith(404);

      await expect(
        syncPackage("@mdit/plugin-align", { retries: 3, retryDelay: 0 }),
      ).rejects.toThrow("unexpected HTTP status 404");

      expect(harness.requests).toHaveLength(1);
    });

    it("should retry network errors", async () => {
      const harness = createHarness();

      harness.responder = respondInSequence(failWith("socket hang up"), respondWith(200));

      await syncPackage("@mdit/plugin-align", { retries: 1, retryDelay: 0 });

      expect(harness.requests).toHaveLength(2);
      expect(harness.requests[0]?.listenerCount("error")).toBeGreaterThan(0);
    });

    it("should fail after the retry limit for network errors", async () => {
      const harness = createHarness();

      harness.responder = failWith("socket hang up");

      await expect(
        syncPackage("@mdit/plugin-align", { retries: 1, retryDelay: 0 }),
      ).rejects.toThrow("request failed: socket hang up");

      expect(harness.requests).toHaveLength(2);
    });

    it("should destroy a timed out request and retry", async () => {
      const harness = createHarness();

      harness.responder = respondInSequence(timeoutRequest, respondWith(200));

      await syncPackage("@mdit/plugin-align", { retries: 1, retryDelay: 0, timeout: 50 });

      expect(harness.requests[0]?.destroy).toHaveBeenCalledTimes(1);
      expect(harness.requests[0]?.destroy.mock.calls[0]?.[0]).toBeInstanceOf(SyncError);
      expect(harness.requests).toHaveLength(2);
    });

    it("should fail when every attempt times out", async () => {
      const harness = createHarness();

      harness.responder = timeoutRequest;

      await expect(
        syncPackage("@mdit/plugin-align", { retries: 0, retryDelay: 0, timeout: 50 }),
      ).rejects.toThrow("request timed out after 50ms");

      expect(harness.requests).toHaveLength(1);
    });

    it("should retry when the connection closes without a response", async () => {
      const harness = createHarness();

      harness.responder = respondInSequence(closeRequest, respondWith(200));

      await syncPackage("@mdit/plugin-align", { retries: 1, retryDelay: 0 });

      expect(harness.requests).toHaveLength(2);
    });
  });

  describe("syncPackages()", () => {
    it("should limit the number of concurrent requests", async () => {
      const harness = createHarness();

      harness.responder = (request: FakeRequest): void => {
        setTimeout((): void => {
          request.respond(200);
        }, 10);
      };

      const packageNames = Array.from({ length: 12 }, (_, index) => `@mdit/plugin-${index}`);
      const synced = await syncPackages(packageNames, { concurrency: 3, retryDelay: 0 });

      expect(synced).toHaveLength(packageNames.length);
      expect(harness.requests).toHaveLength(packageNames.length);
      expect(harness.maxActiveRequests).toBe(3);
    });

    it("should use five concurrent requests by default", () => {
      expect(SYNC_CONCURRENCY).toBe(5);
    });

    it("should aggregate failures from multiple packages", async () => {
      const harness = createHarness();

      harness.responder = respondByPackage({
        "@mdit/plugin-a": respondWith(500),
        "@mdit/plugin-b": respondWith(404),
        "@mdit/plugin-c": failWith("socket hang up"),
        "@mdit/plugin-ok": respondWith(200),
      });

      const error = await syncPackages(
        ["@mdit/plugin-a", "@mdit/plugin-b", "@mdit/plugin-c", "@mdit/plugin-ok"],
        { retries: 0, retryDelay: 0 },
      ).catch((err: unknown): unknown => err);

      expect(error).toBeInstanceOf(AggregateError);

      const aggregateError = error as AggregateError;

      expect(
        aggregateError.errors.map((err: unknown): string => (err as SyncError).packageName),
      ).toStrictEqual(["@mdit/plugin-a", "@mdit/plugin-b", "@mdit/plugin-c"]);
      expect(aggregateError.message).toContain("@mdit/plugin-a: unexpected HTTP status 500");
      expect(aggregateError.message).toContain("@mdit/plugin-c: request failed: socket hang up");
      expect(aggregateError.message).toContain("(1 succeeded)");
    });

    it("should reject an invalid concurrency", async () => {
      await expect(syncPackages(["@mdit/plugin-a"], { concurrency: 0 })).rejects.toThrow(
        "concurrency must be a positive integer",
      );
    });
  });

  describe("getPackageNames()", () => {
    it("should read package names from manifests and skip hidden entries", async () => {
      const packagesDir = mkdtempSync(path.join(tmpdir(), "mdit-sync-"));

      mkdirSync(path.join(packagesDir, "plugin-a"));
      writeFileSync(
        path.join(packagesDir, "plugin-a", "package.json"),
        JSON.stringify({ name: "@mdit/plugin-a" }),
      );
      mkdirSync(path.join(packagesDir, "plugin-b"));
      writeFileSync(
        path.join(packagesDir, "plugin-b", "package.json"),
        JSON.stringify({ name: "@mdit/plugin-b" }),
      );
      mkdirSync(path.join(packagesDir, ".hidden"));
      writeFileSync(path.join(packagesDir, ".DS_Store"), "");

      expect((await getPackageNames(packagesDir)).sort()).toStrictEqual([
        "@mdit/plugin-a",
        "@mdit/plugin-b",
      ]);

      rmSync(packagesDir, { force: true, recursive: true });
    });
  });

  describe("main()", () => {
    it("should sync every package and report the synced count", async () => {
      const harness = createHarness();
      const packagesDir = mkdtempSync(path.join(tmpdir(), "mdit-sync-main-"));

      for (const name of ["plugin-a", "plugin-b"]) {
        mkdirSync(path.join(packagesDir, name));
        writeFileSync(
          path.join(packagesDir, name, "package.json"),
          JSON.stringify({ name: `@mdit/${name}` }),
        );
      }

      harness.responder = respondWith(202);

      const log = vi.spyOn(console, "log").mockImplementation((): void => {});

      await main(packagesDir, { retryDelay: 0 });

      expect(log).toHaveBeenCalledWith("Synced 2/2 package(s) to npmmirror.com.");

      log.mockRestore();
      rmSync(packagesDir, { force: true, recursive: true });
    });
  });
});

describe("isEntryPoint guard", () => {
  it("should detect the source file as entry", () => {
    const savedArgv = process.argv;

    process.argv = [savedArgv[0], path.resolve(import.meta.dirname, "..", "sync.ts")];
    expect(isEntryPoint()).toBe(true);

    process.argv = savedArgv;
  });

  it("should detect the unrun bundle as entry", () => {
    const savedArgv = process.argv;

    process.argv = [
      savedArgv[0],
      path.resolve(import.meta.dirname, "..", "..", "node_modules/.unrun/sync.ts.abc123.mjs"),
    ];
    expect(isEntryPoint()).toBe(true);

    process.argv = savedArgv;
  });

  it("should not treat an unrelated file as entry", () => {
    const savedArgv = process.argv;

    process.argv = [savedArgv[0], path.resolve(import.meta.dirname, "..", "bootstrap.ts")];
    expect(isEntryPoint()).toBe(false);

    process.argv = savedArgv;
  });

  it("should handle a missing argv entry", () => {
    const savedArgv = process.argv;

    process.argv = [savedArgv[0]];
    expect(isEntryPoint()).toBe(false);

    process.argv = savedArgv;
  });
});
