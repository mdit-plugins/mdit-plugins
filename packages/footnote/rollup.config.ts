import { rollupTypescript } from "../../scripts/rollup.js";

export default rollupTypescript("index", {
  external: [
    "markdown-it/lib/token.mjs",
    "markdown-it/lib/helpers/parse_link_label.js",
  ],
});
