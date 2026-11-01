// oxlint-disable-next-line import/no-nodejs-modules
import { randomBytes } from "node:crypto";
// oxlint-disable-next-line import/no-nodejs-modules
import { existsSync, readFileSync, statSync } from "node:fs";

import { NEWLINE_RE, defaultSensitiveFiles, dedent, hasRule, scanFence } from "@mdit/helper";
import type { BlockRule, CoreRule, PluginWithOptions } from "@mdit/helper";
import type { MarkdownIt, StateBlock, Token } from "markdown-it";
import { isAbsolute, resolve, relative, join, dirname } from "upath";

import { includeNonceKey, includePathsKey } from "./constant.js";
import type { MarkdownItIncludeOptions } from "./options.js";
import { createSecurityChecker } from "./security.js";
import type { SecurityChecker } from "./security.js";
import type { IncludeEnv } from "./types.js";

// fallback nonce for direct helper calls that don't go through the plugin
const DEFAULT_INCLUDE_NONCE = "mdit-include";

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

interface IncludeInfo {
  cwd: string | null;
  includedFiles: string[];
  nonce?: string;
  resolvedPath?: boolean;
  checkSecurity?: SecurityChecker;
  stack?: string[];
}

const BOM_RE = /^\uFEFF/;

const REGIONS_RE = [
  /^\/\/ ?#?(?<tag>(?:end)?region) (?<name>[\w*-]+)$/, // javascript, typescript, java
  /^\/\* ?#(?<tag>(?:end)?region) (?<name>[\w*-]+) ?\*\/$/, // css, less, scss
  /^#pragma (?<tag>(?:end)?region) (?<name>[\w*-]+)$/, // C, C++
  /^<!-- #?(?<tag>(?:end)?region) (?<name>[\w*-]+) -->$/, // HTML, markdown
  /^#(?<tag>(?:End )Region) (?<name>[\w*-]+)$/, // Visual Basic
  /^::#(?<tag>(?:end)region) (?<name>[\w*-]+)$/, // Bat
  /^# ?(?<tag>(?:end)?region) (?<name>[\w*-]+)$/, // C#, PHP, Powershell, Python, perl & misc
];

