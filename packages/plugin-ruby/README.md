# @mdit/plugin-ruby

[![Version](https://img.shields.io/npm/v/@mdit/plugin-ruby.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-ruby.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-ruby?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-ruby)

Ruby plugin for MarkdownIt.

## [Docs](https://mdit-plugins.github.io/ruby.html) | [文档](https://mdit-plugins.github.io/zh/ruby.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-ruby
# npm
npm i -D @mdit/plugin-ruby
# yarn
yarn add -D @mdit/plugin-ruby
```

## Comparison / 对比

Compared against the upstream [`markdown-it-ruby`](https://www.npmjs.com/package/markdown-it-ruby) package `1.1.2`.

- Correctness: **10/21** cases match the reference exactly (11 documented differences).
- Throughput: **0.97×** the reference (geometric mean across 6 benchmark cases; above 1× means faster).
- Package size: **20.1 kB** unpacked and **575 B** gzip entry, versus **21.3 kB** and **1.9 kB** for the reference.

See the comparison tables in the [English docs](https://mdit-plugins.github.io/ruby.html) or [中文文档](https://mdit-plugins.github.io/zh/ruby.html) for details and methodology.
