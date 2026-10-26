/**
 * Synchronous MathJax plugin, used like every other markdown-it plugin:
 *
 * ```ts
 * const md = new MarkdownIt().use(mathjax, { output: "svg" });
 * const html = md.render("$x$"); // fully synchronous
 * const { outputStyle } = getMathjax(md);
 * const css = outputStyle(); // fully synchronous
 * ```
 *
 * Node.js implementation: MathJax's official async API runs in a worker thread and `synckit` blocks
 * the main thread on the results. One IPC round-trip is made per markdown-it render pass (formulas
 * are collected through placeholders and flushed together); everything else (e.g. `transformer`)
 * stays on the main thread.
 *
 * 同步 MathJax 插件：像普通 markdown-it 插件一样使用，渲染全同步。 Node 侧用 synckit + worker 执行 MathJax 官方异步 API，每篇文档一次
 * IPC 批量往返。
 */

import { tex } from "@mdit/plugin-tex";
import type { MarkdownIt } from "markdown-it";
import { createSyncFn } from "synckit";
import type { Syncify } from "synckit";

import type { MarkdownItMathjaxOptions, TeXTransformer } from "./options.js";
import type {
  MathjaxItem,
  SerializableMathjaxOptions,
  WorkerRequest,
  WorkerResponse,
} from "./protocol.js";

/**
 * Options of the experimental synchronous plugin.
 *
 * 同步插件选项。
 */
export interface MarkdownItSyncMathjaxOptions extends MarkdownItMathjaxOptions {
  /**
   * How formulas of a markdown document are converted.
   *
   * - `"batch"`: collect all formulas of the document and convert them in one worker round-trip when
   *   the outermost render finishes. Nested `md.render()` / `md.renderInline()` calls return
   *   internal placeholders until that flush.
   * - `"immediate"`: convert every formula as soon as it is encountered, so nested render calls
   *   return final HTML immediately, at the cost of one worker round-trip per formula.
   *
   * 文档中公式的转换方式。
   *
   * - `"batch"`：收集整篇文档的公式，在最外层 render 结束时用一次 worker 往返转换；嵌套的 `md.render()` / `md.renderInline()` 在
   *   flush 前返回内部占位符。
   * - `"immediate"`：遇到公式立即转换，嵌套 render 会立即返回最终 HTML，代价是每个公式一次 worker 往返。
   *
   * @default "batch"
   */
  renderStrategy?: "batch" | "immediate";

  /**
   * Timeout of a single synchronous worker call in milliseconds.
   *
   * 单次同步 worker 调用的超时时间（毫秒）。
   *
   * @default 30000
   */
  workerTimeout?: number;

  /**
   * Custom worker entry, used internally to test the source implementation against the built
   * worker.
   *
   * 自定义 worker 入口，仅用于让源码实现对接构建后的 worker。
   *
   * @internal
   */
  workerPath?: URL | string;
}

/**
 * Synchronous MathJax methods, retrieved with `getMathjax(md)`.
 *
 * 同步 MathJax 方法集合，通过 `getMathjax(md)` 获取。
 */
export interface MathjaxMethods {
  /** Clear the style cache and reset both input and output jax / 清除样式缓存并重置输入输出 jax */
  clearStyle: () => void;

  /** Terminate the worker-side session / 终止 worker 侧 session */
  dispose: () => void;

  /**
   * Return the CSS content collected from all rendered formulas synchronously.
   *
   * 同步返回所有已渲染公式收集到的 CSS。
   */
  outputStyle: () => string;

  /** Reset TeX state (macros / labels) / 重置 TeX 状态（宏与标签） */
  reset: () => void;

  /**
   * Initialize the worker and MathJax session synchronously, moving the one-time initialization
   * cost (~100ms) away from the first document.
   *
   * 同步初始化 worker 与 MathJax session，把一次性初始化开销（约 100ms）从首篇文档移走。
   *
   * @param options - Warmup options / 预热选项
   */
  warmup: (options?: WarmupOptions) => void;
}

