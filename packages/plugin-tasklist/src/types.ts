import type { Env } from "markdown-it";

export const tasklistIdKey = Symbol("tasklist:id");

export interface TaskListEnv extends Env {
  [tasklistIdKey]?: number;
}
