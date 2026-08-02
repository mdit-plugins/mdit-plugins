// oxlint-disable-next-line import/no-nodejs-modules
import { existsSync, readFileSync, statSync } from "node:fs";

import { NEWLINE_RE, dedent } from "@mdit/helper";
import type MarkdownIt from "markdown-it";
import type { PluginWithOptions } from "markdown-it";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";
import type { RuleCore } from "markdown-it/lib/parser_core.mjs";
import type StateBlock from "markdown-it/lib/rules_block/state_block.mjs";
import type Token from "markdown-it/lib/token.mjs";
import { isAbsolute, resolve, relative, join, dirname } from "upath";

import type { MarkdownItIncludeOptions } from "./options.js";
import type { IncludeEnv } from "./types.js";

interface ImportFileLineInfo {
  filePath: string;
  lineStart?: number | undefined;
  lineEnd?: number | undefined;
}

interface ImportFileRegionInfo {
  filePath: string;
  region: string;
}

type ImportFileInfo = ImportFileLineInfo | ImportFileRegionInfo;

interface IncludeInfo {
  cwd: string | null;
  includedFiles: string[];
  resolvedPath?: boolean;
  stack?: string[];
}

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
    full && tag && name === regionName && tag.match(end ? /^[Ee]nd ?[rR]egion$/ : /^[rR]egion$/),
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

export const handleInclude = (
  info: ImportFileInfo,
  { cwd, includedFiles, resolvedPath }: IncludeInfo,
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

  const lines = fileContent.replace(NEWLINE_RE, "\n").split("\n");
  let results: string[] = [];

  // is region
  if ("region" in info) {
    const region = findRegion(lines, info.region);

    if (region) results = lines.slice(region.lineStart, region.lineEnd);
  }
  // is file
  else {
    const { lineStart, lineEnd } = info;

    if (typeof lineStart === "number" && lineStart > 0) {
      results = lines.slice(lineStart - 1, lineEnd);
    } else if (lines[0] === "---") {
      const endLineIndex = lines.findIndex((line, index) => index !== 0 && line === "---");

      results = lines.slice(Math.max(endLineIndex + 1, 1), lineEnd);
    } else {
      results = lines.slice(0, lineEnd);
    }
  }

  if (resolvedPath && realPath.endsWith(".md")) {
    const dirName = dirname(realPath);

    results.unshift(`<!-- #include-env-start: ${dirName} -->`);
    results.push("<!-- #include-env-end -->");
  }

  return dedent(results.join("\n").replace(/\n?$/, "\n"));
};

// Forked and modified from markdown-it/lib/rules_block/fence.mjs
const scanFence = (state: StateBlock, startLine: number, endLine: number): number | null => {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) return null;

  if (pos + 3 > max) return null;

  const marker = state.src.charCodeAt(pos);

  if (marker !== 0x7e /* ~ */ && marker !== 0x60 /* ` */) return null;

  // scan marker length
  let mem = pos;
  pos = state.skipChars(pos, marker);
  const len = pos - mem;

  if (len < 3) return null;

  const params = state.src.slice(pos, max);

  if (marker === 0x60 /* ` */ && params.includes("`")) return null;

  // search end of block
  let nextLine = startLine;
  let haveEndMarker = false;

  for (;;) {
    nextLine++;
    if (nextLine >= endLine) break; // unclosed => autoclose at end

    pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    /* istanbul ignore next -- @preserve: blkIndent is always 0 in top-level scan */
    if (pos < max && state.sCount[nextLine] < state.blkIndent) break;

    if (state.src.charCodeAt(pos) !== marker) continue;
    if (state.sCount[nextLine] - state.blkIndent >= 4) continue;

    pos = state.skipChars(pos, marker);
    if (pos - mem < len) continue;

    pos = state.skipSpaces(pos);
    if (pos < max) continue;

    haveEndMarker = true;
    break;
  }

  return nextLine + (haveEndMarker ? 1 : 0);
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

    const fenceEnd = scanFence(state, line, state.lineMax);

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

