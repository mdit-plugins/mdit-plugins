import type { TexPackage } from "../mathjax.js";
import { texLoaders } from "./loader.js";
import { defaultTexPackages, texPackages } from "./packages.js";

export const loadTexPackages = async (
  packages: TexPackage[] = defaultTexPackages,
): Promise<void> => {
  await import("@mathjax/src/js/input/tex/base/BaseConfiguration.js");

  await Promise.all(
    packages
      .filter((pkg) => texPackages.includes(pkg))
      .map((pkg) => texLoaders[pkg]()),
  );
};
