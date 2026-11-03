# @mdit/plugin-mathjax

[![Version](https://img.shields.io/npm/v/@mdit/plugin-mathjax.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-mathjax.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-mathjax?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-mathjax)

mathjax plugin for MarkdownIt.

## [Docs](https://mdit-plugins.github.io/mathjax.html) | [文档](https://mdit-plugins.github.io/zh/mathjax.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-mathjax
# npm
npm i -D @mdit/plugin-mathjax
# yarn
yarn add -D @mdit/plugin-mathjax
```

## Comparison / 对比

Compared against the upstream [`markdown-it-mathjax3`](https://www.npmjs.com/package/markdown-it-mathjax3) package `5.2.0`.

- Correctness: **8/25** cases match the reference exactly (11 matching after normalization, 6 documented differences).
- Throughput: **1.14×** the reference (geometric mean across 6 benchmark cases; above 1× means faster).
- Package size: **117.3 kB** unpacked and **1.7 kB** gzip entry, versus **14.6 kB** and **1.7 kB** for the reference.

See the full comparison report: [English](https://mdit-plugins.github.io/compare.html) · [中文](https://mdit-plugins.github.io/zh/compare.html).