export const resolveInclude = (
  content: string,
  options: Required<MarkdownItIncludeOptions>,
  { cwd, includedFiles, stack = [] }: IncludeInfo,
  codeRanges: [number, number][],
  md: MarkdownIt,
): string => {
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
        { filePath: actualPath },
        region
          ? { region }
          : {
              // oxlint-disable-next-line no-undefined
              lineStart: lineStart ? Number(lineStart) : undefined,
              // oxlint-disable-next-line no-undefined
              lineEnd: lineEnd ? Number(lineEnd) : undefined,
            },
      ),
      { cwd, includedFiles, resolvedPath },
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

const SYNTAX_PUSH_RE = /^<!-- #include-env-start: (?<includePath>[^)]*?) -->$/;

const includePushRule: RuleBlock = (state, startLine, _, silent): boolean => {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];

  const content = state.src.slice(start, max);

  if (content.startsWith("<!-- #include-env-start: ")) {
    // check if it’s matched the syntax
    const match = SYNTAX_PUSH_RE.exec(content);

    if (match) {
      if (silent) return true;

      const [, includePath] = match;

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

const includePopRule: RuleBlock = (state, startLine, _endLine, silent): boolean => {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];

  if (state.src.slice(start, max) === "<!-- #include-env-end -->") {
    if (silent) return true;

    state.line = startLine + 1;

    const token = state.push("include_end", "", 0);

    token.map = [startLine, state.line];
    token.markup = "include_end";

    return true;
  }

  return false;
};

const resolveRelatedLink = (
  attr: string,
  token: Token,
  filePath: string,
  includedPaths?: string[],
): void => {
  const attrIndex = token.attrIndex(attr);
  const url = token.attrs?.[attrIndex][1];

  if (url?.[0] === "." && Array.isArray(includedPaths)) {
    const { length } = includedPaths;

    if (length) {
      const includeDir = relative(dirname(filePath), includedPaths[length - 1]);

      const resolvedPath = join(includeDir, url);

      // oxlint-disable-next-line typescript/no-non-null-assertion
      token.attrs![attrIndex][1] = resolvedPath.startsWith(".")
        ? resolvedPath
        : `./${resolvedPath}`;
    }
  }
};

export const include: PluginWithOptions<MarkdownItIncludeOptions> = (md, options): void => {
  const {
    currentPath,
    resolvePath = (filePath: string): string => filePath,
    deep = false,
    resolveLinkPath = true,
    resolveImagePath = true,
    useComment = true,
  } = options ?? {};

  if (typeof currentPath !== "function")
    throw new TypeError('[@mdit/plugin-include]: "currentPath" is required');

  const includeRule: RuleCore = (state): void => {
    const env = state.env as IncludeEnv;
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
      },
      {
        cwd: filePath ? dirname(filePath) : null,
        includedFiles,
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

    md.renderer.rules.include_start = (tokens, index, _options, env: IncludeEnv): string => {
      const token = tokens[index];
      const includedPaths = (env.includedPaths ??= []);

      includedPaths.push(token.info);

      return "";
    };

    md.renderer.rules.include_end = (_tokens, _index, _options, env: IncludeEnv): string => {
      const includedPaths = env.includedPaths;

      /* istanbul ignore else -- @preserve */
      if (Array.isArray(includedPaths)) includedPaths.pop();

      // oxlint-disable-next-line no-console
      else console.error(`[@mdit/plugin-include]: include_end failed, no include_start.`);

      return "";
    };

    if (resolveImagePath) {
      // oxlint-disable-next-line typescript/no-non-null-assertion
      const defaultImageRender = md.renderer.rules.image!;

      md.renderer.rules.image = (tokens, index, mdItOptions, env: IncludeEnv, self): string => {
        const token = tokens[index];
        const filePath = currentPath(env);

        if (filePath) resolveRelatedLink("src", token, filePath, env.includedPaths);

        // pass token to default renderer.
        return defaultImageRender(tokens, index, mdItOptions, env, self);
      };
    }

    if (resolveLinkPath) {
      const defaultLinkRender =
        md.renderer.rules.link_open ??
        ((tokens, index, mdItOptions, _env, self): string =>
          self.renderToken(tokens, index, mdItOptions));

      md.renderer.rules.link_open = (tokens, index, mdItOptions, env: IncludeEnv, self): string => {
        const token = tokens[index];
        const filePath = currentPath(env);

        if (filePath) resolveRelatedLink("href", token, filePath, env.includedPaths);

        // pass token to default renderer.
        return defaultLinkRender(tokens, index, mdItOptions, env, self);
      };
    }
  }
};
