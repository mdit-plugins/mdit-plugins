export interface MarkdownReference {
  href: string;
  title?: string;
}

// oxlint-disable-next-line typescript/no-explicit-any
export interface ImgSizeEnv extends Record<any, any> {
  references?: Record<string, MarkdownReference>;
}
