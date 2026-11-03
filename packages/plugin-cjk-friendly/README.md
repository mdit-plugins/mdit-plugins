# @mdit/plugin-cjk-friendly

[![Version](https://img.shields.io/npm/v/@mdit/plugin-cjk-friendly.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-cjk-friendly.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-cjk-friendly?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-cjk-friendly)

CJK-friendly emphasis plugin for MarkdownIt.

## [Docs](https://mdit-plugins.github.io/cjk-friendly.html) | [文档](https://mdit-plugins.github.io/zh/cjk-friendly.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-cjk-friendly
# npm
npm i -D @mdit/plugin-cjk-friendly
# yarn
yarn add -D @mdit/plugin-cjk-friendly
```

## Comparison / 对比

Compared against the upstream [`markdown-it-cjk-friendly`](https://www.npmjs.com/package/markdown-it-cjk-friendly) package `3.0.0`.

- Correctness: **22/22** cases match the reference exactly.
- Throughput: **1.00×** the reference (geometric mean across 6 benchmark cases; above 1× means faster).
- Entry gzip: **797 B** versus **1.2 kB** for the reference (import cost).

See the full comparison report: [English](https://mdit-plugins.github.io/compare.html) · [中文](https://mdit-plugins.github.io/zh/compare.html).

## Acknowledgements / 鸣谢

Rewritten from [markdown-it-cjk-friendly](https://github.com/tats-u/markdown-cjk-friendly) by [Tatsunori Uchino](https://github.com/tats-u). It also derives from the `StateInline#scanDelims` implementation of [markdown-it](https://github.com/markdown-it/markdown-it) by [Vitaly Puzrin](https://github.com/puzrin) and [Alex Kocharin](https://github.com/rlidwka).
