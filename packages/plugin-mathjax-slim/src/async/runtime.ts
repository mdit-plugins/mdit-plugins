/**
 * Whether the current runtime has a browser DOM.
 *
 * 当前运行时是否具有浏览器 DOM。
 *
 * Workers and DOM shims can expose `self` without providing a real document. The async entry only
 * uses the CDN loader when both `window` and `document` exist.
 *
 * Worker 与 DOM shim 可能只提供 `self` 而没有真实 document。异步入口仅在 `window` 与 `document` 都存在时使用 CDN 加载器。
 *
 * @returns Whether the runtime is a browser / 是否为浏览器运行时
 */
export const isBrowserRuntime = (): boolean =>
  typeof window !== "undefined" && typeof document !== "undefined";
