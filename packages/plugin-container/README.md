# @mdit/plugin-container

[![Version](https://img.shields.io/npm/v/@mdit/plugin-container.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-container.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-container?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-container)

Container plugin for MarkdownIt.

## [Docs](https://mdit-plugins.github.io/container.html) | [文档](https://mdit-plugins.github.io/zh/container.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-container
# npm
npm i -D @mdit/plugin-container
# yarn
yarn add -D @mdit/plugin-container
```

## Comparison / 对比

Compared against the upstream [`markdown-it-container`](https://www.npmjs.com/package/markdown-it-container) package `4.0.0`.

- Correctness: **20/23** cases match the reference exactly (3 documented differences).
- Throughput: **1.03×** the reference (geometric mean across 6 benchmark cases; above 1× means faster).
- Package size: **37.0 kB** unpacked and **1.1 kB** gzip entry, versus **20.1 kB** and **1.4 kB** for the reference.

See the full comparison report: [English](https://mdit-plugins.github.io/compare.html) · [中文](https://mdit-plugins.github.io/zh/compare.html).
