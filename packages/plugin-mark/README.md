# @mdit/plugin-mark

[![Version](https://img.shields.io/npm/v/@mdit/plugin-mark.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-mark.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-mark?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-mark)

Mark plugin for MarkdownIt.

## [Docs](https://mdit-plugins.github.io/mark.html) | [文档](https://mdit-plugins.github.io/zh/mark.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-mark
# npm
npm i -D @mdit/plugin-mark
# yarn
yarn add -D @mdit/plugin-mark
```

## Comparison / 对比

Compared against the upstream [`markdown-it-mark`](https://www.npmjs.com/package/markdown-it-mark) package `4.0.0`.

- Correctness: **23/23** cases match the reference exactly.
- Throughput: **1.00×** the reference (geometric mean across 6 benchmark cases; above 1× means faster).
- Package size: **18.6 kB** unpacked and **185 B** gzip entry, versus **15.7 kB** and **1.1 kB** for the reference.

See the full comparison report: [English](https://mdit-plugins.github.io/compare.html) · [中文](https://mdit-plugins.github.io/zh/compare.html).
