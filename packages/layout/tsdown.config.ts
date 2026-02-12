import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  tsdownConfig(["index", "slim"]),
  tsdownConfig("index", { type: "cdn" }),
  tsdownConfig("slim", { type: "cdn" }),
];
