import { rollupTypescript } from "../../scripts/rollup.js";

export default rollupTypescript(
  {
    files: ["index", "chtml", "svg", "a11y"],
  },
  { resolve: true },
);
