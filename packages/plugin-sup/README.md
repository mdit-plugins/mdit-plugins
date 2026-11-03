# @mdit/plugin-sup

[![Version](https://img.shields.io/npm/v/@mdit/plugin-sup.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-sup.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-sup?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-sup)

Superscript plugin for MarkdownIt.

## [Docs](https://mdit-plugins.github.io/sup.html) | [文档](https://mdit-plugins.github.io/zh/sup.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-sup
# npm
npm i -D @mdit/plugin-sup
# yarn
yarn add -D @mdit/plugin-sup
```

## Comparison / 对比

Compared against the upstream [`markdown-it-sup`](https://www.npmjs.com/package/markdown-it-sup) package `2.0.0`.

- Correctness: **24/24** cases match the reference exactly.
- Throughput: **0.98×** the reference (geometric mean across 6 benchmark cases; above 1× means faster).
- Entry gzip: **155 B** versus **674 B** for the reference (import cost).

See the full comparison report: [English](https://mdit-plugins.github.io/compare.html) · [中文](https://mdit-plugins.github.io/zh/compare.html).
