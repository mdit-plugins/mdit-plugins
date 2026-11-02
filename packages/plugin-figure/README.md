# @mdit/plugin-figure

[![Version](https://img.shields.io/npm/v/@mdit/plugin-figure.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-figure.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-figure?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-figure)

Figure plugin for MarkdownIt.

## [Docs](https://mdit-plugins.github.io/figure.html) | [文档](https://mdit-plugins.github.io/zh/figure.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-figure
# npm
npm i -D @mdit/plugin-figure
# yarn
yarn add -D @mdit/plugin-figure
```

## Comparison / 对比

Compared against the upstream [`markdown-it-image-figures`](https://www.npmjs.com/package/markdown-it-image-figures) package `2.1.1`.

- Correctness: **18/21** cases match the reference exactly (3 documented differences).
- Throughput: **1.00×** the reference (geometric mean across 6 benchmark cases; above 1× means faster).
- Package size: **38.4 kB** unpacked and **1.1 kB** gzip entry, versus **22.7 kB** and **972 B** for the reference.

See the comparison tables in the [English docs](https://mdit-plugins.github.io/figure.html) or [中文文档](https://mdit-plugins.github.io/zh/figure.html) for details and methodology.