/**
 * Options of `getMathjax(md).warmup()`.
 *
 * `getMathjax(md).warmup()` 的选项。
 */
export interface WarmupOptions {
  /**
   * Also load all dynamic font files (adds ~73ms for SVG / ~35ms for CHTML on the first call).
   *
   * 同时加载全部动态字体文件（首次调用会增加 SVG 约 73ms / CHTML 约 35ms）。
   *
   * @default false
   */
  preloadFonts?: boolean;
}

type WorkerFn = (request: WorkerRequest) => WorkerResponse | Promise<WorkerResponse>;

interface RuntimeState {
  depth: number;
  dirty: boolean;
  disposed: boolean;
  initialized: boolean;
  items: MathjaxItem[];
  nonce: string;
  sessionId: string;
  options: SerializableMathjaxOptions;
  enableHtml: boolean;
  renderStrategy: "batch" | "immediate";
  transformer: TeXTransformer | null;
  timeout: number;
  workerUrl: URL | string;
}

// Source mode (`vitest` importing `src/index.ts`) has no built worker next to it, so fall
// back to the package build output. The published entry always resolves `dist/worker.js`.
/* istanbul ignore next -- the `.ts` branch only exists for in-repo tests; published entries are `.js` */
const WORKER_URL = import.meta.url.endsWith(".ts")
  ? new URL("../dist/worker.js", import.meta.url)
  : new URL("worker.js", import.meta.url);
const DEFAULT_WORKER_TIMEOUT = 30_000;

const syncFnCache = new Map<string, Syncify<WorkerFn>>();

/**
 * Registered MathJax runtimes, keyed by the markdown-it instance.
 *
 * 已注册的 MathJax 运行时，以 markdown-it 实例为键。
 */
const mathjaxMethods = new WeakMap<MarkdownIt, MathjaxMethods>();

const getSyncFn = (workerPath: URL | string, timeout: number): Syncify<WorkerFn> => {
  const key = workerPath.toString();
  const cached = syncFnCache.get(key);

  if (cached) return cached;

  const syncFn = createSyncFn<WorkerFn>(workerPath, { timeout });

  syncFnCache.set(key, syncFn);

  return syncFn;
};

const FORBIDDEN_OUTPUT_OPTION_KEYS = [
  "fontData",
  "wrapperFactory",
  "cssStyles",
  "preFilters",
  "postFilters",
] as const;

const collectUnsupportedOptions = (options: MarkdownItSyncMathjaxOptions): string[] => {
  const names: string[] = [];

  if (options.tex?.formatError) names.push("tex.formatError");

  for (const outputName of ["chtml", "svg"] as const) {
    const outputOptions = options[outputName];

    if (!outputOptions) continue;

    for (const key of FORBIDDEN_OUTPUT_OPTION_KEYS)
      if (key in outputOptions) names.push(`${outputName}.${key}`);

    if (
      "linebreaks" in outputOptions &&
      outputOptions.linebreaks &&
      "LinebreakVisitor" in outputOptions.linebreaks
    )
      names.push(`${outputName}.linebreaks.LinebreakVisitor`);
  }

  return names;
};

