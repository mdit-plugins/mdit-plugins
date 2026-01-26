// oxlint-disable-next-line typescript/no-explicit-any
export interface IncludeEnv extends Record<string, any> {
  /** included current paths */
  includedPaths?: string[];
  /** included files */
  includedFiles?: string[];
}
