// oxlint-disable-next-line import/no-nodejs-modules
import { existsSync, readFileSync, statSync } from "node:fs";

import { NEWLINE_RE, dedent, scanFence } from "@mdit/helper";
import type { MarkdownIt, StateBlock } from "markdown-it";
import { dirname, isAbsolute, resolve } from "upath";

import { DEFAULT_INCLUDE_NONCE } from "./constant.js";
import { createSecurityChecker } from "./security.js";
import type { SecurityCache, SecurityChecker } from "./security.js";

interface ImportFileInfoBase {
  filePath: string;
  /** Path exactly as requested by the user / 用户原始请求路径 */
  requestedPath?: string;
}

interface ImportFileLineInfo extends ImportFileInfoBase {
  lineStart?: number | undefined;
  lineEnd?: number | undefined;
}

interface ImportFileRegionInfo extends ImportFileInfoBase {
  region: string;
}

type ImportFileInfo = ImportFileLineInfo | ImportFileRegionInfo;

interface CachedIncludeFile {
  /** BOM-stripped, newline-normalized lines; treated as read-only / 已去除 BOM 并统一换行符的行（只读） */
  lines: string[];
  /** Processed output keyed by region / line range / marker spec / 按区域、行范围与标记处理的输出缓存 */
  outputs: Map<string, string>;
}

/**
 * Cache shared by all includes expanded for a single render. It is created per `resolveInclude`
 * call (one call per render) and never reused afterwards, so a hit can never describe an older file
 * state.
 *
 * 单次渲染中所有 include 共享的缓存。它在每次 `resolveInclude` 调用（每次渲染一次）中创建，之后不再复用，因此命中项永远不会对应旧的文件状态。
 */
export interface IncludeCache {
  /** Successfully read files, keyed by resolved path / 读取成功的文件，按解析后的路径索引 */
  files: Map<string, CachedIncludeFile>;
  /** Security verdicts for the current render / 当前渲染的安全校验结果 */
  security: SecurityCache;
}

export interface IncludeInfo {
  cwd: string | null;
  includedFiles: string[];
  nonce?: string;
  resolvedPath?: boolean;
  checkSecurity?: SecurityChecker;
  stack?: Set<string>;
  cache?: IncludeCache;
}

const BOM_CHAR_CODE = 0xfeff;

const REGIONS_RE = [
  /^\/\/ ?#?(?<tag>(?:end)?region) (?<name>[\w*-]+)$/, // javascript, typescript, java
  /^\/\* ?#(?<tag>(?:end)?region) (?<name>[\w*-]+) ?\*\/$/, // css, less, scss
  /^#pragma (?<tag>(?:end)?region) (?<name>[\w*-]+)$/, // C, C++
  /^<!-- #?(?<tag>(?:end)?region) (?<name>[\w*-]+) -->$/, // HTML, markdown
  /^#(?<tag>(?:End )Region) (?<name>[\w*-]+)$/, // Visual Basic
  /^::#(?<tag>(?:end)region) (?<name>[\w*-]+)$/, // Bat
  /^# ?(?<tag>(?:end)?region) (?<name>[\w*-]+)$/, // C#, PHP, Powershell, Python, perl & misc
];

const testLine = (line: string, regexp: RegExp, regionName: string, end = false): boolean => {
  const [full, tag, name] = regexp.exec(line.trim()) ?? [];

  return Boolean(
    full && tag && name === regionName && (end ? /^[Ee]nd ?[rR]egion$/ : /^[rR]egion$/).test(tag),
  );
};

const findRegion = (
  lines: string[],
  regionName: string,
): { lineStart: number; lineEnd: number } | null => {
  let regexp = null;
  let lineStart = -1;

  const lineEnd = lines.length;

  for (let lineIndex = 0; lineIndex < lineEnd; lineIndex++) {
    const line = lines[lineIndex];

    if (regexp == null) {
      for (let i = 0; i < REGIONS_RE.length; i++) {
        const reg = REGIONS_RE[i];

        if (testLine(line, reg, regionName)) {
          lineStart = lineIndex + 1;
          regexp = reg;
          break;
        }
      }
    } else if (testLine(line, regexp, regionName, true)) {
      return { lineStart, lineEnd: lineIndex };
    }
  }

  return null;
};

const normalizeIncludeLines = (fileContent: string): string[] => {
  let content = fileContent;

  if (content.charCodeAt(0) === BOM_CHAR_CODE) content = content.slice(1);
  // Only rebuild the string when a carriage return actually exists
  if (content.includes("\r")) content = content.replace(NEWLINE_RE, "\n");

  return content.split("\n");
};

const getIncludeOutputKey = (info: ImportFileInfo, hasMarkers: boolean, nonce: string): string => {
  const markerKey = hasMarkers ? `\u0000${nonce}` : "";

  return "region" in info
    ? `r\u0000${info.region}${markerKey}`
    : `l\u0000${info.lineStart ?? ""}\u0000${info.lineEnd ?? ""}${markerKey}`;
};

