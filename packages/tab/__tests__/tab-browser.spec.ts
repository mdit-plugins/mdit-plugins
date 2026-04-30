// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { destroy, refresh, register } from "../src/tab.js";

const createTabsWrapper = (
  name = "tabs",
  {
    numTabs = 2,
    activeIndex = -1,
    tabId = "",
  }: { numTabs?: number; activeIndex?: number; tabId?: string } = {},
): HTMLElement => {
  const wrapper = document.createElement("div");

  wrapper.className = `${name}-tabs-wrapper`;

  for (let i = 0; i < numTabs; i++) {
    const btn = document.createElement("button");

    btn.className = `${name}-tab-button`;
    btn.dataset.tab = String(i);
    if (tabId) btn.dataset.id = tabId;
    if (i === activeIndex) {
      btn.classList.add("active");
      btn.setAttribute("data-active", "");
    }
    wrapper.appendChild(btn);

    const panel = document.createElement("div");

    panel.className = `${name}-tab-content`;
    panel.dataset.index = String(i);
    if (i === activeIndex) {
      panel.classList.add("active");
      panel.setAttribute("data-active", "");
    }
    wrapper.appendChild(panel);
  }

  return wrapper;
};

describe("tab browser", () => {
  afterEach(() => {
    destroy();
    document.body.innerHTML = "";
  });

  describe("register", () => {
    it("should register click handler and initialize wrappers with no active tab", () => {
      const wrapper = createTabsWrapper();

      document.body.appendChild(wrapper);
      register();

      const btns = wrapper.querySelectorAll<HTMLButtonElement>(".tabs-tab-button");
      const panels = wrapper.querySelectorAll<HTMLElement>(".tabs-tab-content");

      // first tab should be activated by initTabsWrapper
      expect(btns[0].classList.contains("active")).toBe(true);
      expect(btns[0].hasAttribute("data-active")).toBe(true);
      expect(btns[1].classList.contains("active")).toBe(false);
      expect(btns[1].hasAttribute("data-active")).toBe(false);
      expect(panels[0].classList.contains("active")).toBe(true);
      expect(panels[0].hasAttribute("data-active")).toBe(true);
      expect(panels[1].classList.contains("active")).toBe(false);
    });

    it("should not initialize wrapper when an active tab already exists", () => {
      const wrapper = createTabsWrapper("tabs", { activeIndex: 1 });

      document.body.appendChild(wrapper);
      register();

      const btns = wrapper.querySelectorAll<HTMLButtonElement>(".tabs-tab-button");

      // second tab was already active; initTabsWrapper should not change it
      expect(btns[0].classList.contains("active")).toBe(false);
      expect(btns[1].classList.contains("active")).toBe(true);
    });

    it("should not initialize wrapper when it has no buttons", () => {
      const wrapper = document.createElement("div");

      wrapper.className = "tabs-tabs-wrapper";
      document.body.appendChild(wrapper);
      register();
      // no error should be thrown
    });

    it("should be idempotent (calling register twice has no extra effect)", () => {
      const wrapper = createTabsWrapper();

      document.body.appendChild(wrapper);
      register();
      register(); // second call should be a no-op

      const btns = wrapper.querySelectorAll<HTMLButtonElement>(".tabs-tab-button");

      expect(btns[0].classList.contains("active")).toBe(true);
    });

    it("should support custom name", () => {
      const wrapper = createTabsWrapper("code-tabs");

      document.body.appendChild(wrapper);
      register({ name: "code-tabs" });

      const btns = wrapper.querySelectorAll<HTMLButtonElement>(".code-tabs-tab-button");

      expect(btns[0].classList.contains("active")).toBe(true);
    });

    describe("click handler", () => {
      beforeEach(() => {
        const wrapper = createTabsWrapper();

        document.body.appendChild(wrapper);
        register();
      });

      it("should activate clicked tab button", () => {
        const wrapper = document.querySelector<HTMLElement>(".tabs-tabs-wrapper")!;
        const btns = wrapper.querySelectorAll<HTMLButtonElement>(".tabs-tab-button");
        const panels = wrapper.querySelectorAll<HTMLElement>(".tabs-tab-content");

        btns[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));

        expect(btns[0].classList.contains("active")).toBe(false);
        expect(btns[0].hasAttribute("data-active")).toBe(false);
        expect(btns[1].classList.contains("active")).toBe(true);
        expect(btns[1].hasAttribute("data-active")).toBe(true);
        expect(panels[0].classList.contains("active")).toBe(false);
        expect(panels[0].hasAttribute("data-active")).toBe(false);
        expect(panels[1].classList.contains("active")).toBe(true);
        expect(panels[1].hasAttribute("data-active")).toBe(true);
      });

      it("should ignore clicks on non-tab-button elements", () => {
        const wrapper = document.querySelector<HTMLElement>(".tabs-tabs-wrapper")!;
        const btns = wrapper.querySelectorAll<HTMLButtonElement>(".tabs-tab-button");

        // first tab already active from init
        const div = document.createElement("div");

        wrapper.appendChild(div);
        div.dispatchEvent(new MouseEvent("click", { bubbles: true }));

        // state should remain unchanged
        expect(btns[0].classList.contains("active")).toBe(true);
      });

      it("should ignore clicks on tab buttons outside a wrapper", () => {
        const orphanBtn = document.createElement("button");

        orphanBtn.className = "tabs-tab-button";
        orphanBtn.dataset.tab = "0";
        document.body.appendChild(orphanBtn);

        // should not throw
        orphanBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      it("should skip activateTab when button has no data-tab", () => {
        const wrapper = document.querySelector<HTMLElement>(".tabs-tabs-wrapper")!;
        const btns = wrapper.querySelectorAll<HTMLButtonElement>(".tabs-tab-button");

        // create a button with no data-tab inside the wrapper
        const btn = document.createElement("button");

        btn.className = "tabs-tab-button";
        wrapper.appendChild(btn);

        // clicking it should not throw and not change active state
        btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));

        expect(btns[0].classList.contains("active")).toBe(true);
      });
    });

    describe("syncTabs", () => {
      it("should sync tabs with the same data-id across wrappers", () => {
        const wrapper1 = createTabsWrapper("tabs", { tabId: "lang" });
        const wrapper2 = createTabsWrapper("tabs", { tabId: "lang" });

        document.body.appendChild(wrapper1);
        document.body.appendChild(wrapper2);
        register();

        // click second button in wrapper1
        const btn1 = wrapper1.querySelectorAll<HTMLButtonElement>(".tabs-tab-button")[1];

        btn1.dispatchEvent(new MouseEvent("click", { bubbles: true }));

        // wrapper2 should also switch to second tab
        const btns2 = wrapper2.querySelectorAll<HTMLButtonElement>(".tabs-tab-button");

        expect(btns2[1].classList.contains("active")).toBe(true);
      });

      it("should not sync when tab button has no data-id", () => {
        const wrapper1 = createTabsWrapper();
        const wrapper2 = createTabsWrapper();

        document.body.appendChild(wrapper1);
        document.body.appendChild(wrapper2);
        register();

        // click second button in wrapper1 (no data-id)
        const btn1 = wrapper1.querySelectorAll<HTMLButtonElement>(".tabs-tab-button")[1];

        btn1.dispatchEvent(new MouseEvent("click", { bubbles: true }));

        // wrapper2 should remain on first tab (no sync)
        const btns2 = wrapper2.querySelectorAll<HTMLButtonElement>(".tabs-tab-button");

        expect(btns2[0].classList.contains("active")).toBe(true);
        expect(btns2[1].classList.contains("active")).toBe(false);
      });

      it("should not sync with buttons in the same wrapper", () => {
        const wrapper = createTabsWrapper("tabs", { tabId: "lang" });

        document.body.appendChild(wrapper);
        register();

        const btns = wrapper.querySelectorAll<HTMLButtonElement>(".tabs-tab-button");

        // clicking btn[1] should activate tab 1 but not cause issues with same-wrapper sync
        btns[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));

        expect(btns[1].classList.contains("active")).toBe(true);
      });
    });
  });

  describe("destroy", () => {
    it("should remove click handler", () => {
      const wrapper = createTabsWrapper();

      document.body.appendChild(wrapper);
      register();
      destroy();

      const btns = wrapper.querySelectorAll<HTMLButtonElement>(".tabs-tab-button");
      const initialActiveState = btns[1].classList.contains("active");

      btns[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));

      // clicking should have no effect after destroy
      expect(btns[1].classList.contains("active")).toBe(initialActiveState);
    });

    it("should be a no-op if not registered", () => {
      // should not throw
      destroy();
      destroy({ name: "custom" });
    });

    it("should support custom name", () => {
      const wrapper = createTabsWrapper("code-tabs");

      document.body.appendChild(wrapper);
      register({ name: "code-tabs" });
      destroy({ name: "code-tabs" });

      const btns = wrapper.querySelectorAll<HTMLButtonElement>(".code-tabs-tab-button");
      const initialActiveState = btns[1].classList.contains("active");

      btns[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));

      expect(btns[1].classList.contains("active")).toBe(initialActiveState);
    });
  });

  describe("refresh", () => {
    it("should re-initialize tab containers", () => {
      const wrapper = createTabsWrapper();

      document.body.appendChild(wrapper);
      register();

      // add a new wrapper after registration
      const wrapper2 = createTabsWrapper();

      document.body.appendChild(wrapper2);

      refresh();

      // new wrapper should now be initialized
      const btns2 = wrapper2.querySelectorAll<HTMLButtonElement>(".tabs-tab-button");

      expect(btns2[0].classList.contains("active")).toBe(true);
    });

    it("should re-enable click handling after refresh", () => {
      const wrapper = createTabsWrapper();

      document.body.appendChild(wrapper);
      register();
      refresh();

      const btns = wrapper.querySelectorAll<HTMLButtonElement>(".tabs-tab-button");

      btns[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));

      expect(btns[1].classList.contains("active")).toBe(true);
    });
  });
});