const createRuntime = (
  options: MarkdownItSyncMathjaxOptions,
  enableHtml: boolean,
): RuntimeState => {
  const unsupported = collectUnsupportedOptions(options);

  if (unsupported.length > 0) {
    throw new TypeError(
      `[@mdit/plugin-mathjax] the following options cannot be sent to the worker: ${unsupported.join(", ")}. Use "@mdit/plugin-mathjax/async" instead.`,
    );
  }

  const { renderStrategy, transformer, workerPath, workerTimeout, ...serializableOptions } =
    options;

  try {
    // Fail early with a clear error instead of a DataCloneError inside the worker.
    structuredClone(serializableOptions);
  } catch (err) {
    throw new TypeError(
      `[@mdit/plugin-mathjax] options are not serializable: ${(err as Error).message}. Use "@mdit/plugin-mathjax/async" instead.`,
      { cause: err },
    );
  }

  const nonce = crypto.randomUUID().replaceAll("-", "");

  return {
    depth: 0,
    dirty: false,
    disposed: false,
    initialized: false,
    items: [],
    nonce,
    sessionId: crypto.randomUUID(),
    options: serializableOptions,
    enableHtml,
    renderStrategy: renderStrategy ?? "batch",
    transformer: transformer ?? null,
    timeout: workerTimeout ?? DEFAULT_WORKER_TIMEOUT,
    workerUrl: workerPath ?? WORKER_URL,
  };
};

const requestWorker = (state: RuntimeState, request: WorkerRequest): WorkerResponse => {
  if (state.disposed)
    throw new Error("[@mdit/plugin-mathjax] the instance has already been disposed");

  const worker = getSyncFn(state.workerUrl, state.timeout);

  if (!state.initialized) {
    worker({
      type: "create",
      sessionId: state.sessionId,
      options: state.options,
      enableHtml: state.enableHtml,
    });

    state.initialized = true;
  }

  return worker(request);
};

/**
 * Convert one formula immediately in the worker (used by the `immediate` render strategy).
 *
 * 立即在 worker 中转换单个公式（用于 `immediate` 渲染策略）。
 *
 * @param state - Runtime state / 运行时状态
 * @param content - TeX content / TeX 内容
 * @param display - Whether it is display math / 是否行间公式
 * @returns Rendered HTML / 渲染后的 HTML
 */
const convertImmediate = (state: RuntimeState, content: string, display: boolean): string => {
  const response = requestWorker(state, {
    type: "render",
    sessionId: state.sessionId,
    items: [{ content, display }],
  });

  /* istanbul ignore next -- defensive: the worker always returns html for a render request */
  if (!("html" in response))
    throw new TypeError("[@mdit/plugin-mathjax] unexpected worker response for render");

  const value = response.html[0];

  return state.transformer ? state.transformer(value, display) : value;
};

/**
 * Create a synchronous MathJax plugin, sharing the MathJax state of the given markdown-it instance.
 *
 * 创建同步 MathJax 插件，并共享给定 markdown-it 实例的 MathJax 状态。
 *
 * @param md - MarkdownIt instance / MarkdownIt 实例
 * @param options - Plugin options / 插件选项
 */
