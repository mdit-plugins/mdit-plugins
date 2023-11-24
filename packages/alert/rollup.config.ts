import { rollupTypescript } from "../../scripts/rollup.js";

export default rollupTypescript("index", {
  external: ["markdown-it/lib/common/utils.js"],
});
