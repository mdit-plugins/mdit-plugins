# @mdit/plugin-uml

[![Version](https://img.shields.io/npm/v/@mdit/plugin-uml.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-uml.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-uml?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-uml)

uml plugin for MarkdownIt.

## [Docs](https://mdit-plugins.github.io/uml.html) | [文档](https://mdit-plugins.github.io/zh/uml.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-uml
# npm
npm i -D @mdit/plugin-uml
# yarn
yarn add -D @mdit/plugin-uml
```

## Comparison / 对比

Compared against the upstream [`markdown-it-plantuml`](https://www.npmjs.com/package/markdown-it-plantuml) package `1.4.1`.

- Correctness: **15/25** cases match the reference exactly (10 documented differences).
- Throughput: **6.83×** the reference (geometric mean across 6 benchmark cases; above 1× means faster).
- Package size: **24.4 kB** unpacked and **665 B** gzip entry, versus **64.1 kB** and **1.5 kB** for the reference.

See the full comparison report: [English](https://mdit-plugins.github.io/compare.html) · [中文](https://mdit-plugins.github.io/zh/compare.html).
