# @mdit/plugin-anchor

[![Version](https://img.shields.io/npm/v/@mdit/plugin-anchor.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-anchor.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-anchor?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-anchor)

anchor plugin for MarkdownIt.

## [Docs](https://mdit-plugins.github.io/anchor.html) | [文档](https://mdit-plugins.github.io/zh/anchor.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-anchor
# npm
npm i -D @mdit/plugin-anchor
# yarn
yarn add -D @mdit/plugin-anchor
```

## Comparison / 对比

Compared against the upstream [`markdown-it-anchor`](https://www.npmjs.com/package/markdown-it-anchor) package `10.0.0`.

- Correctness: **75/88** cases match the reference exactly (13 documented differences).
- Throughput: **0.97×** the reference (geometric mean across 24 benchmark cases; above 1× means faster).
- Package size: **76.9 kB** unpacked and **2.2 kB** gzip entry, versus **138.7 kB** and **2.2 kB** for the reference.

See the comparison tables in the [English docs](https://mdit-plugins.github.io/anchor.html) or [中文文档](https://mdit-plugins.github.io/zh/anchor.html) for details and methodology.

## Acknowledgements / 鸣谢

This plugin is inspired by and based on [markdown-it-anchor](https://github.com/valeriangalliat/markdown-it-anchor), whose authors are [Val](https://val.codejam.info/) and [Nagao, Fabio Zendhi](https://github.com/nagaozen/)
