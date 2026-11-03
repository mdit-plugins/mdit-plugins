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

- Correctness: **7/21** cases match the reference exactly (14 documented differences).
- Throughput: **1.07×** the reference (geometric mean across 6 benchmark cases; above 1× means faster).
- Package size: **27.3 kB** unpacked and **731 B** gzip entry, versus **76.9 kB** and **1.4 kB** for the reference.

See the full comparison report: [English](https://mdit-plugins.github.io/compare.html) · [中文](https://mdit-plugins.github.io/zh/compare.html).
