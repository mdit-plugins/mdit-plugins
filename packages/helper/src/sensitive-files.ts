const REGEXP_SPECIAL_CHARS = String.raw`\^$.*+?()[]{}|`;

/**
 * Default patterns of files that must never be read.
 *
 * 默认禁止读取的文件模式。
 */
export const defaultSensitiveFiles: readonly string[] = [
  ".env",
  ".env.*",
  ".npmrc",
  ".netrc",
  ".git-credentials",
  "id_rsa*",
  "id_ed25519*",
  "*.pem",
  "*.key",
  "*.p12",
  ".git/**",
  "**/.git/**",
  ".ssh/**",
  "**/.ssh/**",
  ".aws/**",
  "**/.aws/**",
  ".azure/**",
  "**/.azure/**",
  ".kube/**",
  "**/.kube/**",
  ".docker/config.json",
  "**/.docker/config.json",
  "*.tfstate*",
];

/**
 * Convert a glob pattern to a regular expression.
 *
 * 将 glob 模式转为正则表达式。
 *
 * @param glob - Glob pattern / glob 模式
 * @returns Regular expression matching the glob / 匹配该 glob 的正则
 */
const globToRegExp = (glob: string): RegExp => {
  let source = "^";
  const { length } = glob;

  for (let index = 0; index < length; index++) {
    const char = glob[index];

    if (char === "*") {
      if (glob.charCodeAt(index + 1) === 42 /* * */) {
        index++;

        if (glob.charCodeAt(index + 1) === 47 /* / */) {
          index++;
          // `**/` also matches zero directory levels
          source += "(?:.*/)?";
        } else {
          source += ".*";
        }
      } else {
        source += "[^/]*";
      }
    } else if (char === "?") {
      source += "[^/]";
    } else {
      source += REGEXP_SPECIAL_CHARS.includes(char) ? `\\${char}` : char;
    }
  }

  return new RegExp(`${source}$`);
};

const testRegExp = (pattern: RegExp, value: string): boolean => {
  // a global / sticky regex keeps `lastIndex` between calls
  if (pattern.global || pattern.sticky) pattern.lastIndex = 0;

  return pattern.test(value);
};

/**
 * Check whether a POSIX-style path matches a sensitive file pattern.
 *
 * Patterns containing `/` match the whole path, while patterns without `/` match the basename.
 *
 * 检查 POSIX 风格路径是否命中敏感文件模式。
 *
 * 含 `/` 的模式匹配整个路径，不含 `/` 的模式匹配文件名（路径最后一段）。
 *
 * @example
 *   isSensitiveFile(".env"); // true
 *   isSensitiveFile("src/index.ts"); // false
 *
 * @param path - POSIX-style path / POSIX 风格路径
 * @param patterns - Glob or RegExp patterns / glob 或正则模式
 * @returns Whether the path is sensitive / 路径是否命中敏感文件
 */
export const isSensitiveFile = (
  path: string,
  patterns: readonly (string | RegExp)[] = defaultSensitiveFiles,
): boolean => {
  const lastSlashIndex = path.lastIndexOf("/");
  const basename = lastSlashIndex === -1 ? path : path.slice(lastSlashIndex + 1);

  for (const pattern of patterns) {
    if (typeof pattern === "string") {
      const target = pattern.includes("/") ? path : basename;

      if (globToRegExp(pattern).test(target)) return true;
    } else if (testRegExp(pattern, path) || testRegExp(pattern, basename)) {
      return true;
    }
  }

  return false;
};
