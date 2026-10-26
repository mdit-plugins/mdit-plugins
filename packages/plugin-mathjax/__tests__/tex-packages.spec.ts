import { describe, expect, it } from "vitest";

import { texPackages } from "../src/tex/packages.js";
import { loadTexPackages, resolveTexPackages } from "../src/tex/utils.js";

describe("default TeX packages", () => {
  it("excludes the font-extension packages", () => {
    expect(texPackages).not.toContain("bbm");
    expect(texPackages).not.toContain("bboldx");
    expect(texPackages).not.toContain("dsfont");
  });

  it("keeps the other built-in packages", () => {
    expect(texPackages).toContain("ams");
    expect(texPackages).toContain("boldsymbol");
    expect(texPackages).toContain("mhchem");
  });

  it("keeps explicit font-extension packages from user configuration", () => {
    expect(resolveTexPackages(["bbm", "ams"], false)).toStrictEqual(["base", "bbm", "ams"]);
  });

  it("can load the font-extension packages explicitly", async () => {
    // These packages are not in the default list, so load them explicitly to keep their loaders
    // covered and to verify the documented opt-in path works.
    await expect(loadTexPackages(["bbm", "bboldx", "dsfont"])).resolves.toBeUndefined();
  });
});
