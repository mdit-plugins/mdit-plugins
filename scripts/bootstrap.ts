import { existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

import { renderReadme } from "./syncReadme.ts";

const INITIAL_VERSION = "0.0.0";
const packagesDir = path.resolve(process.cwd(), "packages");

/**
 * Check whether a packages subdirectory is a new plugin package to bootstrap
 *
 * Only directories containing `src/index.ts` and no `package.json` are bootstrapped, so leftover or
 * unrelated directories never generate a duplicate package.
 *
 * @param pkgName Directory name under `packages/`
 * @returns Whether the package needs bootstrapping
 */
const shouldBootstrap = (pkgName: string): boolean => {
  if (pkgName.startsWith(".")) return false;

  const pkgDir = path.join(packagesDir, pkgName);

  try {
    if (!statSync(pkgDir).isDirectory()) return false;
  } catch {
    return false;
  }

  return (
    existsSync(path.join(pkgDir, "src", "index.ts")) &&
    !existsSync(path.join(pkgDir, "package.json"))
  );
};

readdirSync(packagesDir).forEach((pkgName) => {
  if (!shouldBootstrap(pkgName)) return;

  // plugin-xxx directories -> @mdit/plugin-xxx, helper -> @mdit/helper
  const isHelper = pkgName === "helper";
  const shortName = isHelper ? pkgName : pkgName.replace(/^plugin-/, "");
  const packageName = isHelper ? "@mdit/helper" : `@mdit/plugin-${shortName}`;
  const desc = `${shortName} plugin for MarkdownIt`;
  const homepage = `https://github.com/mdit-plugins/mdit-plugins/packages/${pkgName}#readme`;
  const pkgPath = path.join(packagesDir, pkgName, "package.json");

  // generate package.json
  const pkgJSON = {
    name: packageName,
    version: INITIAL_VERSION,
    description: desc,
    keywords: ["markdown-it", "markdown-it-plugin", shortName],
    homepage,
    bugs: {
      url: "https://github.com/mdit-plugins/mdit-plugins/issues",
    },
    repository: {
      type: "git",
      url: "git+https://github.com/mdit-plugins/mdit-plugins.git",
      directory: `packages/${pkgName}`,
    },
    license: "MIT",
    author: {
      name: "Mr.Hope",
      email: "mister-hope@outlook.com",
      url: "https://mister-hope.com",
    },
    type: "module",
    exports: {
      ".": {
        types: "./dist/index.d.ts",
        default: "./dist/index.js",
      },
      "./package.json": "./package.json",
    },
    main: "dist/index.js",
    types: "dist/index.d.ts",
    files: ["dist"],
    scripts: {
      build: "tsdown",
      clean: "rimraf ./dist",
    },
    peerDependencies: {
      "markdown-it": "catalog:",
    },
    peerDependenciesMeta: {
      "markdown-it": {
        optional: true,
      },
    },
    publishConfig: {
      access: "public",
    },
  };

  writeFileSync(pkgPath, `${JSON.stringify(pkgJSON, null, 2)}\n`);

  const readmePath = path.join(packagesDir, pkgName, "README.md");

  // generate README.md
  writeFileSync(
    readmePath,
    renderReadme({
      dirName: pkgName,
      name: packageName,
      description: desc,
      homepage,
    }),
  );
});
