---
title: "@mdit/plugin-emoji"
shortTitle: "plugin-emoji"
icon: face-smile
---

Emoji plugin for markdown-it.

<!-- more -->

## Usage

```ts
import { fullEmoji } from "@mdit/plugin-emoji";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(fullEmoji);

mdIt.render("Hello from mars :satellite:");
```

Different presets are available:

- `fullEmoji`: includes all available emojis support
- `lightEmoji`: includes small subset of most useable emojis
- `bareEmoji`: no defaults, only includes those you defined in options

A markdown-it instance supports one preset: reinstalling on the same instance — with another variant or with different options — keeps the first installed rule and its definitions.

## Syntax

- `:emoji_name:`
- shortcuts like `:)`, `:D`, etc. (if enabled)

## Options

:::: fields
@`definitions` type=`Record<string, string>` default="`{}` (preset dependent)"

Rewrite available emoji definitions. The key is the emoji name, and the value is the emoji character.

Example: `{ name1: 'char1', name2: 'char2', ... }`

::: warning Untrusted input

Definition values are emitted as raw HTML into the output, so `definitions` must never contain untrusted user input, or the values must be sanitized first.

:::

@`enabled` type=string[] default=`[]`

If specified, only emojis in this list will be rendered. Otherwise, all emojis in the definitions will be rendered.

@`shortcuts` type=`Record<string, string | string[]>` default="`{}` (preset dependent)"

Rewrite default shortcuts. The key is the emoji name, and the value is the shortcut(s) for the emoji.

Empty or whitespace-only shortcuts are ignored.

Example: `{ "smile": [ ":)", ":-)" ], "laughing": ":D" }`

::::

## Demo

::: preview Demo

Hello from mars :satellite:

