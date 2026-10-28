import { readdir, readFile } from "node:fs/promises";
import { request } from "node:https";
import path from "node:path";

/** Base URL of the npmmirror sync API / npmmirror 同步 API 的基础地址 */
const SYNC_ENDPOINT = "https://registry-direct.npmmirror.com/-/package";

/** Maximum number of packages synced concurrently / 同时同步的最大包数量 */
export const SYNC_CONCURRENCY = 5;

/** Per-request timeout in milliseconds / 单次请求超时时间（毫秒） */
export const SYNC_TIMEOUT = 30_000;

/** Number of retries after the initial failed attempt / 首次尝试失败后的重试次数 */
export const SYNC_RETRIES = 3;

/** Base backoff delay in milliseconds / 重试的基础退避时间（毫秒） */
export const SYNC_RETRY_DELAY = 1000;

/** Options controlling how packages are synced / 控制包同步行为的选项 */
export interface SyncOptions {
  /**
   * Per-request timeout in milliseconds
   *
   * 单次请求超时时间（毫秒）
   *
   * @default 30000
   */
  timeout?: number;

  /**
   * Number of retries after the initial failed attempt
   *
   * 首次尝试失败后的重试次数
   *
   * @default 3
   */
  retries?: number;

  /**
   * Maximum number of requests in flight
   *
   * 同时进行中的最大请求数
   *
   * @default 5
   */
  concurrency?: number;

  /**
   * Base backoff delay in milliseconds, `0` retries immediately
   *
   * 重试的基础退避时间（毫秒），`0` 表示立即重试
   *
   * @default 1000
   */
  retryDelay?: number;
}

/** A package that failed to sync / 同步失败的包 */
export interface SyncFailure {
  /** Package name / 包名 */
  packageName: string;

  /** Failure reason / 失败原因 */
  reason: string;
}

/** Error thrown when a single sync request fails / 单次同步请求失败时抛出的错误 */
export class SyncError extends Error {
  /** Package name / 包名 */
  readonly packageName: string;

  /** HTTP status code, when the failure comes from an HTTP response / HTTP 响应状态码（若失败来自响应） */
  readonly statusCode: number | undefined;

  /** Whether the failure can be retried / 该失败是否可重试 */
  readonly retryable: boolean;

