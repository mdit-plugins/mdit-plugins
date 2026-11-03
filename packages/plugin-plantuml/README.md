# @mdit/plugin-plantuml

[![Version](https://img.shields.io/npm/v/@mdit/plugin-plantuml.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-plantuml.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-plantuml?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-plantuml)

plantuml plugin for MarkdownIt.

## [Docs](https://mdit-plugins.github.io/plantuml.html) | [文档](https://mdit-plugins.github.io/zh/plantuml.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-plantuml
# npm
npm i -D @mdit/plugin-plantuml
# yarn
yarn add -D @mdit/plugin-plantuml
```

## Comparison / 对比

Compared against the upstream [`markdown-it-plantuml`](https://www.npmjs.com/package/markdown-it-plantuml) package `1.4.1`.

- Correctness: **6/24** cases match the reference exactly (10 matching after normalization, 1 reference errors, 1 differences).
- Throughput: **6.96×** the reference (geometric mean across 6 benchmark cases; above 1× means faster).
- Entry gzip: **749 B** versus **1.5 kB** for the reference (import cost).

See the full comparison report: [English](https://mdit-plugins.github.io/compare.html) · [中文](https://mdit-plugins.github.io/zh/compare.html).
