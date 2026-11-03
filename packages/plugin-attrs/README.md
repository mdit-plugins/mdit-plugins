# @mdit/plugin-attrs

[![Version](https://img.shields.io/npm/v/@mdit/plugin-attrs.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-attrs.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-attrs?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-attrs)

Attrs plugin for MarkdownIt.

## [Docs](https://mdit-plugins.github.io/attrs.html) | [文档](https://mdit-plugins.github.io/zh/attrs.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-attrs
# npm
npm i -D @mdit/plugin-attrs
# yarn
yarn add -D @mdit/plugin-attrs
```

## Comparison / 对比

Compared against the upstream [`markdown-it-attrs`](https://www.npmjs.com/package/markdown-it-attrs) package `5.0.1`.

- Correctness: **19/20** cases match the reference exactly (1 differences).
- Throughput: **1.03×** the reference (geometric mean across 6 benchmark cases; above 1× means faster).
- Entry gzip: **4.6 kB** versus **2.6 kB** for the reference (import cost).

See the full comparison report: [English](https://mdit-plugins.github.io/compare.html) · [中文](https://mdit-plugins.github.io/zh/compare.html).
