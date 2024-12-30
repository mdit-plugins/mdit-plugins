export interface MarkdownItIconOptions<MarkdownItEnv = unknown> {
  render?: (content: string, env: MarkdownItEnv) => string;
}
