# @mdit/plugin-emoji

[![Version](https://img.shields.io/npm/v/@mdit/plugin-emoji.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-emoji.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-emoji?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-emoji)

Emoji plugin for MarkdownIt.

## [Docs](https://mdit-plugins.github.io/emoji.html) | [文档](https://mdit-plugins.github.io/zh/emoji.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-emoji
# npm
npm i -D @mdit/plugin-emoji
# yarn
yarn add -D @mdit/plugin-emoji
```

## Comparison / 对比

Compared against the upstream [`markdown-it-emoji`](https://www.npmjs.com/package/markdown-it-emoji) package `3.1.0`.

- Correctness: **67/75** cases match the reference exactly (8 documented differences).
- Throughput: **1.02×** the reference (geometric mean across 18 benchmark cases; above 1× means faster).
- Package size: **291.9 kB** unpacked and **17.8 kB** gzip entry, versus **344.3 kB** and **91 B** for the reference.

See the full comparison report: [English](https://mdit-plugins.github.io/compare.html) · [中文](https://mdit-plugins.github.io/zh/compare.html).
