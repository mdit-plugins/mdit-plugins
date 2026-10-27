import type { Env } from "markdown-it";

// Kept for backwards compatibility: the plugin no longer generates checkbox ids or stores a
// counter in `env`, so this symbol only exists for typing and has no runtime value.
export declare const tasklistIdKey: unique symbol;

export interface TaskListEnv extends Env {
  [tasklistIdKey]?: number;
}
