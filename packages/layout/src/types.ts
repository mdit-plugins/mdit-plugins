import type StateBlock from "markdown-it/lib/rules_block/state_block.mjs";

// Layout type constants
export const LAYOUT_FLEX = 1;
export const LAYOUT_GRID = 2;
export const LAYOUT_COLUMN = 3;

// Character codes
export const AT = 64; /* @ */
export const DOT = 46; /* . */
export const HASH = 35; /* # */
export const SPACE = 32; /*   */
export const DASH = 45; /* - */

// Directive strings
export const FLEX = "flex";
export const GRID = "grid";
export const COLUMN = "column";
export const END = "end";

// Base display styles for containers
export const CONTAINER_DISPLAY: Record<number, string> = {
  [LAYOUT_FLEX]: "display:flex",
  [LAYOUT_GRID]: "display:grid",
};

export interface LayoutMeta {
  type: number;
  classes: string[];
  id: string;
  utilities: string[];
}

export interface LayoutEnv extends Record<string, unknown> {
  layoutType: number;
  layoutLevel: number;
}

export interface LayoutStateBlock extends StateBlock {
  env: LayoutEnv;
}
