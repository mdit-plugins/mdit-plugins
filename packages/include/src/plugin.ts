// oxlint-disable-next-line import/no-nodejs-modules
import fs from "node:fs";

import { NEWLINE_RE, dedent } from "@mdit/helper";
import type { PluginWithOptions } from "markdown-it";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";
import type { RuleCore } from "markdown-it/lib/parser_core.mjs";
import type Token from "markdown-it/lib/token.mjs";
import path from "upath";

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
}

const REGIONS_RE = [
  /^\/\/ ?#?((?:end)?region) ([\w*-]+)$/, // javascript, typescript, java
  /^\/\* ?#((?:end)?region) ([\w*-]+) ?\*\/$/, // css, less, scss
  /^#pragma ((?:end)?region) ([\w*-]+)$/, // C, C++
  /^<!-- #?((?:end)?region) ([\w*-]+) -->$/, // HTML, markdown
  /^#((?:End )Region) ([\w*-]+)$/, // Visual Basic
  /^::#((?:end)region) ([\w*-]+)$/, // Bat
  /^# ?((?:end)?region) ([\w*-]+)$/, // C#, PHP, Powershell, Python, perl & misc
];

// regexp to match the import syntax
const INCLUDE_COMMENT_RE =
  /^( *)<!-{2,}\s*@include:\s*([^<>|:"*?]+(?:\.[a-z0-9]+))(?:#([\w-]+))?(?:\{(\d+)?-(\d+)?\})?\s*-{2,}>\s*$/gm;
const INCLUDE_RE =
  /^( *)@include:\s*([^<>|:"*?]+(?:\.[a-z0-9]+))(?:#([\w-]+))?(?:\{(\d+)?-(\d+)?\})?\s*$/gm;

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

  if (!path.isAbsolute(filePath)) {
    // if the importPath is relative path, we need to resolve it
    // according to the markdown filePath
    if (!cwd) {
      // oxlint-disable-next-line no-console
      console.error(`[@mdit/plugin-include]: Error when resolving path: ${filePath}`);

      return "\nError when resolving path\n";
    }

    realPath = path.resolve(cwd, filePath);
  }

  includedFiles.push(realPath);

  // check file existence
  if (!fs.existsSync(realPath)) {
    // oxlint-disable-next-line no-console
    console.error(`[@mdit/plugin-include]: ${realPath} not found`);

    return "\nFile not found\n";
  }

  // read file content
  const fileContent = fs.readFileSync(realPath).toString();

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
    const dirName = path.dirname(realPath);

    results.unshift(`<!-- #include-env-start: ${dirName} -->`);
    results.push("<!-- #include-env-end -->");
  }

  return dedent(results.join("\n").replace(/\n?$/, "\n"));
};

export const resolveInclude = (
  content: string,
  options: Required<MarkdownItIncludeOptions>,
  { cwd, includedFiles }: IncludeInfo,
): string =>
  content.replace(
    options.useComment ? INCLUDE_COMMENT_RE : INCLUDE_RE,
    // oxlint-disable-next-line max-params
    (
      _,
      indent: string,
      includePath: string,
      region?: string,
      lineStart?: string,
      lineEnd?: string,
    ) => {
      const actualPath = options.resolvePath(includePath, cwd);
      const resolvedPath = options.resolveImagePath || options.resolveLinkPath;

      const content = handleInclude(
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

      return (
        options.deep && actualPath.endsWith(".md")
          ? resolveInclude(content, options, {
              cwd: path.isAbsolute(actualPath)
                ? path.dirname(actualPath)
                : cwd
                  ? path.resolve(cwd, path.dirname(actualPath))
                  : null,
              includedFiles,
            })
          : content
      )
        .split("\n")
        .map((line) => indent + line)
        .join("\n");
    },
  );

const SYNTAX_PUSH_RE = /^<!-- #include-env-start: ([^)]*?) -->$/;

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
      const includeDir = path.relative(path.dirname(filePath), includedPaths[length - 1]);

      const resolvedPath = path.join(includeDir, url);

      // oxlint-disable-next-line typescript/no-non-null-assertion
      token.attrs![attrIndex][1] = resolvedPath[0] === "." ? resolvedPath : `./${resolvedPath}`;
    }
  }
};

export const include: PluginWithOptions<MarkdownItIncludeOptions> = (md, options): void => {
  const {
    currentPath,
    resolvePath = (path: string): string => path,
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
        cwd: filePath ? path.dirname(filePath) : null,
        includedFiles,
      },
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

      md.renderer.rules.image = (tokens, index, options, env: IncludeEnv, self): string => {
        const token = tokens[index];
        const path = currentPath(env);

        if (path) resolveRelatedLink("src", token, path, env.includedPaths);

        // pass token to default renderer.
        return defaultImageRender(tokens, index, options, env, self);
      };
    }

    if (resolveLinkPath) {
      const defaultLinkRender =
        md.renderer.rules.link_open ??
        ((tokens, index, options, _env, self): string => self.renderToken(tokens, index, options));

      md.renderer.rules.link_open = (tokens, index, options, env: IncludeEnv, self): string => {
        const token = tokens[index];
        const path = currentPath(env);

        if (path) resolveRelatedLink("href", token, path, env.includedPaths);

        // pass token to default renderer.
        return defaultLinkRender(tokens, index, options, env, self);
      };
    }
  }
};