export const installSyncMathjax = (
  md: MarkdownIt,
  options: MarkdownItSyncMathjaxOptions = {},
): void => {
  if (mathjaxMethods.has(md)) {
    throw new Error(
      "[@mdit/plugin-mathjax] the mathjax plugin is already installed on this MarkdownIt instance",
    );
  }

  const state = createRuntime(options, md.options.html);
  const placeholderRegExp = new RegExp(String.raw`\u0002mjx-${state.nonce}-(\d+)\u0003`, "g");

  const placeholderFor = (index: number): string => `\u0002mjx-${state.nonce}-${index}\u0003`;

  const flush = (html: string): string => {
    const items = state.items;

    state.items = [];

    if (items.length === 0) return html;

    const response = requestWorker(state, {
      type: "render",
      sessionId: state.sessionId,
      items,
    });

    /* istanbul ignore next -- defensive: the worker always returns html for a render request */
    if (!("html" in response))
      throw new TypeError("[@mdit/plugin-mathjax] unexpected worker response for render");

    const rendered = response.html;

    return html.replaceAll(placeholderRegExp, (_, index: string) => {
      const itemIndex = Number(index);
      const value = rendered[itemIndex];

      return state.transformer ? state.transformer(value, items[itemIndex].display) : value;
    });
  };

  md.use(tex, {
    allowInlineWithSpace: options.allowInlineWithSpace,
    delimiters: options.delimiters,
    mathFence: options.mathFence,
    render: (content, display) => {
      state.dirty = true;

      if (state.renderStrategy === "immediate") return convertImmediate(state, content, display);

      const index = state.items.length;

      state.items.push({ content, display });

      return placeholderFor(index);
    },
  });

  // `batch` collects formulas for the whole render pass and flushes them in one worker round-trip
  // at the outermost return; `immediate` has nothing left to do here besides the document reset.
  const originalRender = md.renderer.render.bind(md.renderer);

  md.renderer.render = function render(tokens, renderOptions, env): string {
    state.depth += 1;

    try {
      const result = originalRender(tokens, renderOptions, env);

      if (state.renderStrategy === "immediate") return result;

      return state.depth === 1 ? flush(result) : result;
    } catch (err) {
      // A failed render pass never reaches the worker, but its collected items
      // would otherwise be flushed with the next document and leak TeX state
      // (e.g. \newcommand) into it.
      /* istanbul ignore next -- a nested render throwing is covered by the outer pass */
      if (state.depth === 1) state.items = [];

      throw err;
    } finally {
      state.depth -= 1;

      // Reset TeX/macro state once per document (and only when math was rendered), not once per
      // formula, so documents without math do not pay a worker round-trip at all.
      if (state.depth === 0 && state.initialized && state.dirty) {
        state.dirty = false;
        requestWorker(state, { type: "reset", sessionId: state.sessionId });
      }
    }
  };

  const methods: MathjaxMethods = {
    clearStyle: (): void => {
      if (!state.initialized) return;

      requestWorker(state, { type: "clearStyle", sessionId: state.sessionId });
    },
    dispose: (): void => {
      if (state.disposed) return;

      if (state.initialized) requestWorker(state, { type: "dispose", sessionId: state.sessionId });

      state.disposed = true;
      mathjaxMethods.delete(md);
    },
    outputStyle: (): string => {
      const response = requestWorker(state, { type: "style", sessionId: state.sessionId });

      /* istanbul ignore next -- defensive: the worker always returns style for a style request */
      if (!("style" in response))
        throw new TypeError("[@mdit/plugin-mathjax] unexpected worker response for style");

      return response.style;
    },
    reset: (): void => {
      if (!state.initialized) return;

      requestWorker(state, { type: "reset", sessionId: state.sessionId });
    },
    warmup: (warmupOptions?: WarmupOptions): void => {
      requestWorker(state, {
        type: "warmup",
        sessionId: state.sessionId,
        preloadFonts: warmupOptions?.preloadFonts ?? false,
      });
    },
  };

  mathjaxMethods.set(md, methods);
};

/**
 * Get the synchronous MathJax methods of a markdown-it instance.
 *
 * Unlike a `md.mathjax` property, this helper keeps the type augmentation local and avoids
 * polluting the global `MarkdownIt` type for users that do not use this plugin.
 *
 * 获取某个 markdown-it 实例上的同步 MathJax 方法。相比挂 `md.mathjax` 属性，该 helper 不会污染全局 `MarkdownIt`
 * 类型，也不会让所有实例多出一个可选属性。
 *
 * @example
 *   ```ts
 *   const md = new MarkdownIt().use(mathjax, { output: "svg" });
 *   const { outputStyle } = getMathjax(md);
 *   const css = outputStyle();
 *   ```;
 *
 * @param md - MarkdownIt instance / MarkdownIt 实例
 * @returns MathJax methods / MathJax 方法集合
 */
export const getMathjax = (md: MarkdownIt): MathjaxMethods => {
  const methods = mathjaxMethods.get(md);

  if (!methods) {
    throw new Error(
      "[@mdit/plugin-mathjax] mathjax is not installed on this MarkdownIt instance. Use `md.use(mathjax, options)` first.",
    );
  }

  return methods;
};
