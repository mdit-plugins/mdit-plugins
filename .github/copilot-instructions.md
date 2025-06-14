# MarkdownIt Plugins Coding Standards

## Code Rules

- Must be written in TypeScript
- Use `src/index.ts` as the entry file to export the plugin
- Use `src/options.ts` for options definition
- Use `src/plugin.ts` for plugin implementation

## Test Rules

- Test files must be in `__tests__` directory
- Use `vitest` for testing
- Test should be grouped by testing cases with `describe`
- Test should target 100% code coverage unless some cases are really edge cases

## Performance

- Usage of RegExp should be avoided, especially in performance-critical paths. Prefer using a pos pointer to access characters in string with logic instead.

- Operating strings with `slice`, `substring` and similar methods that create new strings shall be avoided if possible

- Prefer using `charCodeAt` for character access and comparison instead of `charAt`.

  To improve readability, use the format `str.charCodeAt(index) === number /* char */` for character comparisons.

  E.g.: `str.charCodeAt(index) === 36 /* $ */`

- Constant must be defined at the top of the file to avoid local creation overhead.

- If a static variable is used multiple times, it should be extracted to a constant unless it's hard to deal with types or it breaks readability badly.

## JSDoc Rules

### Scope

- **Required for**: All plugin options

### Format Requirements

- **Bilingual**: English + Chinese for all exported content
- **@default**: Always include if exists for all properties (including `@default false`)
- **@example**: Only for exported functions
- **@description**: Optional, only if necessary to explain more
- **@param**: Required for all parameters, should be bilingual, separate with `/` for English and Chinese
- **@returns**: Required for all return values expect `void` and `Promise<void>`, should be bilingual, separate with `/` for English and Chinese

````ts
/**
 * English description
 *
 * 中文描述
 *
 * @description (optional) English detailed description
 *
 * 中文详细描述
 *
 * @param paramName - English description / 中文描述
 *
 * @default defaultValue
 * @example
 * ```ts
 * // Example code in TypeScript
 * ```
 */
````

## Documentation Rules

- Consistent with code behaviors
- Chinese/English content must be consistent in structure and content
- Make content concise and clear, remove unnecessary words, avoid redundancy, prefer shorter if possible
- Use "你" instead of "您" in Chinese
