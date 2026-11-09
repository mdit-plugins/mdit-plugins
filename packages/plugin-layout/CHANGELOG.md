# Change Log

All notable changes to this project will be documented in this file. See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.1](https://github.com/mdit-plugins/mdit-plugins/compare/%40mdit%2Fplugin-layout%402.0.0...%40mdit%2Fplugin-layout%402.0.1) (2026-11-09)

### 🚀 Performance Improvements

- **plugin-layout:** reduce render-time allocations ([#909](https://github.com/mdit-plugins/mdit-plugins/issues/909)) ([81580a2](https://github.com/mdit-plugins/mdit-plugins/commit/81580a225363a38911e49dff4c3a62a6f8cf4ec6))

## [2.0.0](https://github.com/mdit-plugins/mdit-plugins/compare/%40mdit%2Fplugin-layout%401.1.4...%40mdit%2Fplugin-layout%402.0.0) (2026-11-01)

### ⚠ BREAKING CHANGES

- **plugin-layout:** replace the implicit single-@ nesting model, blkIndent raising and outdent-based item truncation with the context-free fence model used by code fences and @mdit/plugin-container/tab:

  - Any positive count of leading `@` opens a container (`@flexs`, `@@flexs`, `@@@flexs`); items and `@end` must match the container's count exactly.
  - Nested containers must use fewer leading `@` than their parent (`depth < ctx.depth`); otherwise they stay literal text.
  - Directives never change `state.blkIndent`; 0-3 spaces of indentation are decorative, 4+ indented lines are never directives. Item bodies span until the next same-count/type item, the matching `@end`, or the parent block boundary.
  - `findMatchingEnd` is a single forward scan (blank/outdent/4-space/fence handling, no nesting counter) that only consumes a real `@end`; early boundaries are left to the parent parser, and lines the tokenizer did not consume (e.g. blockquote lazy lines) are never skipped.

  Tests rewritten for the new syntax (marker-count nesting, exact mismatches, indented/fenced/lazy code, boundaries and token maps, list/blockquote/container interop); docs EN/ZH updated and prettier-ignore directives removed.

### ✨ Features

- **plugin-layout:** use marker-count fencing ([#879](https://github.com/mdit-plugins/mdit-plugins/issues/879)) ([f178652](https://github.com/mdit-plugins/mdit-plugins/commit/f17865204eb197b8b1e33ddefe02c65bed08bbe7))

### 🐛 Bug Fixes

- add hasRule guards to parser rules (part 2) ([#870](https://github.com/mdit-plugins/mdit-plugins/issues/870)) ([a5fa532](https://github.com/mdit-plugins/mdit-plugins/commit/a5fa53226517dd95d39f0f92a26313066d57a27b))
- make repeated installation a full no-op ([#873](https://github.com/mdit-plugins/mdit-plugins/issues/873)) ([b463792](https://github.com/mdit-plugins/mdit-plugins/commit/b463792d36f262ade426f8ac166c080b06dc69bd)), references [#1](https://github.com/mdit-plugins/mdit-plugins/issues/1) [#2](https://github.com/mdit-plugins/mdit-plugins/issues/2)
- **plugin-layout:** guard utility lookup and tabs ([#799](https://github.com/mdit-plugins/mdit-plugins/issues/799)) ([eba09f0](https://github.com/mdit-plugins/mdit-plugins/commit/eba09f0537ded99673ec6cb155d3dba2ade5ce23))

### Documentation

- unify package readmes and docs ([#789](https://github.com/mdit-plugins/mdit-plugins/issues/789)) ([acd2788](https://github.com/mdit-plugins/mdit-plugins/commit/acd27888cd8e22ea9f68bb873e65c7c622ea1e8b))

## [1.1.4](https://github.com/mdit-plugins/mdit-plugins/compare/%40mdit%2Fplugin-layout%401.1.3...%40mdit%2Fplugin-layout%401.1.4) (2026-10-21)

### 🐛 Bug Fixes

- **plugin-layout:** keep outdented item content ([#764](https://github.com/mdit-plugins/mdit-plugins/issues/764)) ([9a731f0](https://github.com/mdit-plugins/mdit-plugins/commit/9a731f003f6cc20eb5b688b1048862fe805c195a))
- unify node engines to >=22 ([#738](https://github.com/mdit-plugins/mdit-plugins/issues/738)) ([893abf6](https://github.com/mdit-plugins/mdit-plugins/commit/893abf60051549c4195ed251e3c2c773176475e1))

### Build System

- bump deps ([163db70](https://github.com/mdit-plugins/mdit-plugins/commit/163db70ec5ced49a132509996b5e58a62da930a3))

## [1.1.3](https://github.com/mdit-plugins/mdit-plugins/compare/%40mdit%2Fplugin-layout%401.1.2...%40mdit%2Fplugin-layout%401.1.3) (2026-09-26)

### Build System

- bump deps ([4a0c198](https://github.com/mdit-plugins/mdit-plugins/commit/4a0c1980891d4a5c520b0ad5955eb80230f070d1))
- bump deps ([0e2795c](https://github.com/mdit-plugins/mdit-plugins/commit/0e2795c7466f50b60982b5ec511d4eee6fc1dd67))

## [1.1.2](https://github.com/mdit-plugins/mdit-plugins/compare/%40mdit%2Fplugin-layout%401.1.1...%40mdit%2Fplugin-layout%401.1.2) (2026-09-12)

### Build System

- enable isolatedDeclarations ([#691](https://github.com/mdit-plugins/mdit-plugins/issues/691)) ([240722a](https://github.com/mdit-plugins/mdit-plugins/commit/240722af402a1969e0796e61ab4f59a73f6a1664))

## [1.1.1](https://github.com/mdit-plugins/mdit-plugins/compare/%40mdit%2Fplugin-layout%401.1.0...%40mdit%2Fplugin-layout%401.1.1) (2026-09-07)

### Build System

- bump deps ([#690](https://github.com/mdit-plugins/mdit-plugins/issues/690)) ([d169992](https://github.com/mdit-plugins/mdit-plugins/commit/d169992e3f47624bd9f47939fbb1e158e7c46444))

## [1.1.0](https://github.com/mdit-plugins/mdit-plugins/compare/%40mdit%2Fplugin-layout%401.0.3...%40mdit%2Fplugin-layout%401.1.0) (2026-08-12)

### ✨ Features

- migrate to markdown-it v15 ([5ec1171](https://github.com/mdit-plugins/mdit-plugins/commit/5ec11717eca911599782d3c0cdc389edde191b5f))

### 🐛 Bug Fixes

- **plugin-layout:** skip fence content in scans ([#654](https://github.com/mdit-plugins/mdit-plugins/issues/654)) ([ca887a1](https://github.com/mdit-plugins/mdit-plugins/commit/ca887a1f946e609ae24ef825e55aee3977fb380e))

## [1.0.3](https://github.com/mdit-plugins/mdit-plugins/compare/%40mdit%2Fplugin-layout%401.0.2...%40mdit%2Fplugin-layout%401.0.3) (2026-08-10)

### 🐛 Bug Fixes

- **plugin-layout:** keep [@end](https://github.com/end) trailing content ([#642](https://github.com/mdit-plugins/mdit-plugins/issues/642)) ([029dcc9](https://github.com/mdit-plugins/mdit-plugins/commit/029dcc92956e6fee48d5d0f4c001cd88d8ebfbfe))

## [1.0.2](https://github.com/mdit-plugins/mdit-plugins/compare/%40mdit%2Fplugin-layout%401.0.1...%40mdit%2Fplugin-layout%401.0.2) (2026-07-29)

### Code Refactoring

- rename package directories to use plugin- prefix ([#571](https://github.com/mdit-plugins/mdit-plugins/issues/571)) ([3526d96](https://github.com/mdit-plugins/mdit-plugins/commit/3526d9664a827cf7f61d1f578348cd81eed9a2f7))

## 1.0.1 (2026-07-01)

**Note:** Version bump only for package @mdit/plugin-layout

## [1.0.0](https://github.com/mdit-plugins/mdit-plugins/compare/%40mdit%2Fplugin-layout%400.2.2...%40mdit%2Fplugin-layout%401.0.0) (2026-06-29)

**Note:** Version bump only for package @mdit/plugin-layout

## [0.2.2](https://github.com/mdit-plugins/mdit-plugins/compare/@mdit/plugin-layout@0.2.1...@mdit/plugin-layout@0.2.2) (2026-03-30)

**Note:** Version bump only for package @mdit/plugin-layout

## [0.2.1](https://github.com/mdit-plugins/mdit-plugins/compare/@mdit/plugin-layout@0.2.0...@mdit/plugin-layout@0.2.1) (2026-03-02)

**Note:** Version bump only for package @mdit/plugin-layout

## 0.2.0 (2026-02-24)

### ⚠ BREAKING CHANGES

- **layout:** remove slim package

### ✨ Features

- add @mdit/plugin-layout ([#342](https://github.com/mdit-plugins/mdit-plugins/issues/342)) ([b225aa4](https://github.com/mdit-plugins/mdit-plugins/commit/b225aa40daa76a9fc77f12b49e144a0206a9c24d))
- **layout:** remove slim package ([4bd1727](https://github.com/mdit-plugins/mdit-plugins/commit/4bd172708dccc26a365392ee2f8d74f84e03855e))

### 🐛 Bug Fixes

- **layout:** depth should start from 1 ([c90db86](https://github.com/mdit-plugins/mdit-plugins/commit/c90db8613120c7db453e3b6ae934f1e9bfaf8797))
