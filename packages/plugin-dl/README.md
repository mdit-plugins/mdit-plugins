# @mdit/plugin-dl

[![Version](https://img.shields.io/npm/v/@mdit/plugin-dl.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-dl.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-dl?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-dl)

Definition list plugin for MarkdownIt.

## [Docs](https://mdit-plugins.github.io/dl.html) | [文档](https://mdit-plugins.github.io/zh/dl.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-dl
# npm
npm i -D @mdit/plugin-dl
# yarn
yarn add -D @mdit/plugin-dl
```

## Comparison / 对比

Compared against the upstream [`markdown-it-deflist`](https://www.npmjs.com/package/markdown-it-deflist) package `4.0.0`.

- Correctness: **22/22** cases match the reference exactly.
- Throughput: **1.00×** the reference (geometric mean across 6 benchmark cases; above 1× means faster).
- Package size: **30.5 kB** unpacked and **978 B** gzip entry, versus **26.7 kB** and **1.9 kB** for the reference.

See the comparison tables in the [English docs](https://mdit-plugins.github.io/dl.html) or [中文文档](https://mdit-plugins.github.io/zh/dl.html) for details and methodology.
