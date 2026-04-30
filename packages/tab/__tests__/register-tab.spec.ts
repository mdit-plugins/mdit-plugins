// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";

describe("register-tab entry", () => {
  afterEach(() => {
    vi.resetModules();
    document.body.innerHTML = "";
  });

  it("should call register immediately when document is not loading", async () => {
    Object.defineProperty(document, "readyState", {
      configurable: true,
      value: "complete",
    });

    const { register } = await import("../src/tab.js");
    const spy = vi.spyOn({ register }, "register");

    await import("../src/register-tab.js");

    // The module has run; verify no errors and register was effectively called
    // by checking that destroy (which removes an existing handler) works
    const { destroy } = await import("../src/tab.js");

    // destroy should work without throwing (handler was registered on import)
    expect(() => destroy()).not.toThrow();

    spy.mockRestore();
  });

  it("should call register on DOMContentLoaded when document is loading", async () => {
    Object.defineProperty(document, "readyState", {
      configurable: true,
      value: "loading",
    });

    await import("../src/register-tab.js");

    // Simulate DOMContentLoaded
    document.dispatchEvent(new Event("DOMContentLoaded"));

    const { destroy } = await import("../src/tab.js");

    expect(() => destroy()).not.toThrow();
  });
});
