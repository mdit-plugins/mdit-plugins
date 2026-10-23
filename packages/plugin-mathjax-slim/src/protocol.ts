/**
 * Wire protocol between the synchronous plugin (main thread) and the worker.
 *
 * 主线程同步插件与 worker 之间的协议类型。仅包含可结构化克隆的数据。
 */

import type { MarkdownItMathjaxOptions } from "./options.js";

/**
 * A single math item collected during one markdown-it render pass.
 *
 * 一次 markdown-it 渲染过程中收集到的单个公式。
 */
export interface MathjaxItem {
  /** TeX content / TeX 内容 */
  content: string;

  /** Whether it is display math / 是否行间公式 */
  display: boolean;
}

/**
 * Options that can be structured-cloned into the worker (`transformer` stays on the main thread).
 *
 * 可结构化克隆并传入 worker 的选项（`transformer` 留在主线程）。
 */
export type SerializableMathjaxOptions = Omit<MarkdownItMathjaxOptions, "transformer">;

/** Worker request / worker 请求 */
export type WorkerRequest =
  | { type: "create"; sessionId: string; options: SerializableMathjaxOptions }
  | { type: "render"; sessionId: string; items: MathjaxItem[] }
  | { type: "style"; sessionId: string }
  | { type: "reset"; sessionId: string }
  | { type: "clearStyle"; sessionId: string }
  | { type: "dispose"; sessionId: string };

/** Worker response / worker 响应 */
export type WorkerResponse = { style: string } | { html: string[] } | { ok: true };
