import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  discoverPackages,
  formatReadmeDescription,
  getDocsSlug,
  renderReadme,
  stripDescriptionPeriod,
  syncAllReadmes,
} from "../syncReadme.js";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const packagesDir = path.join(repoRoot, "packages");
const packages = discoverPackages(packagesDir);

/**
 * Read the description line of a package README
 *
 * @param pkg Package metadata
 * @returns Description line
 */
const getReadmeDescription = (pkg: (typeof packages)[number]): string | undefined =>
  readFileSync(path.join(packagesDir, pkg.dirName, "README.md"), "utf8")
    .split("\n")
    .at(4);

/**
 * Find packages whose `package.json` description differs from the README description
 *
 * @returns Mismatched package names
 */
const findDescriptionMismatches = (): string[] =>
  packages
    .filter((pkg) => getReadmeDescription(pkg) !== formatReadmeDescription(pkg.description))
    .map((pkg) => pkg.name);

/**
 * Create a temporary packages directory with a single package fixture
 *
 * @param readme README content of the fixture
 * @returns Temporary packages directory
 */
const createTempPackage = (readme: string): string => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "mdit-readme-"));
  const pkgDir = path.join(tempDir, "plugin-demo");

  mkdirSync(path.join(pkgDir, "src"), { recursive: true });
  writeFileSync(path.join(pkgDir, "src", "index.ts"), "export {};\n");
  writeFileSync(
    path.join(pkgDir, "package.json"),
    `${JSON.stringify(
      {
        name: "@mdit/plugin-demo",
        description: "demo plugin for MarkdownIt",
        homepage: "https://mdit-plugins.github.io/demo.html",
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(path.join(pkgDir, "README.md"), readme);

  return tempDir;
};

describe("scripts/syncReadme.ts", () => {
  it("should discover all packages", () => {
    expect(packages).toHaveLength(39);
    expect(packages.map((pkg) => pkg.dirName)).toContain("helper");
    expect(packages.map((pkg) => pkg.dirName)).toContain("plugin-layout");
  });

  it("should derive docs slugs from homepages with a directory fallback", () => {
    expect(
      getDocsSlug({
        dirName: "plugin-attrs",
        homepage: "https://mdit-plugins.github.io/attrs.html",
      }),
    ).toBe("attrs");
    expect(
      getDocsSlug({
        dirName: "plugin-emoji",
        homepage: "https://github.com/mdit-plugins/mdit-plugins",
      }),
    ).toBe("emoji");
    expect(
      getDocsSlug({
        dirName: "plugin-without-homepage",
        homepage: undefined,
      }),
    ).toBe("without-homepage");
    expect(
      getDocsSlug({ dirName: "helper", homepage: "https://mdit-plugins.github.io/" }),
    ).toBeNull();
  });

  it("should normalize the description punctuation", () => {
    expect(formatReadmeDescription("Attrs plugin for MarkdownIt")).toBe(
      "Attrs plugin for MarkdownIt.",
    );
    expect(formatReadmeDescription("Attrs plugin for MarkdownIt.")).toBe(
      "Attrs plugin for MarkdownIt.",
    );
    expect(stripDescriptionPeriod("  Attrs plugin for MarkdownIt.  ")).toBe(
      "Attrs plugin for MarkdownIt",
    );
  });

  it("should render the shared README template", () => {
    expect(
      renderReadme({
        dirName: "plugin-attrs",
        name: "@mdit/plugin-attrs",
        description: "Attrs plugin for MarkdownIt",
        homepage: "https://mdit-plugins.github.io/attrs.html",
      }),
    ).toBe(`# @mdit/plugin-attrs

[![Version](https://img.shields.io/npm/v/@mdit/plugin-attrs.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-attrs.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-attrs?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-attrs)

Attrs plugin for MarkdownIt.

## [Docs](https://mdit-plugins.github.io/attrs.html) | [文档](https://mdit-plugins.github.io/zh/attrs.html)

## Install / 安装

\`\`\`bash
# pnpm
pnpm add -D @mdit/plugin-attrs
# npm
npm i -D @mdit/plugin-attrs
# yarn
yarn add -D @mdit/plugin-attrs
\`\`\`
`);
  });

  it("should not render a docs section for the helper package", () => {
    const helper = packages.find((pkg) => pkg.dirName === "helper");

    expect(helper).toBeDefined();
    expect(renderReadme(helper!)).not.toContain("## [Docs]");
  });

  it("should keep package descriptions in sync with their READMEs", () => {
    expect(findDescriptionMismatches()).toStrictEqual([]);
  });

  it("should keep every README identical to the generated content", () => {
    const { checked, outdated } = syncAllReadmes({ check: true, directory: packagesDir });

    expect(checked).toBe(packages.length);
    expect(outdated).toStrictEqual([]);
  });

  it("should write outdated READMEs and detect them in check mode", () => {
    const tempDir = createTempPackage("# outdated\n");

    const written = syncAllReadmes({ directory: tempDir });
    expect(written.outdated).toHaveLength(1);
    expect(readFileSync(path.join(tempDir, "plugin-demo", "README.md"), "utf8")).toContain(
      "# @mdit/plugin-demo",
    );
    expect(syncAllReadmes({ check: true, directory: tempDir }).outdated).toStrictEqual([]);

    writeFileSync(path.join(tempDir, "plugin-demo", "README.md"), "# outdated\n");
    expect(syncAllReadmes({ check: true, directory: tempDir }).outdated).toHaveLength(1);

    rmSync(tempDir, { force: true, recursive: true });
  });
});
