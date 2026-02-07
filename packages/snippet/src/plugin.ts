import fs from "node:fs";

import { NEWLINE_RE, dedent } from "@mdit/helper";
import type { Options, PluginWithOptions } from "markdown-it";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";
import type Renderer from "markdown-it/lib/renderer.mjs";
import type Token from "markdown-it/lib/token.mjs";
import path from "upath";

import type { MarkdownItSnippetOptions } from "./options.js";
import type { SnippetEnv } from "./types.js";

const REGIONS_RE = [
  /^\/\/ ?#?((?:end)?region) ([\w*-]+)$/, // javascript, typescript, java
  /^\/\* ?#((?:end)?region) ([\w*-]+) ?\*\/$/, // css, less, scss
  /^#pragma ((?:end)?region) ([\w*-]+)$/, // C, C++
  /^<!-- #?((?:end)?region) ([\w*-]+) -->$/, // HTML, markdown
  /^#((?:End )Region) ([\w*-]+)$/, // Visual Basic
  /^::#((?:end)region) ([\w*-]+)$/, // Bat
  /^# ?((?:end)?region) ([\w*-]+)$/, // C#, PHP, Powershell, Python, perl & misc
];
const SNIPPET_RE = /^([^#{]*)((?:[#{}].*)?)$/;
const SNIPPET_META_RE = /^(?:#([\w-]+))?(?: ?(?:{(\d+(?:[,-]\d+)*)? ?(\S+)?}))?$/;
const REGION_START_MARKER_RE = /^[rR]egion$/;
const REGION_END_MARKER_RE = /^[Ee]nd ?[rR]egion$/;

const testLine = (line: string, regexp: RegExp, regionName: string, end = false): boolean => {
  const [full, tag, name] = regexp.exec(line.trimStart()) ?? [];

  return Boolean(
    full &&
    tag &&
    name === regionName &&
    tag.match(end ? REGION_END_MARKER_RE : REGION_START_MARKER_RE),
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

const getSnippetRule =
  (
    currentPath: Required<MarkdownItSnippetOptions>["currentPath"],
    resolvePath: Required<MarkdownItSnippetOptions>["resolvePath"],
  ): RuleBlock =>
  (state, startLine, _endLine, silent) => {
    const env = state.env as SnippetEnv;
    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];

    for (let index = 0; index < 3; ++index)
      if (state.src.charCodeAt(pos + index) !== 60 /* < */ || pos + index >= max) return false;

    if (silent) return true;

    const start = pos + 3;
    const end = state.skipSpacesBack(max, pos);

    /**
     * raw path format: "/path/to/file.extension#region {meta}"
     *    where #region and {meta} are optional
     *    and meta can be like '1,2,4-6 lang', 'lang' or '1,2,4-6'
     *
     * captures: ['/path/to/file.extension', 'extension', '#region', '{meta}']
     */
    const currentFilePath = currentPath(env);
    const snippetContent = state.src.slice(start, end).trim();
    // the regexp supposes to match any possible snippet format
    // oxlint-disable-next-line typescript/no-non-null-assertion
    const [, snippetPath, snippetMeta] = SNIPPET_RE.exec(snippetContent)!;
    const [, region = "", lines = "", lang = ""] = SNIPPET_META_RE.exec(snippetMeta) ?? [];

    const cwd = currentFilePath ? path.dirname(currentFilePath) : ".";
    const resolvedPath = resolvePath(snippetPath.trim(), cwd);
    const absolutePath = path.resolve(cwd, resolvedPath);
    const ext = path.extname(absolutePath).slice(1);

    state.line = startLine + 1;

    const token = state.push("fence", "code", 0);

    token.info = `${lang || ext}${lines ? `{${lines}}` : ""}`;
    token.markup = "```";
    token.meta = {
      src: absolutePath,
      region,
    };
    token.map = [startLine, startLine + 1];

    return true;
  };

const defaultPathResolver = (path: string): string => path;

export const snippet: PluginWithOptions<MarkdownItSnippetOptions> = (md, options) => {
  const { currentPath, resolvePath = defaultPathResolver } = options ?? {};

  if (typeof currentPath !== "function")
    throw new TypeError('[@mdit/plugin-snippet]: "currentPath" is required');

  md.block.ruler.before("fence", "snippet", getSnippetRule(currentPath, resolvePath));

  // oxlint-disable-next-line typescript/no-non-null-assertion
  const originalFence = md.renderer.rules.fence!;

  md.renderer.rules.fence = (
    tokens: Token[],
    index: number,
    options: Options,
    env: SnippetEnv,
    self: Renderer,
  ): string => {
    const token = tokens[index];
    const { src, region } = (token.meta ??= {}) as {
      src: string;
      region: string;
    };

    if (src) {
      if (fs.lstatSync(src, { throwIfNoEntry: false })?.isFile()) {
        let content = fs.readFileSync(src, "utf-8");

        if (region) {
          const lines = content.split(NEWLINE_RE);
          const regionInfo = findRegion(lines, region);

          if (regionInfo) {
            content = dedent(
              lines
                .slice(regionInfo.start, regionInfo.end)
                .filter((line: string) => !regionInfo.regexp.test(line.trim()))
                .join("\n"),
            );
          }
        }

        token.content = content;

        (env.snippetFiles ??= []).push(src);
      } else {
        token.content = `Code snippet path not found: ${src}`;
        token.info = "";
      }
    }

    return originalFence(tokens, index, options, env, self);
  };
};
