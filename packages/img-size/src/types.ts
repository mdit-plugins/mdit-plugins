export interface MarkdownReference {
  href: string;
  title?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ImgSizeEnv extends Record<any, any> {
  references?: Record<string, MarkdownReference>;
}
