# @mdit/plugin-tasklist

[![Version](https://img.shields.io/npm/v/@mdit/plugin-tasklist.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-tasklist.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-tasklist?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-tasklist)

Tasklist plugin for MarkdownIt.

## [Docs](https://mdit-plugins.github.io/tasklist.html) | [文档](https://mdit-plugins.github.io/zh/tasklist.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-tasklist
# npm
npm i -D @mdit/plugin-tasklist
# yarn
yarn add -D @mdit/plugin-tasklist
```

## Comparison / 对比

Compared against the upstream [`markdown-it-task-checkbox`](https://www.npmjs.com/package/markdown-it-task-checkbox) package `1.0.6`.

- Correctness: **7/21** cases match the reference exactly (13 matching after normalization, 1 documented differences).
- Throughput: **1.01×** the reference (geometric mean across 6 benchmark cases; above 1× means faster).
- Package size: **26.9 kB** unpacked and **784 B** gzip entry, versus **76.9 kB** and **1.4 kB** for the reference.

See the comparison tables in the [English docs](https://mdit-plugins.github.io/tasklist.html) or [中文文档](https://mdit-plugins.github.io/zh/tasklist.html) for details and methodology.
