import { rollupTypescript } from "../../scripts/rollup.js";

export default rollupTypescript("index", {
  external: ["markdown-it/lib/token.mjs"],
});
