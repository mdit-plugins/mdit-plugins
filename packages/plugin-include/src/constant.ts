export const includePathsKey: unique symbol = Symbol("include:paths");

/**
 * Env key holding the nonce used by the internal include markers
 *
 * 保存内部 include 标记所用 nonce 的 env 键
 */
export const includeNonceKey: unique symbol = Symbol("include:nonce");
