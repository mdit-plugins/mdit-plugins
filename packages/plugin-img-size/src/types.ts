export interface MarkdownReference {
  href: string;
  title?: string;
}

// oxlint-disable-next-line typescript/no-explicit-any
export interface ImgSizeEnv extends Record<string, any> {
  references?: Record<string, MarkdownReference>;
}