// regexp to match the import syntax
const INCLUDE_COMMENT_RE =
  /^(?<indent> *)<!-{2,}\s*@include:\s*(?<includePath>[^<>|:"*?]+(?:\.[a-z0-9]+))(?:#(?<region>[\w-]+))?(?:\{(?<lineStart>\d+)?-(?<lineEnd>\d+)?\})?\s*-{2,}>\s*$/gm;
const INCLUDE_RE =
  /^(?<indent> *)@include:\s*(?<includePath>[^<>|:"*?]+(?:\.[a-z0-9]+))(?:#(?<region>[\w-]+))?(?:\{(?<lineStart>\d+)?-(?<lineEnd>\d+)?\})?\s*$/gm;

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
  { cwd, includedFiles, resolvedPath, checkSecurity, nonce = DEFAULT_INCLUDE_NONCE }: IncludeInfo,
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

  (checkSecurity ?? createSecurityChecker({}))(info.requestedPath ?? filePath, realPath);

  includedFiles.push(realPath);

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

  const lines = fileContent.replace(BOM_RE, "").replace(NEWLINE_RE, "\n").split("\n");
  let results: string[] = [];

  // is region
  if ("region" in info) {
    const region = findRegion(lines, info.region);

    if (region) results = lines.slice(region.lineStart, region.lineEnd);
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

  if (resolvedPath && realPath.endsWith(".md")) {
    const dirName = dirname(realPath);

    results.unshift(`<!-- #include-env-start:${nonce}: ${dirName} -->`);
    results.push(`<!-- #include-env-end:${nonce} -->`);
  }

  return dedent(results.join("\n").replace(/\n?$/, "\n"));
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
const scanCodeRanges = (content: string, md: MarkdownIt): [number, number][] => {
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
 * Expand include directives in the given content
 *
 * 展开给定内容中的 include 指令
 *
 * @param content - Markdown content to expand / 要展开的 Markdown 内容
 * @param options - Include options / 包含选项
 * @param includeInfo - Include context / 包含上下文
 * @param codeRanges - Line ranges of code blocks / 代码块的行范围
 * @param md - MarkdownIt instance / MarkdownIt 实例
 * @returns Expanded Markdown content / 展开后的 Markdown 内容
 */
// oxlint-disable-next-line max-lines-per-function
export const resolveInclude = (
  content: string,
  options: Required<MarkdownItIncludeOptions>,
  { cwd, includedFiles, checkSecurity, nonce = DEFAULT_INCLUDE_NONCE, stack = [] }: IncludeInfo,
  codeRanges: [number, number][],
  md: MarkdownIt,
): string => {
  const security =
    checkSecurity ??
    createSecurityChecker({
      allowOutsideRoot: options.allowOutsideRoot,
      projectRoot: options.projectRoot,
      denyFiles: options.denyFiles,
    });

  const expand = (
    indent: string,
    includePath: string,
    region?: string,
    lineStart?: string,
    lineEnd?: string,
  ): string => {
    const actualPath = options.resolvePath(includePath, cwd);
    const realPath = isAbsolute(actualPath)
      ? actualPath
      : cwd
        ? resolve(cwd, actualPath)
        : actualPath;
    const resolvedPath = options.resolveImagePath || options.resolveLinkPath;

    // Detect circular includes in the current deep include chain: if this
    // file is already being processed, skip it instead of recursing forever.
    if (stack.includes(realPath)) {
      // oxlint-disable-next-line no-console
      console.error(`[@mdit/plugin-include]: Circular include detected: ${realPath}`);

      return "";
    }

    const fileContent = handleInclude(
      Object.assign(
        { filePath: actualPath, requestedPath: includePath },
        region
          ? { region }
          : {
              // oxlint-disable-next-line no-undefined
              lineStart: lineStart ? Number(lineStart) : undefined,
              // oxlint-disable-next-line no-undefined
              lineEnd: lineEnd ? Number(lineEnd) : undefined,
            },
      ),
      { cwd, includedFiles, resolvedPath, checkSecurity: security, nonce },
    );

    let included = fileContent;

    if (options.deep && actualPath.endsWith(".md")) {
      stack.push(realPath);

      try {
        included = resolveInclude(
          fileContent,
          options,
          {
            cwd: isAbsolute(actualPath)
              ? dirname(actualPath)
              : cwd
                ? resolve(cwd, dirname(actualPath))
                : null,
            includedFiles,
            checkSecurity: security,
            nonce,
            stack,
          },
          scanCodeRanges(fileContent, md),
          md,
        );
      } finally {
        stack.pop();
      }
    }

    return included
      .split("\n")
      .map((line) => indent + line)
      .join("\n");
  };

  // use a local regex instance so nested (deep) calls don't share lastIndex
  const { source, flags } = options.useComment ? INCLUDE_COMMENT_RE : INCLUDE_RE;
  const lineRegex = new RegExp(source, flags);
  let result = "";
  let lastCopied = 0;
  let lineNumber = 0;
  let rangeIndex = 0;
  let match: RegExpExecArray | null;

  // count newlines in [from, to) to track the current line number
  const countNewlines = (from: number, to: number): number => {
    let count = 0;

    for (let i = from; i < to; i++) if (content.charCodeAt(i) === 10 /* \n */) count++;

    return count;
  };

  while ((match = lineRegex.exec(content)) != null) {
    const { index } = match;
    const full = match[0];

    lineNumber += countNewlines(lastCopied, index);

    // advance to the code range covering the current line
    while (rangeIndex < codeRanges.length && codeRanges[rangeIndex][1] <= lineNumber) rangeIndex++;

    const inCode =
      rangeIndex < codeRanges.length &&
      lineNumber >= codeRanges[rangeIndex][0] &&
      lineNumber < codeRanges[rangeIndex][1];

    if (inCode) {
      // inside a code block: keep everything up to the match end literal
      result += content.slice(lastCopied, index + full.length);
      lastCopied = index + full.length;
      lineNumber += countNewlines(index, index + full.length);
      continue;
    }

    const [, indent, includePath, region, lineStart, lineEnd] = match;

    result +=
      content.slice(lastCopied, index) + expand(indent, includePath, region, lineStart, lineEnd);
    lastCopied = index + full.length;
    lineNumber += countNewlines(index, index + full.length);
  }

  return result + content.slice(lastCopied);
};

const INCLUDE_START_PREFIX = "<!-- #include-env-start:";
const INCLUDE_END_PREFIX = "<!-- #include-env-end:";
const SYNTAX_PUSH_RE = /^<!-- #include-env-start:(?<nonce>[^:]+): (?<includePath>.*) -->$/;
const SYNTAX_POP_RE = /^<!-- #include-env-end:(?<nonce>[^:]+) -->$/;

const includePushRule: BlockRule = (state, startLine, _, silent): boolean => {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];

  const content = state.src.slice(start, max);

  if (content.startsWith(INCLUDE_START_PREFIX)) {
    // check if it matches the marker syntax
    const match = SYNTAX_PUSH_RE.exec(content);

    if (match) {
      const { nonce: markerNonce, includePath } = match.groups as {
        nonce: string;
        includePath: string;
      };
      const expectedNonce =
        (state.env as IncludeEnv | undefined)?.[includeNonceKey] ?? DEFAULT_INCLUDE_NONCE;

      // a marker with another nonce is user content, not an include boundary
      if (markerNonce !== expectedNonce) return false;

      if (silent) return true;

      state.line = startLine + 1;
      const token = state.push("include_start", "", 0);

      token.map = [startLine, state.line];
      token.info = includePath;
      token.markup = "include_start";

      return true;
    }
  }

  return false;
};

const includePopRule: BlockRule = (state, startLine, _endLine, silent): boolean => {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];

  const content = state.src.slice(start, max);

  if (content.startsWith(INCLUDE_END_PREFIX)) {
    const match = SYNTAX_POP_RE.exec(content);

    if (match) {
      const { nonce: markerNonce } = match.groups as { nonce: string };
      const expectedNonce =
        (state.env as IncludeEnv | undefined)?.[includeNonceKey] ?? DEFAULT_INCLUDE_NONCE;

      // only the marker carrying the current render nonce closes an include
      if (markerNonce === expectedNonce) {
        if (silent) return true;

        state.line = startLine + 1;

        const token = state.push("include_end", "", 0);

        token.map = [startLine, state.line];
        token.markup = "include_end";

        return true;
      }
    }
  }

  return false;
};

// Check whether the url is a path relative to the included file.
// Anchors (`#foo`), absolute paths (`/foo`, `//example.com/foo`), query-only
// urls (`?foo`) and urls with a scheme (`https:`, `mailto:`, `data:`, `C:`, ...)
// are kept as-is.
const isRelativeUrl = (url: string): boolean => {
  const firstCharCode = url.charCodeAt(0);

  if (firstCharCode === 35 /* # */ || firstCharCode === 47 /* / */ || firstCharCode === 63 /* ? */)
    return false;

  const { length } = url;

  // a scheme (e.g. `https:`) must be terminated by ":" before any path, query
  // or hash character, otherwise the url is a relative path
  for (let index = 1; index < length; index++) {
    const charCode = url.charCodeAt(index);

    if (charCode === 58 /* : */) return false;

    if (charCode === 35 /* # */ || charCode === 47 /* / */ || charCode === 63 /* ? */) break;
  }

  return true;
};

const resolveRelatedLink = (
  attr: string,
  token: Token,
  filePath: string,
  includedPaths?: string[],
): (() => void) | null => {
  const attrIndex = token.attrIndex(attr);
  const url = token.attrs?.[attrIndex]?.[1] as string | undefined;

  if (url && isRelativeUrl(url) && Array.isArray(includedPaths)) {
    const { length } = includedPaths;

    if (length) {
      const includeDir = relative(dirname(filePath), includedPaths[length - 1]);

      const resolvedPath = join(includeDir, url);
      // oxlint-disable-next-line typescript/no-non-null-assertion
      const attrs = token.attrs!;

      attrs[attrIndex][1] = resolvedPath.startsWith(".") ? resolvedPath : `./${resolvedPath}`;

      // restore the original url after rendering, so that rendering the same
      // token stream again resolves it from the original value instead of
      // nesting the include directory over and over
      return () => {
        attrs[attrIndex][1] = url;
      };
    }
  }

  return null;
};

// oxlint-disable-next-line max-lines-per-function
export const include: PluginWithOptions<MarkdownItIncludeOptions> = (md, options): void => {
  // A second installation would run the include rule twice and expand nested directives twice.
  if (hasRule(md, "md_import", "core")) return;

  const {
    currentPath,
    resolvePath = (filePath: string): string => filePath,
    deep = false,
    resolveLinkPath = true,
    resolveImagePath = true,
    useComment = true,
    allowOutsideRoot = false,
    projectRoot,
    denyFiles,
  } = options ?? {};

  if (typeof currentPath !== "function")
    throw new TypeError('[@mdit/plugin-include]: "currentPath" is required');

  const checkSecurity = createSecurityChecker({
    allowOutsideRoot,
    projectRoot,
    denyFiles,
  });

  const includeRule: CoreRule = (state): void => {
    const env = state.env as IncludeEnv;
    // A fresh nonce per render prevents markers leaked by an earlier render (e.g. a marker
    // swallowed by an unclosed fence) from being replayed when the env object is reused.
    const nonce = (env[includeNonceKey] = randomBytes(8).toString("hex"));
    const includedFiles = (env.includedFiles ??= []);
    const filePath = currentPath(env);

    // fast path: no directive keyword at all → nothing to expand
    if (!state.src.includes("@include")) return;

    // reuse markdown-it's block structure to locate fenced/indented code
    // blocks, so directive-looking lines inside code examples stay literal
    const codeRanges = scanCodeRanges(state.src, md);

    state.src = resolveInclude(
      state.src,
      {
        currentPath,
        resolvePath,
        deep,
        resolveLinkPath,
        resolveImagePath,
        useComment,
        allowOutsideRoot,
        projectRoot: projectRoot ?? process.cwd(),
        denyFiles: denyFiles ?? defaultSensitiveFiles,
      },
      {
        cwd: filePath ? dirname(filePath) : null,
        includedFiles,
        checkSecurity,
        nonce,
      },
      codeRanges,
      md,
    );
  };

  // add md_import core rule
  md.core.ruler.after("normalize", "md_import", includeRule);

  if (resolveImagePath || resolveLinkPath) {
    md.block.ruler.before("table", "md_include_start", includePushRule, {
      alt: ["paragraph", "reference", "blockquote", "list"],
    });
    md.block.ruler.before("table", "md_include_end", includePopRule, {
      alt: ["paragraph", "reference", "blockquote", "list"],
    });

    md.renderer.rules.include_start = (tokens, index, _options, env): string => {
      const token = tokens[index];
      const includeEnv = env as IncludeEnv;
      const includedPaths = (includeEnv[includePathsKey] ??= []);

      includedPaths.push(token.info);

      return "";
    };

    md.renderer.rules.include_end = (_tokens, _index, _options, env): string => {
      const includeEnv = env as IncludeEnv;
      const includedPaths = includeEnv[includePathsKey];

      /* istanbul ignore else -- @preserve */
      if (Array.isArray(includedPaths)) includedPaths.pop();

      // oxlint-disable-next-line no-console
      else console.error(`[@mdit/plugin-include]: include_end failed, no include_start.`);

      return "";
    };

    if (resolveImagePath) {
      const defaultImageRender = md.renderer.rules.image;

      md.renderer.rules.image = (tokens, index, mdItOptions, env, self): string => {
        const token = tokens[index];
        const includeEnv = env as IncludeEnv;

        const filePath = currentPath(includeEnv);

        const restoreUrl = filePath
          ? resolveRelatedLink("src", token, filePath, includeEnv[includePathsKey])
          : null;

        try {
          // pass token to default renderer.
          return defaultImageRender(tokens, index, mdItOptions, env, self);
        } finally {
          restoreUrl?.();
        }
      };
    }

    if (resolveLinkPath) {
      const defaultLinkRender =
        md.renderer.rules.link_open ??
        ((tokens, index, mdItOptions, _env, self): string =>
          self.renderToken(tokens, index, mdItOptions));

      md.renderer.rules.link_open = (tokens, index, mdItOptions, env, self): string => {
        const token = tokens[index];
        const includeEnv = env as IncludeEnv;

        const filePath = currentPath(includeEnv);

        const restoreUrl = filePath
          ? resolveRelatedLink("href", token, filePath, includeEnv[includePathsKey])
          : null;

        try {
          // pass token to default renderer.
          return defaultLinkRender(tokens, index, mdItOptions, env, self);
        } finally {
          restoreUrl?.();
        }
      };
    }
  }
};
