# @mdit/plugin-cjk-breaks

[![Version](https://img.shields.io/npm/v/@mdit/plugin-cjk-breaks.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-cjk-breaks.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-cjk-breaks?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-cjk-breaks)

CJK line-break plugin for MarkdownIt.

## [Docs](https://mdit-plugins.github.io/cjk-breaks.html) | [文档](https://mdit-plugins.github.io/zh/cjk-breaks.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-cjk-breaks
# npm
npm i -D @mdit/plugin-cjk-breaks
# yarn
yarn add -D @mdit/plugin-cjk-breaks
```

## Comparison / 对比

Compared against the upstream [`markdown-it-cjk-breaks`](https://www.npmjs.com/package/markdown-it-cjk-breaks) package `2.0.1`.

- Correctness: **22/22** cases match the reference exactly.
- Throughput: **1.02×** the reference (geometric mean across 6 benchmark cases; above 1× means faster).
- Entry gzip: **673 B** versus **921 B** for the reference (import cost).

See the full comparison report: [English](https://mdit-plugins.github.io/compare.html) · [中文](https://mdit-plugins.github.io/zh/compare.html).

## Acknowledgements / 鸣谢

Rewritten from [markdown-it-cjk-breaks](https://github.com/markdown-it/markdown-it-cjk-breaks).
