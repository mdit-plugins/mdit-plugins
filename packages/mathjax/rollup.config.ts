import { rollupTypescript } from "../../scripts/rollup.js";

export default rollupTypescript("index", {
  external: ["@mdit/plugin-tex", /^mathjax-full\//, "node:module", "upath"],
});
