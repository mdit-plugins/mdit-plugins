# @mdit/plugin-footnote

[![Version](https://img.shields.io/npm/v/@mdit/plugin-footnote.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-footnote.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-footnote?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-footnote)

Footnote plugin for MarkdownIt.

## [Docs](https://mdit-plugins.github.io/footnote.html) | [文档](https://mdit-plugins.github.io/zh/footnote.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-footnote
# npm
npm i -D @mdit/plugin-footnote
# yarn
yarn add -D @mdit/plugin-footnote
```

## Comparison / 对比

Compared against the upstream [`markdown-it-footnote`](https://www.npmjs.com/package/markdown-it-footnote) package `4.0.0`.

- Correctness: **6/22** cases match the reference exactly (16 matching after normalization).
- Throughput: **0.72×** the reference (geometric mean across 6 benchmark cases; above 1× means faster).
- Entry gzip: **2.1 kB** versus **2.7 kB** for the reference (import cost).

See the full comparison report: [English](https://mdit-plugins.github.io/compare.html) · [中文](https://mdit-plugins.github.io/zh/compare.html).