  constructor(
    packageName: string,
    message: string,
    options: { statusCode?: number; retryable?: boolean; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "SyncError";
    this.packageName = packageName;
    this.statusCode = options.statusCode;
    this.retryable = options.retryable ?? false;
  }
}

/**
 * Wait for the given amount of time
 *
 * 等待指定时间
 *
 * @param ms - Milliseconds to wait / 等待毫秒数
 * @returns Resolves after the delay / 延迟结束后 resolve
 */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Send a single sync request for a package to npmmirror.com
 *
 * 向 npmmirror.com 发送单个包的同步请求
 *
 * @param packageName - Npm package name / npm 包名
 * @param options - Request options / 请求选项
 * @returns Resolves when the registry accepts the sync request / 注册表接受同步请求后 resolve
 */
export const syncNpmMirror = (
  packageName: string,
  options: Pick<SyncOptions, "timeout"> = {},
): Promise<void> => {
  const timeout = options.timeout ?? SYNC_TIMEOUT;

  return new Promise<void>((resolve, reject) => {
    let settled = false;

    /**
     * Settle the promise once
     *
     * @param error - Failure to reject with / 用于 reject 的错误
     */
    const settle = (error?: SyncError): void => {
      if (settled) return;

      settled = true;

      if (error) reject(error);
      else resolve();
    };

    const req = request(
      `${SYNC_ENDPOINT}/${encodeURIComponent(packageName)}/syncs`,
      {
        method: "PUT",
        headers: {
          "Content-Length": 0,
        },
      },
      (res) => {
        const statusCode = res.statusCode ?? 0;

        res.on("error", (error: Error) => {
          settle(
            new SyncError(packageName, `response failed: ${error.message}`, {
              cause: error,
              retryable: true,
            }),
          );
        });

        // Always drain the response so the underlying socket can be released
        res.resume();

        if (statusCode >= 200 && statusCode < 300) {
          settle();

          return;
        }

        settle(
          new SyncError(packageName, `unexpected HTTP status ${statusCode}`, {
            statusCode,
            retryable: statusCode === 429 || statusCode >= 500,
          }),
        );
      },
    );

    req.on("error", (error: Error) => {
      settle(
        new SyncError(packageName, `request failed: ${error.message}`, {
          cause: error,
          retryable: true,
        }),
      );
    });

    // Guard against a silent close (e.g. a proxy dropping the connection)
    req.on("close", () => {
      settle(
        new SyncError(packageName, "connection closed before a response was received", {
          retryable: true,
        }),
      );
    });

    req.setTimeout(timeout, () => {
      if (settled) return;

      const error = new SyncError(packageName, `request timed out after ${timeout}ms`, {
        retryable: true,
      });

      req.destroy(error);
      settle(error);
    });

    req.write("");
    req.end();
  });
};

/**
 * Sync a package to npmmirror.com with retries
 *
 * 带重试地把单个包同步到 npmmirror.com
 *
 * @param packageName - Npm package name / npm 包名
 * @param options - Sync options / 同步选项
 * @returns Resolves when the package is synced / 包同步成功后 resolve
 */
export const syncPackage = async (
  packageName: string,
  options: SyncOptions = {},
): Promise<void> => {
  const { retries = SYNC_RETRIES, retryDelay = SYNC_RETRY_DELAY, timeout = SYNC_TIMEOUT } = options;

  const attempt = async (retry: number): Promise<void> => {
    try {
      await syncNpmMirror(packageName, { timeout });
    } catch (err) {
      if (!(err instanceof SyncError) || !err.retryable || retry >= retries) throw err;

      const delay = retryDelay * 2 ** retry;

      if (delay > 0) await sleep(delay);

      await attempt(retry + 1);
    }
  };

  await attempt(0);
};

/**
 * Sync a list of packages to npmmirror.com with limited concurrency
 *
 * 以受限并发把一组包同步到 npmmirror.com
 *
 * @param packageNames - Npm package names / npm 包名列表
 * @param options - Sync options / 同步选项
 * @returns Names of the packages synced successfully / 成功同步的包名
 * @throws {AggregateError} When at least one package fails / 当至少一个包同步失败时抛出
 */
export const syncPackages = async (
  packageNames: readonly string[],
  options: SyncOptions = {},
): Promise<readonly string[]> => {
  const { concurrency = SYNC_CONCURRENCY, ...requestOptions } = options;

  if (!Number.isInteger(concurrency) || concurrency < 1)
    throw new RangeError(`concurrency must be a positive integer, received ${concurrency}`);

  const synced: string[] = [];
  const failures: SyncFailure[] = [];
  const iterator = packageNames[Symbol.iterator]();

  const worker = async (): Promise<void> => {
    const { done, value: packageName } = iterator.next();

    if (done) return;

    try {
      await syncPackage(packageName, requestOptions);
      synced.push(packageName);
    } catch (err) {
      failures.push({
        packageName,
        reason: err instanceof Error ? err.message : String(err),
      });
    }

    await worker();
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, packageNames.length) }, () => worker()),
  );

  if (failures.length > 0) {
    failures.sort((a, b) => a.packageName.localeCompare(b.packageName));

    throw new AggregateError(
      failures.map(({ packageName, reason }) => new SyncError(packageName, reason)),
      `Failed to sync ${failures.length} package(s) to npmmirror.com (${synced.length} succeeded):\n${failures
        .map(({ packageName, reason }) => `  - ${packageName}: ${reason}`)
        .join("\n")}`,
    );
  }

  return synced;
};

/**
 * Read npm package names from a packages directory
 *
 * 从 packages 目录读取 npm 包名
 *
 * @param packagesDir - Packages directory / 包目录
 * @returns Npm package names / npm 包名列表
 */
export const getPackageNames = async (packagesDir: string): Promise<string[]> => {
  const entries = await readdir(packagesDir, { withFileTypes: true });

  return Promise.all(
    entries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map(async (entry) => {
        const manifestPath = path.join(packagesDir, entry.name, "package.json");
        const { name } = JSON.parse(await readFile(manifestPath, "utf8")) as { name: string };

        return name;
      }),
  );
};

/**
 * Sync every package in the packages directory to npmmirror.com
 *
 * 把 packages 目录下的所有包同步到 npmmirror.com
 *
 * @param packagesDir - Packages directory, defaults to the repository `packages` directory /
 *   包目录，默认为仓库的 `packages` 目录
 * @param options - Sync options / 同步选项
 */
export const main = async (
  packagesDir: string = path.resolve(import.meta.dirname, "../packages"),
  options: SyncOptions = {},
): Promise<void> => {
  const packageNames = await getPackageNames(packagesDir);
  const synced = await syncPackages(packageNames, options);

  console.log(`Synced ${synced.length}/${packageNames.length} package(s) to npmmirror.com.`);
};

/**
 * Whether this module is the process entry point
 *
 * The publish workflow executes this file through `unrun`, which runs a generated
 * `node_modules/.unrun/<name>.<hash>.mjs` bundle in a child process. In that case `process.argv[1]`
 * points at the bundle instead of this file, so the bundle name is matched as well.
 *
 * @returns Whether the current module is executed directly / 当前模块是否被直接执行
 */
export const isEntryPoint = (): boolean => {
  const [, entry] = process.argv;

  if (!entry) return false;

  const entryPath = path.resolve(entry);

  return (
    entryPath === import.meta.filename ||
    path.basename(entryPath).startsWith(`${path.basename(import.meta.filename)}.`)
  );
};

if (isEntryPoint()) await main();
