# @mdit/plugin-img-size

[![Version](https://img.shields.io/npm/v/@mdit/plugin-img-size.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-img-size.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-img-size?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-img-size)

Image size plugin for MarkdownIt.

## [Docs](https://mdit-plugins.github.io/img-size.html) | [文档](https://mdit-plugins.github.io/zh/img-size.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-img-size
# npm
npm i -D @mdit/plugin-img-size
# yarn
yarn add -D @mdit/plugin-img-size
```

## Comparison / 对比

Compared against the upstream [`markdown-it-imsize`](https://www.npmjs.com/package/markdown-it-imsize) package `2.0.1`.

- Correctness: **6/25** cases match the reference exactly (19 documented differences).
- Throughput: **0.97×** the reference (geometric mean across 6 benchmark cases; above 1× means faster).
- Package size: **88.0 kB** unpacked and **1.8 kB** gzip entry, versus **638.1 kB** and **1.6 kB** for the reference.

See the full comparison report: [English](https://mdit-plugins.github.io/compare.html) · [中文](https://mdit-plugins.github.io/zh/compare.html).
