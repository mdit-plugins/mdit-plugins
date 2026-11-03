# @mdit/plugin-alert

[![Version](https://img.shields.io/npm/v/@mdit/plugin-alert.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-alert.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-alert?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-alert)

GFM Markdown alert plugin for MarkdownIt.

## [Docs](https://mdit-plugins.github.io/alert.html) | [文档](https://mdit-plugins.github.io/zh/alert.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-alert
# npm
npm i -D @mdit/plugin-alert
# yarn
yarn add -D @mdit/plugin-alert
```

## Comparison / 对比

Compared against the upstream [`markdown-it-github-alerts`](https://www.npmjs.com/package/markdown-it-github-alerts) package `1.0.1`.

- Correctness: **4/25** cases match the reference exactly (4 reference errors, 4 differences).
- Throughput: **1.00×** the reference (geometric mean across 6 benchmark cases; above 1× means faster).
- Package size: **57.4 kB** unpacked and **1.4 kB** gzip entry, versus **15.0 kB** and **1.9 kB** for the reference.

See the full comparison report: [English](https://mdit-plugins.github.io/compare.html) · [中文](https://mdit-plugins.github.io/zh/compare.html).
