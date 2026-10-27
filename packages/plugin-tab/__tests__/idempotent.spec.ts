// @vitest-environment happy-dom
import MarkdownIt from "markdown-it";
import type { MockInstance } from "vitest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { tab } from "../src/index.js";
import { destroy, register } from "../src/tab.js";
import type { TabOptions } from "../src/tab.js";

interface TabModule {
  destroy: typeof destroy;
  refresh: (options?: TabOptions) => void;
  register: typeof register;
}

const markdown = `\
::: tabs
@tab A
content A
@tab:active B
content B
:::
`;

const nestedMarkdown = `\
::: tabs
@tab A
content A
@tab B
  ::: tabs
  @tab C
  content C
  @tab D
  content D
  :::
:::
`;

const createTabsWrapper = (name = "tabs"): HTMLElement => {
  const wrapper = document.createElement("div");

  wrapper.className = `${name}-tabs-wrapper`;

  for (let i = 0; i < 2; i++) {
    const btn = document.createElement("button");

    btn.className = `${name}-tab-button`;
    btn.dataset.tab = String(i);
    wrapper.append(btn);

    const panel = document.createElement("div");

    panel.className = `${name}-tab-content`;
    panel.dataset.index = String(i);
    wrapper.append(panel);
  }

  return wrapper;
};

const countOccurrences = (html: string, needle: string): number => html.split(needle).length - 1;

const countCalls = (spy: MockInstance, eventType: string): number =>
  spy.mock.calls.filter(([type]) => type === eventType).length;

// module copies imported after `vi.resetModules()` (simulates ESM + UMD bundles)
const loadedModules: TabModule[] = [];

const loadFreshTabModule = async (): Promise<TabModule> => {
  vi.resetModules();

  const tabModule = await import("../src/tab.js");

  loadedModules.push(tabModule);

  return tabModule;
};

describe("tab idempotency", () => {
  // oxlint-disable-next-line vitest/no-hooks
  afterEach(() => {
    // clean up handlers registered by every module copy used in the test
    for (const { destroy: destroyCopy } of loadedModules) {
      destroyCopy();
      destroyCopy({ name: "code-tabs" });
    }
    loadedModules.length = 0;

    destroy();
    destroy({ name: "code-tabs" });
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  describe("plugin registration", () => {
    it("should not register duplicate rules when used twice", () => {
      const single = new MarkdownIt().use(tab);
      const double = new MarkdownIt().use(tab).use(tab);

      expect(double.block.ruler.getRules("")).toHaveLength(single.block.ruler.getRules("").length);
      expect(double.core.ruler.getRules("")).toHaveLength(single.core.ruler.getRules("").length);
    });

    it("should render the same output when used twice", () => {
      const single = new MarkdownIt().use(tab);
      const double = new MarkdownIt().use(tab).use(tab);

      expect(double.render(markdown)).toBe(single.render(markdown));
    });

    it("should keep tab markup balanced when used twice", () => {
      const md = new MarkdownIt().use(tab).use(tab);
      const result = md.render(markdown);

      expect(countOccurrences(result, '<div class="tabs-tabs-wrapper"')).toBe(1);
      expect(countOccurrences(result, '<div class="tabs-tabs-header">')).toBe(1);
      expect(countOccurrences(result, '<div class="tabs-tabs-container">')).toBe(1);
      expect(countOccurrences(result, '<div class="tabs-tab-content')).toBe(2);
      expect(countOccurrences(result, "<div")).toBe(countOccurrences(result, "</div>"));
    });

    it("should keep nested tab markup balanced when used twice", () => {
      const single = new MarkdownIt().use(tab);
      const double = new MarkdownIt().use(tab).use(tab);
      const result = double.render(nestedMarkdown);

      expect(result).toBe(single.render(nestedMarkdown));
      expect(countOccurrences(result, '<div class="tabs-tabs-wrapper"')).toBe(2);
      expect(countOccurrences(result, '<div class="tabs-tab-content')).toBe(4);
      expect(countOccurrences(result, "<div")).toBe(countOccurrences(result, "</div>"));
    });

    it("should allow a second configuration with a different name", () => {
      const md = new MarkdownIt().use(tab).use(tab, {
        name: "code-tabs",
        openRenderer: () => "<CodeTabs>",
        closeRenderer: () => "</CodeTabs>",
        tabOpenRenderer: () => "<CodeTab>",
        tabCloseRenderer: () => "</CodeTab>",
      });

      expect(md.render("::: code-tabs\n@tab A\ncontent\n:::\n")).toContain("<CodeTabs>");
      // the default configuration keeps working on the same instance
      expect(md.render(markdown)).toContain('<div class="tabs-tabs-wrapper">');
    });

    it("should allow the default configuration after a named one", () => {
      const md = new MarkdownIt().use(tab, { name: "code-tabs" }).use(tab);

      expect(md.render("::: code-tabs\n@tab A\ncontent\n:::\n")).toContain(
        '<div class="code-tabs-tabs-wrapper">',
      );
      expect(md.render(markdown)).toContain('<div class="tabs-tabs-wrapper">');
    });
  });

  describe("browser helper registration", () => {
    it("should add only one click listener when register is called twice", () => {
      const addSpy = vi.spyOn(document, "addEventListener");

      register();
      register();

      expect(countCalls(addSpy, "click")).toBe(1);
    });

    it("should share a single click listener across module copies", async () => {
      const addSpy = vi.spyOn(document, "addEventListener");
      const first = await loadFreshTabModule();
      const second = await loadFreshTabModule();

      expect(first).not.toBe(second);

      first.register();
      second.register();

      expect(countCalls(addSpy, "click")).toBe(1);
    });

    it("should let a module copy destroy the listener registered by another copy", async () => {
      const wrapper = createTabsWrapper();

      document.body.append(wrapper);

      const first = await loadFreshTabModule();
      const second = await loadFreshTabModule();

      first.register();
      second.destroy();

      const buttons = wrapper.querySelectorAll<HTMLButtonElement>(".tabs-tab-button");

      buttons[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));

      expect(buttons[0].classList.contains("active")).toBe(true);
      expect(buttons[1].classList.contains("active")).toBe(false);
    });

    it("should keep a single listener when refreshed from another module copy", async () => {
      const addSpy = vi.spyOn(document, "addEventListener");
      const removeSpy = vi.spyOn(document, "removeEventListener");
      const first = await loadFreshTabModule();
      const second = await loadFreshTabModule();

      first.register();

      const wrapper = createTabsWrapper();

      document.body.append(wrapper);

      second.refresh();

      expect(countCalls(addSpy, "click") - countCalls(removeSpy, "click")).toBe(1);
      expect(
        wrapper.querySelector<HTMLButtonElement>(".tabs-tab-button")!.classList.contains("active"),
      ).toBe(true);
    });
  });
});
