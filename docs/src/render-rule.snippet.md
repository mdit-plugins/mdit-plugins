```ts:no-line-numbers
/**
 * @param tokens - List of tokens.
 * @param index - Current token index.
 * @param options - Markdown-it options.
 * @param env - Markdown-it environment.
 * @param self - Markdown-it renderer instance.
 *
 * @returns Rendered HTML string.
 */
type RenderRule = (
  tokens: Token[],
  index: number,
  options: Options,
  env: Env,
  self: Renderer,
) => string;
```
