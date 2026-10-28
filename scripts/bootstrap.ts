import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
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

/**
 * Convert a kebab-case plugin name to PascalCase for the UMD global name
 *
 * @param value - Kebab-case name / kebab-case 名称
 * @returns PascalCase name / PascalCase 名称
 */
const toPascalCase = (value: string): string =>
  value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

/** Repository root LICENSE, copied into every bootstrapped package / 仓库根目录 LICENSE，复制到每个新包 */
const licenseContent = readFileSync(path.resolve(import.meta.dirname, "..", "LICENSE"), "utf8");

/**
 * Render the shared tsdown config for a bootstrapped package
 *
 * @param isHelper - Whether the package is the helper package (ESM only) / 是否为 helper 包（仅 ESM）
 * @param globalName - UMD global name / UMD 全局变量名
 * @returns Tsdown config file content / tsdown 配置文件内容
 */
const renderTsdownConfig = (isHelper: boolean, globalName: string): string =>
  isHelper
    ? `import type { UserConfig } from "tsdown";

import { tsdownConfig } from "../../scripts/tsdown.ts";

const config: UserConfig = tsdownConfig("index");

export default config;
`
    : `import type { UserConfig } from "tsdown";

import { tsdownConfig } from "../../scripts/tsdown.ts";

const config: UserConfig[] = [
  tsdownConfig("index"),
  tsdownConfig("index", {
    globalName: "${globalName}",
    globals: {
      "markdown-it": "markdownit",
    },
  }),
];

export default config;
`;

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
    files: ["dist"],
    type: "module",
    sideEffects: false,
    ...(isHelper
      ? {}
      : {
          unpkg: "./dist/cdn.umd.js",
          jsdelivr: "./dist/cdn.umd.js",
        }),
    exports: {
      ".": {
        types: "./dist/index.d.ts",
        default: "./dist/index.js",
      },
      "./package.json": "./package.json",
    },
    publishConfig: {
      access: "public",
    },
    scripts: {
      build: "tsdown",
      clean: "rimraf ./dist",
    },
    ...(isHelper
      ? {}
      : {
          dependencies: {
            "@mdit/helper": "workspace:^",
          },
        }),
    peerDependencies: {
      "markdown-it": "catalog:",
    },
    peerDependenciesMeta: {
      "markdown-it": {
        optional: true,
      },
    },
    engines: {
      node: ">=22",
    },
  };

  writeFileSync(pkgPath, `${JSON.stringify(pkgJSON, null, 2)}\n`);

  // generate LICENSE by copying the repository root license
  writeFileSync(path.join(packagesDir, pkgName, "LICENSE"), licenseContent);

  // generate tsdown.config.ts
  writeFileSync(
    path.join(packagesDir, pkgName, "tsdown.config.ts"),
    renderTsdownConfig(isHelper, `mdItPlugin${toPascalCase(shortName)}`),
  );

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