Classic shortcuts: :-) :-(

:::

## Custom Renderer

By default, emojis are rendered as appropriate unicode chars. But you can change the renderer function as you wish.

For example, to use [twemoji](https://github.com/twitter/twemoji):

```ts
import { fullEmoji } from "@mdit/plugin-emoji";
import MarkdownIt from "markdown-it";
import twemoji from "twemoji";

const mdIt = new MarkdownIt().use(fullEmoji);

mdIt.renderer.rules.emoji = (tokens, idx) => twemoji.parse(tokens[idx].content);
```

And you can make image height match the line height with this style:

```css
.emoji {
  height: 1.2em;
}
```

<!-- comparison:start -->

## Comparison

Compared against the upstream [`markdown-it-emoji`](https://www.npmjs.com/package/markdown-it-emoji) package `3.1.0`. Benchmarks were measured with Node.js v26.13.0, Apple M4 (darwin arm64) on 2026-11-02. Every table below is generated from the committed comparison data.

### Correctness

| Variant | Cases | Exact | Normalized | Documented diffs |
| ------- | ----: | ----: | ---------: | ---------------: |
| bare    |    25 |    25 |          0 |                0 |
| light   |    25 |    25 |          0 |                0 |
| full    |    25 |    23 |          0 |                2 |

The following cases are documented differences:

- `full/full-new-emoji-name` — This Unicode 15.1 name exists only in the current `full` data; the reference renders it as literal text. `light` and `bare` render it literally on both sides.
- `full/full-reference-only-name` — `u6e80` (🈵) only exists in the reference data; the current `full` data names the same character `no_vacancy` and renders `:u6e80:` as literal text. `light` and `bare` render it literally on both sides.

### Benchmarks

| Variant | Case          | Current (ops/s) | Reference (ops/s) | Ratio |
| ------- | ------------- | --------------: | ----------------: | ----: |
| bare    | normal/small  |          10,596 |            10,623 | 1.00× |
| bare    | normal/medium |           1,963 |             1,967 | 1.00× |
| bare    | normal/large  |             551 |               552 | 1.00× |
| bare    | heavy/small   |          11,797 |            11,816 | 1.00× |
| bare    | heavy/medium  |           2,246 |             2,242 | 1.00× |
| bare    | heavy/large   |             629 |               627 | 1.00× |
| light   | normal/small  |           9,954 |             9,972 | 1.00× |
| light   | normal/medium |           1,854 |             1,850 | 1.00× |
| light   | normal/large  |             500 |               511 | 0.98× |
| light   | heavy/small   |           7,909 |             7,864 | 1.01× |
| light   | heavy/medium  |           1,495 |             1,502 | 1.00× |
| light   | heavy/large   |             417 |               417 | 1.00× |
| full    | normal/small  |           8,762 |             8,756 | 1.00× |
| full    | normal/medium |           1,642 |             1,642 | 1.00× |
| full    | normal/large  |             461 |               462 | 1.00× |
| full    | heavy/small   |           6,794 |             6,735 | 1.01× |
| full    | heavy/medium  |           1,296 |             1,279 | 1.01× |
| full    | heavy/large   |             361 |               359 | 1.01× |

Geometric mean throughput ratio: 1.00× across 18 cases; above 1× means the current package is faster.

### Scaling

| Variant | Series                    | Sizes                    | Current exponent | Reference exponent |
| ------- | ------------------------- | ------------------------ | ---------------: | -----------------: |
| bare    | dense-emoji-text          | 512 / 1024 / 2048 / 4096 |            ~1.00 |              ~1.01 |
| bare    | inline-token-replacements | 512 / 1024 / 2048 / 4096 |            ~1.76 |              ~1.76 |
| bare    | unmatched-colon-words     | 512 / 1024 / 2048 / 4096 |            ~0.98 |              ~0.98 |
| light   | dense-emoji-text          | 512 / 1024 / 2048 / 4096 |            ~0.99 |              ~1.00 |
| light   | inline-token-replacements | 512 / 1024 / 2048 / 4096 |            ~1.78 |              ~1.78 |
| light   | unmatched-colon-words     | 512 / 1024 / 2048 / 4096 |            ~0.99 |              ~0.99 |
| full    | dense-emoji-text          | 512 / 1024 / 2048 / 4096 |            ~1.01 |              ~1.00 |
| full    | inline-token-replacements | 512 / 1024 / 2048 / 4096 |            ~1.50 |              ~2.01 |
| full    | unmatched-colon-words     | 512 / 1024 / 2048 / 4096 |            ~1.03 |              ~1.02 |

Exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic.

### Package size

| Package                             | Unpacked size | Entry gzip |
| ----------------------------------- | ------------: | ---------: |
| @mdit/plugin-emoji (current)        |      289.5 kB |    17.8 kB |
| markdown-it-emoji@3.1.0 (reference) |      344.3 kB |       91 B |

### Notes

- The `bare` preset ships no built-in data, so both sides receive the same custom definitions (the reference option is `defs`, the current one `definitions`), shortcuts and `enabled` whitelist (`enabled: ["smile", "rocket"]`).
- `light` data (150 names) and the shortcut table (25 names) are identical on both sides, so every `light` case matches.
- `full` data differs: the current package ships 1957 names, markdown-it-emoji 3.1.0 ships 1903. 55 newer names (Unicode 15.1/16.0 additions such as `head_shaking_horizontally`, `phoenix` or `leafless_tree`) exist only in the current data, and the reference-only generated name `u6e80` (🈵, exposed as `no_vacancy` in the current data) is missing from the current data. The two `full` cases covering these names are reported as documented diffs; the `light` and `bare` variants render them as literal text on both sides.
- The current package ignores empty or whitespace-only shortcut aliases, while the reference compiles a zero-length alternative that duplicates emojis next to whitespace or punctuation (e.g. `a :smile: b` with an empty `smile` alias becomes `a 😄😄 b`). This is documented behavior of the current package and is not covered by a case, because such an alias changes every shortcut-bearing text token.
- Scaling: `dense-emoji-text` and `unmatched-colon-words` are linear baselines. `inline-token-replacements` is superlinear and exposes the replacement loop from markdown-it-emoji#22: every matching text token is rewritten with `arrayReplaceAt`, which copies the whole inline children array, so an inline token with m matching children costs O(m²).
- Benchmarks render fixed corpora (`normal` = sparse emoji, `heavy` = dense emoji) and compare both sides interleaved; the ratio and exponent values in the result file come from the controlled sequential comparison run, not from ad-hoc runs.
- Package size covers the files published to npm: `dist/**`, `README`, `LICENSE*`, `package.json`, plus any extra file listed in the package `files` field. The reference size is the installed package directory without nested `node_modules`.
- Entry gzip is the gzipped size of the ESM entry: `dist/index.js` for the current package and the `module` / `exports.import` / `main` entry for the reference.
- Benchmark throughput and scaling numbers are medians of interleaved samples, so both sides run under the same load.

<!-- comparison:end -->
