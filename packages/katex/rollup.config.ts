import { rollupTypescript } from "../../scripts/rollup.js";

export default rollupTypescript("index", {
  external: ["@mdit/helper", "@mdit/plugin-tex", "katex", "node:module"],
});
