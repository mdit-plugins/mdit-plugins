import { linkInsideHeader } from "./linkInsideHeader.js";
import type { LinkInsideHeaderPermalinkOptions, PermalinkGenerator } from "./types.js";

export const ariaHidden = (opts?: LinkInsideHeaderPermalinkOptions): PermalinkGenerator =>
  linkInsideHeader({ ...opts, ariaHidden: true });