// Forked and modified from markdown-it/lib/rules_block/code.mjs
const scanCode = (state: StateBlock, startLine: number, endLine: number): number => {
  if (state.sCount[startLine] - state.blkIndent < 4) return startLine;

  let nextLine = startLine + 1;
  let last = nextLine;

  while (nextLine < endLine) {
    if (state.isEmpty(nextLine)) {
      nextLine++;
      continue;
    }

    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      nextLine++;
      last = nextLine;
      continue;
    }
    break;
  }

  return last;
};

// Locate fenced / indented code blocks, reusing markdown-it's block structure
export const scanCodeRanges = (content: string, md: MarkdownIt): [number, number][] => {
  const state = new md.block.State(content, md, {}, []);
  const ranges: [number, number][] = [];
  let line = 0;

  while (line < state.lineMax) {
    line = state.skipEmptyLines(line);
    if (line >= state.lineMax) break;

    const fenceEnd = scanFence(state, line, state.lineMax, state.blkIndent);

    if (fenceEnd != null && fenceEnd > line) {
      ranges.push([line, fenceEnd]);
      line = fenceEnd;
      continue;
    }

    // indented code blocks can't directly follow a paragraph line (markdown-it
    // treats such lines as lazy continuation), so require a blank line before
    const codeEnd = scanCode(state, line, state.lineMax);

    if (codeEnd > line && (line === 0 || state.isEmpty(line - 1))) {
      ranges.push([line, codeEnd]);
      line = codeEnd;
      continue;
    }

    line++;
  }

  return ranges;
};

/**
 * Include a file and return the included content
 *
 * 包含文件并返回包含的内容
 *
 * @param info - File info to include / 要包含的文件信息
 * @param includeInfo - Include context / 包含上下文
 * @returns Included Markdown content / 包含的 Markdown 内容
 */
export const handleInclude = (
  info: ImportFileInfo,
  {
    cwd,
    includedFiles,
    resolvedPath,
    checkSecurity,
    nonce = DEFAULT_INCLUDE_NONCE,
    cache,
  }: IncludeInfo,
): string => {
  const { filePath } = info;
  let realPath = filePath;

  if (!isAbsolute(filePath)) {
    // if the importPath is relative path, we need to resolve it
    // according to the markdown filePath
    if (!cwd) {
      // oxlint-disable-next-line no-console
      console.error(`[@mdit/plugin-include]: Error when resolving path: ${filePath}`);

      return "\nError when resolving path\n";
    }

    realPath = resolve(cwd, filePath);
  }

  (checkSecurity ?? createSecurityChecker({}))(
    info.requestedPath ?? filePath,
    realPath,
    cache?.security,
  );

  includedFiles.push(realPath);

  const hasMarkers = Boolean(resolvedPath && realPath.endsWith(".md"));
  let cachedFile = cache?.files.get(realPath);
  const cachedOutput = cachedFile?.outputs.get(getIncludeOutputKey(info, hasMarkers, nonce));

  if (cachedOutput != null) return cachedOutput;

  let lines: string[];

  if (cachedFile) {
    lines = cachedFile.lines;
  } else {
    // check file existence; also skip directories to avoid an EISDIR crash on read
    if (!existsSync(realPath) || !statSync(realPath).isFile()) {
      // oxlint-disable-next-line no-console
      console.error(`[@mdit/plugin-include]: ${realPath} not found`);

      return "\nFile not found\n";
    }

    // read file content; an unreadable file (e.g. EACCES) should not crash the
    // whole render, degrade to a "Failed to read file" result instead
    let fileContent: string;

    try {
      fileContent = readFileSync(realPath).toString();
    } catch {
      // oxlint-disable-next-line no-console
      console.error(`[@mdit/plugin-include]: failed to read ${realPath}`);

      return "\nFailed to read file\n";
    }

    lines = normalizeIncludeLines(fileContent);

    if (cache) {
      cachedFile = { lines, outputs: new Map() };
      cache.files.set(realPath, cachedFile);
    }
  }

  let results: string[];

  // is region
  if ("region" in info) {
    const region = findRegion(lines, info.region);

    results = region ? lines.slice(region.lineStart, region.lineEnd) : [];
  }
  // is file
  else {
    const { lineStart, lineEnd } = info;

    if (lineStart != null || lineEnd != null) {
      // explicit ranges always use the raw file lines, so line numbers match
      // what an editor shows (frontmatter included); line 0 is clamped to line 1
      const startLine = Math.max(lineStart ?? 1, 1);

      results = lines.slice(startLine - 1, lineEnd ?? lines.length);
    } else if (lines[0] === "---") {
      const endLineIndex = lines.findIndex((line, index) => index !== 0 && line === "---");

      results = lines.slice(Math.max(endLineIndex + 1, 1));
    } else {
      results = lines.slice(0);
    }
  }

  if (hasMarkers) {
    const dirName = dirname(realPath);

    results.unshift(`<!-- #include-env-start:${nonce}: ${dirName} -->`);
    results.push(`<!-- #include-env-end:${nonce} -->`);
  }

  const output = dedent(results.join("\n").replace(/\n?$/, "\n"));

  cachedFile?.outputs.set(getIncludeOutputKey(info, hasMarkers, nonce), output);

  return output;
};
