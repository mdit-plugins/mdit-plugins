import { rollupTypescript } from "../../scripts/rollup.js";

export default rollupTypescript("index", {
  external: ["@mdit/plugin-tex", "katex", "node:module"],
});
