// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const createTabsWrapper = (): HTMLElement => {
  const wrapper = document.createElement("div");

  wrapper.className = "tabs-tabs-wrapper";

  const btn = document.createElement("button");

  btn.className = "tabs-tab-button";
  btn.dataset.tab = "0";
  wrapper.append(btn);

  const panel = document.createElement("div");

  panel.className = "tabs-tab-content";
  panel.dataset.index = "0";
  wrapper.append(panel);

  return wrapper;
};

describe("register-tab entry", () => {
  // oxlint-disable-next-line vitest/no-hooks
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = "";
  });

  // oxlint-disable-next-line vitest/no-hooks
  afterEach(async () => {
    // clean up handler registered during import
    await import("../src/tab.js").then(({ destroy }) => {
      destroy();
    });
  });

  it("should call register immediately when document is not loading", async () => {
    Object.defineProperty(document, "readyState", {
      configurable: true,
      value: "complete",
    });

    const wrapper = createTabsWrapper();

    document.body.append(wrapper);

    await import("../src/register-tab.js");

    // initTabsWrapper should have activated the first tab, proving register() ran
    const btn = wrapper.querySelector<HTMLButtonElement>(".tabs-tab-button")!;

    expect(btn.classList.contains("active")).toBe(true);
  });

  it("should call register on DOMContentLoaded when document is loading", async () => {
    Object.defineProperty(document, "readyState", {
      configurable: true,
      value: "loading",
    });

    const wrapper = createTabsWrapper();

    document.body.append(wrapper);

    await import("../src/register-tab.js");

    const btn = wrapper.querySelector<HTMLButtonElement>(".tabs-tab-button")!;

    // register has not run yet; tab should not be activated
    expect(btn.classList.contains("active")).toBe(false);

    // Simulate DOMContentLoaded
    document.dispatchEvent(new Event("DOMContentLoaded"));

    // Now register should have run and the first tab should be activated
    expect(btn.classList.contains("active")).toBe(true);
  });
});
