# @mdit/plugin-sub

[![Version](https://img.shields.io/npm/v/@mdit/plugin-sub.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-sub.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-sub?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-sub)

Subscript plugin for MarkdownIt.

## [Docs](https://mdit-plugins.github.io/sub.html) | [文档](https://mdit-plugins.github.io/zh/sub.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-sub
# npm
npm i -D @mdit/plugin-sub
# yarn
yarn add -D @mdit/plugin-sub
```

## Comparison / 对比

Compared against the upstream [`markdown-it-sub`](https://www.npmjs.com/package/markdown-it-sub) package `2.0.0`.

- Correctness: **24/24** cases match the reference exactly.
- Throughput: **1.00×** the reference (geometric mean across 6 benchmark cases; above 1× means faster).
- Package size: **18.3 kB** unpacked and **156 B** gzip entry, versus **9.6 kB** and **674 B** for the reference.

See the comparison tables in the [English docs](https://mdit-plugins.github.io/sub.html) or [中文文档](https://mdit-plugins.github.io/zh/sub.html) for details and methodology.
