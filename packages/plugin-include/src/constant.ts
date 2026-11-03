export const includePathsKey: unique symbol = Symbol("include:paths");

/**
 * Env key holding the nonce used by the internal include markers
 *
 * 保存内部 include 标记所用 nonce 的 env 键
 */
export const includeNonceKey: unique symbol = Symbol("include:nonce");

/**
 * Fallback nonce for direct helper calls that don't go through the plugin
 *
 * 直接调用辅助函数（不经过插件）时使用的默认 nonce
 */
export const DEFAULT_INCLUDE_NONCE: string = "mdit-include";
