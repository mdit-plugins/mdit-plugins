import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { version } from "../lerna.json";

const packagesDir = resolve(process.cwd(), "packages");

const files = readdirSync(packagesDir);

files.forEach((pkgName) => {
  if (pkgName.startsWith(".")) return;

  const desc = `${pkgName} plugin for MarkdownIt`;
  const pkgPath = join(packagesDir, pkgName, "package.json");

  // generate package.json
  if (!existsSync(pkgPath)) {
    const pkgJSON = {
      name: `@mdit/plugin-${pkgName}`,
      version,
      description: desc,
      keywords: ["markdown-it", "markdown-it-plugin", pkgName],
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
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ".": {
          type: "./lib/index.ts",
          default: "./lib/index.js",
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "./package.json": "./package.json",
      },
      main: "lib/index.js",
      types: "lib/index.d.ts",
      files: ["lib"],
      scripts: {
        build: "rollup -c rollup.config.ts --configPlugin esbuild",
        clean: "rimraf ./lib",
      },
      dependencies: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "@types/markdown-it": "^14.1.1",
      },
      peerDependencies: {
        "markdown-it": "^14.1.0",
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

  const readmePath = join(packagesDir, pkgName, "README.md");

  // generate README.md
  if (!existsSync(readmePath))
    writeFileSync(
      readmePath,
      `\
# @mdit/plugin-${pkgName}

[![Version](https://img.shields.io/npm/v/@mdit/plugin-${pkgName}.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-${pkgName}.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-${pkgName}?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-${pkgName})

${desc}.

## Install / 安装

\`\`\`bash
# pnpm
pnpm add -D @mdit/plugin-${pkgName}
# npm
npm i -D @mdit/plugin-${pkgName}
# yarn
yarn add -D @mdit/plugin-${pkgName}
\`\`\`
`,
    );
});
