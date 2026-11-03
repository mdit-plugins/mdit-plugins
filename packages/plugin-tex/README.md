# @mdit/plugin-tex

[![Version](https://img.shields.io/npm/v/@mdit/plugin-tex.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-tex.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-tex?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-tex)

Tex plugin for MarkdownIt.

## [Docs](https://mdit-plugins.github.io/tex.html) | [文档](https://mdit-plugins.github.io/zh/tex.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-tex
# npm
npm i -D @mdit/plugin-tex
# yarn
yarn add -D @mdit/plugin-tex
```

## Comparison / 对比

Compared against the upstream [`markdown-it-katex`](https://www.npmjs.com/package/markdown-it-katex) package `2.0.3`.

- Correctness: **18/25** cases match the reference exactly (4 reference errors, 1 differences).
- Throughput: **1.01×** the reference (geometric mean across 6 benchmark cases; above 1× means faster).
- Package size: **68.1 kB** unpacked and **1.7 kB** gzip entry, versus **29.9 kB** and **2.0 kB** for the reference.

See the full comparison report: [English](https://mdit-plugins.github.io/compare.html) · [中文](https://mdit-plugins.github.io/zh/compare.html).
