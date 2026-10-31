/* istanbul ignore file -- executed in a worker_thread, not instrumented by vitest/istanbul */
/**
 * Worker entry for the experimental synchronous MathJax plugin.
 *
 * The worker owns all MathJax state and runs the official async flow (`convertPromise` /
 * `loadDynamicFiles`). The main thread talks to it through synckit and blocks synchronously.
 *
 * 同步 MathJax 插件的 worker 入口：worker 内持有 MathJax 状态并完整走官方异步流程， 主线程通过 synckit 同步阻塞调用。
 */

import { runAsWorker } from "synckit";

import type { WorkerRequest, WorkerResponse } from "./protocol.js";
import type { Session } from "./session.js";
import { createSession } from "./session.js";

const sessions = new Map<string, Session>();

const getSession = (sessionId: string): Session => {
  const session = sessions.get(sessionId);

  if (!session) throw new Error(`[@mdit/plugin-mathjax] unknown session: ${sessionId}`);

  return session;
};

runAsWorker(async (request: WorkerRequest): Promise<WorkerResponse> => {
  switch (request.type) {
    case "create": {
      sessions.set(request.sessionId, await createSession(request.options, request.enableHtml));

      return { ok: true };
    }

    case "render": {
      return { html: await getSession(request.sessionId).render(request.items) };
    }

    case "warmup": {
      if (request.preloadFonts) await getSession(request.sessionId).preloadFonts();

      return { ok: true };
    }

    case "style": {
      return { style: await getSession(request.sessionId).style() };
    }

    case "reset": {
      getSession(request.sessionId).reset();

      return { ok: true };
    }

    case "clearStyle": {
      getSession(request.sessionId).clearStyle();

      return { ok: true };
    }

    case "dispose": {
      sessions.delete(request.sessionId);

      return { ok: true };
    }

    default: {
      throw new Error(`[@mdit/plugin-mathjax] unknown request: ${String(request)}`);
    }
  }
});
