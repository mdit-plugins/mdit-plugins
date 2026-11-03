# @mdit/plugin-abbr

[![Version](https://img.shields.io/npm/v/@mdit/plugin-abbr.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-abbr.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-abbr?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-abbr)

Abbreviation plugin for MarkdownIt.

## [Docs](https://mdit-plugins.github.io/abbr.html) | [文档](https://mdit-plugins.github.io/zh/abbr.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-abbr
# npm
npm i -D @mdit/plugin-abbr
# yarn
yarn add -D @mdit/plugin-abbr
```

## Comparison / 对比

Compared against the upstream [`markdown-it-abbr`](https://www.npmjs.com/package/markdown-it-abbr) package `2.0.0`.

- Correctness: **23/23** cases match the reference exactly.
- Throughput: **1.02×** the reference (geometric mean across 6 benchmark cases; above 1× means faster).
- Package size: **30.7 kB** unpacked and **979 B** gzip entry, versus **21.2 kB** and **1.6 kB** for the reference.

See the full comparison report: [English](https://mdit-plugins.github.io/compare.html) · [中文](https://mdit-plugins.github.io/zh/compare.html).

## Acknowledgements / 鸣谢

Rewritten from [markdown-it-abbr](https://github.com/markdown-it/markdown-it-abbr) by [Vitaly Puzrin](https://github.com/puzrin) and [Alex Kocharin](https://github.com/rlidwka).
