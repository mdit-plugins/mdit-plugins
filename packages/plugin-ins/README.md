# @mdit/plugin-ins

[![Version](https://img.shields.io/npm/v/@mdit/plugin-ins.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-ins.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-ins?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-ins)

Insert plugin for MarkdownIt.

## [Docs](https://mdit-plugins.github.io/ins.html) | [文档](https://mdit-plugins.github.io/zh/ins.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-ins
# npm
npm i -D @mdit/plugin-ins
# yarn
yarn add -D @mdit/plugin-ins
```

## Comparison / 对比

Compared against the upstream [`markdown-it-ins`](https://www.npmjs.com/package/markdown-it-ins) package `4.0.0`.

- Correctness: **23/23** cases match the reference exactly.
- Throughput: **1.01×** the reference (geometric mean across 6 benchmark cases; above 1× means faster).
- Package size: **18.6 kB** unpacked and **187 B** gzip entry, versus **15.6 kB** and **1.1 kB** for the reference.

See the comparison tables in the [English docs](https://mdit-plugins.github.io/ins.html) or [中文文档](https://mdit-plugins.github.io/zh/ins.html) for details and methodology.
