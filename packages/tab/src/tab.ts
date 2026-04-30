const handlers = new Map<string, (event: MouseEvent) => void>();

const ACTIVE_CLASS = "active";
const DATA_ACTIVE = "data-active";

const activateTab = (btn: HTMLButtonElement, wrapper: HTMLElement, name: string): void => {
  const dataTab = btn.dataset.tab;

  if (!dataTab) return;

  wrapper.querySelectorAll<HTMLButtonElement>(`.${name}-tab-button`).forEach((b) => {
    const isActive = b.dataset.tab === dataTab;

    b.classList.toggle(ACTIVE_CLASS, isActive);

    if (isActive) b.setAttribute(DATA_ACTIVE, "");
    else b.removeAttribute(DATA_ACTIVE);
  });

  wrapper.querySelectorAll<HTMLElement>(`.${name}-tab-content`).forEach((panel) => {
    const isActive = panel.dataset.index === dataTab;

    panel.classList.toggle(ACTIVE_CLASS, isActive);

    if (isActive) panel.setAttribute(DATA_ACTIVE, "");
    else panel.removeAttribute(DATA_ACTIVE);
  });
};

const syncTabs = (btn: HTMLButtonElement, name: string, sourceWrapper: HTMLElement): void => {
  const tabId = btn.dataset.id;

  if (!tabId) return;

  document
    .querySelectorAll<HTMLButtonElement>(`.${name}-tab-button[data-id="${tabId}"]`)
    .forEach((syncBtn) => {
      if (syncBtn === btn) return;

      const syncWrapper = syncBtn.closest<HTMLElement>(`.${name}-tabs-wrapper`);

      if (!syncWrapper || syncWrapper === sourceWrapper) return;

      activateTab(syncBtn, syncWrapper, name);
    });
};

const initTabsWrapper = (wrapper: HTMLElement, name: string): void => {
  const hasActive = wrapper.querySelector(`.${name}-tab-button.${ACTIVE_CLASS}`) != null;

  if (!hasActive) {
    const firstBtn = wrapper.querySelector<HTMLButtonElement>(`.${name}-tab-button`);

    if (firstBtn) activateTab(firstBtn, wrapper, name);
  }
};

/**
 * Options for tab event registration
 *
 * Tab 事件注册选项
 */
export interface TabOptions {
  /**
   * The name of the tab container, must match the `name` option used in the plugin
   *
   * Tab 容器的名称，必须与插件中使用的 `name` 选项一致
   *
   * @default "tabs"
   */
  name?: string;
}

/**
 * Register tab click event handlers and initialize existing tab containers
 *
 * 注册 Tab 点击事件处理器并初始化现有 Tab 容器
 *
 * @param options - Options / 选项
 */
export const register = ({ name = "tabs" }: TabOptions = {}): void => {
  if (handlers.has(name)) return;

  document.querySelectorAll<HTMLElement>(`.${name}-tabs-wrapper`).forEach((wrapper) => {
    initTabsWrapper(wrapper, name);
  });

  const handler = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;

    if (!target.classList.contains(`${name}-tab-button`)) return;

    const wrapper = target.closest<HTMLElement>(`.${name}-tabs-wrapper`);

    if (!wrapper) return;

    activateTab(target as HTMLButtonElement, wrapper, name);
    syncTabs(target as HTMLButtonElement, name, wrapper);
  };

  document.addEventListener("click", handler);
  handlers.set(name, handler);
};

/**
 * Destroy tab event handlers
 *
 * 销毁 Tab 事件处理器
 *
 * @param options - Options / 选项
 */
export const destroy = ({ name = "tabs" }: TabOptions = {}): void => {
  const handler = handlers.get(name);

  if (handler) {
    document.removeEventListener("click", handler);
    handlers.delete(name);
  }
};

/**
 * Refresh tab event handlers and re-initialize all tab containers (e.g., after dynamic DOM updates)
 *
 * 刷新 Tab 事件处理器并重新初始化所有 Tab 容器（例如，动态 DOM 更新后）
 *
 * @param options - Options / 选项
 */
export const refresh = (options: TabOptions = {}): void => {
  destroy(options);
  register(options);
};
