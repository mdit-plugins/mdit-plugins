// oxlint-disable-next-line import/no-nodejs-modules
import { readFileSync, statSync } from "node:fs";

import { NEWLINE_RE, dedent, hasRule } from "@mdit/helper";
import type { BlockRule, CoreRule, PluginWithOptions } from "@mdit/helper";
import { dirname, extname, resolve } from "upath";

import type { CachedSnippetFile, SnippetCache } from "./cache.js";
import { snippetCacheKey } from "./constant.js";
import type { MarkdownItSnippetOptions } from "./options.js";
import { createSecurityChecker } from "./security.js";
import type { SecurityChecker } from "./security.js";
import type { SnippetEnv } from "./types.js";

const REGIONS_RE = [
  /^\/\/ ?#?(?<tag>(?:end)?region) (?<name>[\w*-]+)$/, // javascript, typescript, java
  /^\/\* ?#(?<tag>(?:end)?region) (?<name>[\w*-]+) ?\*\/$/, // css, less, scss
  /^#pragma (?<tag>(?:end)?region) (?<name>[\w*-]+)$/, // C, C++
  /^<!-- #?(?<tag>(?:end)?region) (?<name>[\w*-]+) -->$/, // HTML, markdown
  /^#(?<tag>(?:End )Region) (?<name>[\w*-]+)$/, // Visual Basic
  /^::#(?<tag>(?:end)region) (?<name>[\w*-]+)$/, // Bat
  /^# ?(?<tag>(?:end)?region) (?<name>[\w*-]+)$/, // C#, PHP, Powershell, Python, perl & misc
];
const SNIPPET_RE = /^(?<path>[^#{]*)(?<meta>(?:[#{}].*)?)$/;
const SNIPPET_META_RE =
  /^(?:#(?<region>[\w-]+))?(?: ?(?:{(?<lines>\d+(?:[,-]\d+)*)? ?(?<lang>\S+)?}))?$/;
const REGION_START_MARKER_RE = /^[rR]egion$/;
const REGION_END_MARKER_RE = /^[Ee]nd ?[rR]egion$/;

const testLine = (line: string, regexp: RegExp, regionName: string, end = false): boolean => {
  const [full, tag, name] = regexp.exec(line.trimStart()) ?? [];

  return Boolean(
    full &&
    tag &&
    name === regionName &&
    (end ? REGION_END_MARKER_RE : REGION_START_MARKER_RE).test(tag),
  );
};

const findRegion = (
  lines: string[],
  regionName: string,
): { start: number; end: number; regexp: RegExp } | null => {
  let regexp: RegExp | null = null;
  let start = -1;

  for (let lineId = 0; lineId < lines.length; ++lineId) {
    const line = lines[lineId];

    if (regexp == null) {
      for (let i = 0; i < REGIONS_RE.length; ++i) {
        const reg = REGIONS_RE[i];

        if (testLine(line, reg, regionName)) {
          start = lineId + 1;
          regexp = reg;
          break;
        }
      }
    } else if (testLine(line, regexp, regionName, true)) {
      return { start, end: lineId, regexp };
    }
  }

  return null;
};

const getSnippetCache = (env: SnippetEnv): SnippetCache =>
  (env[snippetCacheKey] ??= { files: new Map(), security: new Map() });

// Security verdicts are only reusable inside one render. Clearing them at the
// start of every parse keeps a symlink retargeted between renders (with a
// reused env) from being served a stale "inside root" verdict.
const resetSnippetSecurityCache: CoreRule = (state): void => {
  (state.env as SnippetEnv)[snippetCacheKey]?.security.clear();
};

/*
 * Read a snippet file through the render cache.
 *
 * The entry is revalidated against `statSync` (mtime + size) on every use, so a file rewritten
 * between renders is re-read instead of serving the previous content.
 */
const readSnippetFile = (src: string, cache: SnippetCache): CachedSnippetFile | null => {
  const stats = statSync(src, { throwIfNoEntry: false });

  if (!stats?.isFile()) {
    // Drop any entry from an earlier read so a deleted file does not keep its content around.
    cache.files.delete(src);

    return null;
  }

  const cached = cache.files.get(src);

  if (cached != null && cached.mtimeMs === stats.mtimeMs && cached.size === stats.size)
    return cached;

  const file: CachedSnippetFile = {
    mtimeMs: stats.mtimeMs,
    size: stats.size,
    content: readFileSync(src, "utf-8"),
    regions: new Map(),
  };

  cache.files.set(src, file);

  return file;
};

// Extract a region from the cached file, falling back to the whole file when it does not exist.
const getRegionContent = (file: CachedSnippetFile, region: string): string => {
  const cached = file.regions.get(region);

  if (cached != null) return cached;

  const lines = (file.lines ??= file.content.split(NEWLINE_RE));
  const regionInfo = findRegion(lines, region);

  if (!regionInfo) {
    file.regions.set(region, file.content);

    return file.content;
  }

  const content = dedent(
    lines
      .slice(regionInfo.start, regionInfo.end)
      .filter((line: string) => !regionInfo.regexp.test(line.trim()))
      .join("\n"),
  );

  file.regions.set(region, content);

  return content;
};

const createSnippetRule =
  (
    currentPath: Required<MarkdownItSnippetOptions>["currentPath"],
    resolvePath: Required<MarkdownItSnippetOptions>["resolvePath"],
    checkSecurity: SecurityChecker,
  ): BlockRule =>
  (state, startLine, _endLine, silent) => {
    const env = state.env as SnippetEnv;
    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];

    for (let index = 0; index < 3; ++index)
      if (state.src.charCodeAt(pos + index) !== 60 /* < */ || pos + index >= max) return false;

    // markdown-it invokes block rules with `silent = true` to probe whether the
    // line would start their block. Only report the match here: resolving the
    // path (which may call user callbacks), running the security checker (which
    // reads the filesystem and can throw) and emitting tokens all belong to the
    // real, non-silent parse, which still runs them and surfaces errors as before.
    // Recognition depends only on the `<<<` prefix checked above, so returning
    // here keeps silent and non-silent reporting in agreement.
    if (silent) return true;

    const start = pos + 3;
    const end = state.skipSpacesBack(max, pos);

    /**
     * Raw path format: "/path/to/file.extension#region {meta}" where #region and {meta} are
     * optional and meta can be like '1,2,4-6 lang', 'lang' or '1,2,4-6'
     *
     * Captures: ['/path/to/file.extension', 'extension', '#region', '{meta}']
     */
    const snippetContent = state.src.slice(start, end).trim();
    // the regexp supposes to match any possible snippet format
    // oxlint-disable-next-line typescript/no-non-null-assertion
    const [, snippetPath, snippetMeta] = SNIPPET_RE.exec(snippetContent)!;
    const [, region = "", lines = "", lang = ""] = SNIPPET_META_RE.exec(snippetMeta) ?? [];

    const currentFilePath = currentPath(env);
    const cwd = currentFilePath ? dirname(currentFilePath) : ".";
    const requestedPath = snippetPath.trim();
    const resolvedPath = resolvePath(requestedPath, cwd);
    const absolutePath = resolve(cwd, resolvedPath);
    const ext = extname(absolutePath).slice(1);

    // Both the block rule and the fence renderer validate the path; sharing the
    // render cache means the second check only reads the cached verdict.
    const cache = getSnippetCache(env);

    checkSecurity(requestedPath, absolutePath, cache.security);

    state.line = startLine + 1;

    const token = state.push("fence", "code", 0);

    token.info = `${lang || ext}${lines ? `{${lines}}` : ""}`;
    token.markup = "```";
    token.meta = {
      src: absolutePath,
      region,
      requestedPath,
    };
    token.map = [startLine, startLine + 1];

    return true;
  };

const defaultPathResolver = (filePath: string): string => filePath;

export const snippet: PluginWithOptions<MarkdownItSnippetOptions> = (md, options) => {
  const {
    currentPath,
    resolvePath = defaultPathResolver,
    allowOutsideRoot = false,
    projectRoot,
    denyFiles,
  } = options ?? {};

  if (typeof currentPath !== "function")
    throw new TypeError('[@mdit/plugin-snippet]: "currentPath" is required');

  // A second installation must not register the block rule or wrap the fence renderer twice. As
  // with the other guarded plugins, the first installation's options (including the security
  // checker) stay in effect for repeated installations.
  if (hasRule(md, "snippet", "block")) return;

  const checkSecurity = createSecurityChecker({
    allowOutsideRoot,
    projectRoot,
    denyFiles,
  });

  md.core.ruler.before("normalize", "snippet_security_cache", resetSnippetSecurityCache);

  md.block.ruler.before(
    "fence",
    "snippet",
    createSnippetRule(currentPath, resolvePath, checkSecurity),
  );

  const originalFence = md.renderer.rules.fence;

  md.renderer.rules.fence = (tokens, index, mdItOptions, env, self): string => {
    const token = tokens[index];
    const snippetEnv = env as SnippetEnv;
    const { src, region, requestedPath } = (token.meta ??= {}) as {
      src: string;
      region: string;
      requestedPath?: string;
    };

    if (src) {
      const cache = getSnippetCache(snippetEnv);

      // Re-validate at the actual read site: a custom token can carry `meta.src`
      // without going through the snippet block rule.
      checkSecurity(requestedPath ?? src, src, cache.security);

      try {
        // `statSync` follows symbolic links, so symlinked snippet files are
        // resolved like regular files.
        const file = readSnippetFile(src, cache);

        if (file) {
          token.content = region ? getRegionContent(file, region) : file.content;

          (snippetEnv.snippetFiles ??= []).push(src);
        } else {
          token.content = `Unable to find snippet: ${src}`;
          token.info = "";
        }
      } catch {
        // an unreadable file or directory (e.g. EACCES) should not crash the
        // whole render; degrade to a "Failed to read snippet" result instead
        token.content = `Failed to read snippet: ${src}`;
        token.info = "";
      }
    }

    return originalFence(tokens, index, mdItOptions, env, self);
  };
};
