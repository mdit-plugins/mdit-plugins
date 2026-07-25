import { existsSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import config from "../lerna.json" with { type: "json" };

const { version } = config;
const packagesDir = path.resolve(process.cwd(), "packages");

const files = readdirSync(packagesDir);

files.forEach((pkgName) => {
  if (pkgName.startsWith(".")) return;

  // plugin-xxx directories -> @mdit/plugin-xxx, helper -> @mdit/helper
  const isHelper = pkgName === "helper";
  const shortName = isHelper ? pkgName : pkgName.replace(/^plugin-/, "");
  const packageName = isHelper ? "@mdit/helper" : `@mdit/plugin-${shortName}`;
  const desc = `${shortName} plugin for MarkdownIt`;
  const pkgPath = path.join(packagesDir, pkgName, "package.json");

  // generate package.json
  if (!existsSync(pkgPath)) {
    const pkgJSON = {
      name: packageName,
      version,
      description: desc,
      keywords: ["markdown-it", "markdown-it-plugin", shortName],
      homepage: `https://github.com/mdit-plugins/mdit-plugins/packages/${pkgName}#readme`,
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
          type: "./lib/index.d.ts",
          default: "./lib/index.js",
        },
        "./package.json": "./package.json",
      },
      main: "lib/index.js",
      types: "lib/index.d.ts",
      files: ["lib"],
      scripts: {
        build: "tsdown --config-loader unrun",
        clean: "rimraf ./lib",
      },
      dependencies: {
        "@types/markdown-it": "^14.1.1",
      },
      peerDependencies: {
        "markdown-it": "^14.2.0",
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
  }

  const readmePath = path.join(packagesDir, pkgName, "README.md");

  // generate README.md
  if (!existsSync(readmePath)) {
    writeFileSync(
      readmePath,
      `\
# ${packageName}

[![Version](https://img.shields.io/npm/v/${packageName}.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/${packageName}.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/${packageName}?style=flat-square&logo=npm)](https://www.npmjs.com/package/${packageName})

${desc}.

## Install / 安装

\`\`\`bash
# pnpm
pnpm add -D ${packageName}
# npm
npm i -D ${packageName}
# yarn
yarn add -D ${packageName}
\`\`\`
`,
    );
  }
});
