---
title: "Comparison with upstream"
shortTitle: "compare"
icon: code-compare
order: 1
---

This page compares the plugins in this repository with the upstream `markdown-it-*` packages they are based on or correspond to: correctness of the rendered output, throughput and complexity scaling, and package size. All data comes from the committed comparison run; select a package to see its detailed benchmark, scaling and documented differences.

<ComparisonReport locale="en" />

::: tip
The comparison harness and the authored specs live in [`compare/`](https://github.com/mdit-plugins/mdit-plugins/tree/main/compare). Run `pnpm run compare` to refresh the data, `pnpm run compare:sizes` to refresh the package sizes, and `pnpm run compare:docs` to regenerate this page's data.
:::
