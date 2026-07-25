// oxlint-disable-next-line typescript/no-explicit-any
export interface IncludeEnv extends Record<string, any> {
  /** Included current paths */
  includedPaths?: string[];
  /** Included files */
  includedFiles?: string[];
}
