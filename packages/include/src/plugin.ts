import fs from "node:fs";

import { type PluginWithOptions } from "markdown-it";
import { type RuleBlock } from "markdown-it/lib/parser_block.js";
import { type RuleCore } from "markdown-it/lib/parser_core.js";
import type Token from "markdown-it/lib/token.js";
import path from "upath";

import { type MarkdownItIncludeOptions } from "./options.js";
import { type IncludeEnv } from "./types.js";
import { NEWLINES_RE, dedent } from "./utils.js";

interface ImportFileLineInfo {
  filePath: string;
  lineStart?: number;
  lineEnd?: number;
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
const INCLUDE_RE =
  /^( *)<!--\s*@include:\s*([^<>|:"*?]+(?:\.[a-z0-9]+))(?:#([\w-]+))?(?:\{(\d+)?-(\d+)?\})?\s*-->\s*$/gm;

const testLine = (
  line: string,
  regexp: RegExp,
  regionName: string,
  end = false,
): boolean => {
  const [full, tag, name] = regexp.exec(line.trim()) || [];

  return Boolean(
    full &&
      tag &&
      name === regionName &&
      tag.match(end ? /^[Ee]nd ?[rR]egion$/ : /^[rR]egion$/),
  );
};

const findRegion = (
  lines: string[],
  regionName: string,
): { lineStart: number; lineEnd: number } | null => {
  let regexp = null;
  let lineStart = -1;

  for (const [lineId, line] of lines.entries())
    if (regexp === null) {
      for (const reg of REGIONS_RE)
        if (testLine(line, reg, regionName)) {
          lineStart = lineId + 1;
          regexp = reg;
          break;
        }
    } else if (testLine(line, regexp, regionName, true)) {
      return { lineStart, lineEnd: lineId };
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
      console.error(
        `[@mdit/plugin-include]: Error when resolving path: ${filePath}`,
      );

      return "\nError when resolving path\n";
    }

    realPath = path.resolve(cwd, filePath);
  }

  includedFiles.push(realPath);

  // check file existence
  if (!fs.existsSync(realPath)) {
    console.error(`[@mdit/plugin-include]: ${realPath} not found`);

    return "\nFile not found\n";
  }

  // read file content
  const fileContent = fs.readFileSync(realPath).toString();

  const lines = fileContent.replace(NEWLINES_RE, "\n").split("\n");
  let results: string[] = [];

  // is region
  if ("region" in info) {
    const region = findRegion(lines, info.region);

    if (region) results = lines.slice(region.lineStart, region.lineEnd);
  }
  // is file
  else {
    const { lineStart, lineEnd } = info;

    if (lineStart) {
      results = lines.slice(lineStart - 1, lineEnd);
    } else if (lines[0] === "---") {
      const endLineIndex = lines.findIndex(
        (line, index) => index !== 0 && line === "---",
      );

      results = lines.slice(Math.max(endLineIndex + 1, 1), lineEnd);
    } else {
      results = lines.slice(0, lineEnd);
    }
  }

  if (resolvedPath && realPath.endsWith(".md")) {
    const dirName = path.dirname(realPath);

    results.unshift(`@include-push(${dirName})`);
    results.push("@include-pop()");
  }

  return dedent(results.join("\n").replace(/\n?$/, "\n"));
};

export const resolveInclude = (
  content: string,
  options: Required<MarkdownItIncludeOptions>,
  { cwd, includedFiles }: IncludeInfo,
): string =>
  content.replace(
    INCLUDE_RE,
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
        {
          filePath: actualPath,
          ...(region
            ? { region }
            : {
                ...(lineStart ? { lineStart: Number(lineStart) } : {}),
                ...(lineEnd ? { lineEnd: Number(lineEnd) } : {}),
              }),
        },
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

export const createIncludeCoreRule =
  (options: Required<MarkdownItIncludeOptions>): RuleCore =>
  (state): void => {
    const env = <IncludeEnv>state.env;
    const includedFiles = env.includedFiles || (env.includedFiles = []);
    const currentPath = options.currentPath(env);

    state.src = resolveInclude(state.src, options, {
      cwd: currentPath ? path.dirname(currentPath) : null,
      includedFiles,
    });
  };

const SYNTAX_PUSH_RE = /^@include-push\(([^)]*?)\)$/;
const SYNTAX_POP_RE = /^@include-pop\(\)$/;

const includePushRule: RuleBlock = (state, startLine, _, silent): boolean => {
  const pos = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];
  const content = state.src.slice(pos, max);
  let result: boolean = content.startsWith("@include-push");

  if (result) {
    // check if it’s matched the syntax
    const match = content.match(SYNTAX_PUSH_RE);

    if (match) {
      if (silent) return true;

      const [, includePath] = match;

      state.line = startLine + 1;
      const token = state.push("include_push", "", 0);

      token.map = [startLine, state.line];
      token.info = includePath;
      token.markup = "include_push";
    } else {
      result = false;
    }
  }

  return result;
};

const includePopRule: RuleBlock = (state, startLine, _, silent): boolean => {
  const pos = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];
  const content = state.src.slice(pos, max);
  let result: boolean = content.startsWith("@include-pop");

  if (result) {
    const match = content.match(SYNTAX_POP_RE);

    if (match) {
      if (silent) return true;

      state.line = startLine + 1;

      const token = state.push("include_pop", "", 0);

      token.map = [startLine, state.line];
      token.markup = "include_pop";
    } else {
      result = false;
    }
  }

  return result;
};

const resolveRelatedLink = (
  attr: string,
  token: Token,
  filePath: string,
  includedPaths?: string[],
): void => {
  const attrIndex = token.attrIndex(attr);
  const url = token.attrs?.[attrIndex][1];

  if (url?.startsWith(".") && Array.isArray(includedPaths)) {
    const { length } = includedPaths;

    if (length) {
      const includeDir = path.relative(
        path.dirname(filePath),
        includedPaths[length - 1],
      );

      const resolvedPath = path.join(includeDir, url);

      token.attrs![attrIndex][1] = resolvedPath.startsWith(".")
        ? resolvedPath
        : `./${resolvedPath}`;
    }
  }
};

export const include: PluginWithOptions<MarkdownItIncludeOptions> = (
  md,
  options,
): void => {
  const {
    currentPath,
    resolvePath = (path: string): string => path,
    deep = false,
    resolveLinkPath = true,
    resolveImagePath = true,
  } = options || {};

  if (typeof currentPath !== "function")
    return console.error('[@mdit/plugin-include]: "currentPath" is required');

  // add md_import core rule
  md.core.ruler.after(
    "normalize",
    "md_import",
    createIncludeCoreRule({
      currentPath,
      resolvePath,
      deep,
      resolveLinkPath,
      resolveImagePath,
    }),
  );

  if (resolveImagePath || resolveLinkPath) {
    md.block.ruler.before("table", "md_include_push", includePushRule, {
      alt: ["paragraph", "reference", "blockquote", "list"],
    });
    md.block.ruler.before("table", "md_include_pop", includePopRule, {
      alt: ["paragraph", "reference", "blockquote", "list"],
    });

    md.renderer.rules["include_push"] = (
      tokens,
      index,
      _options,
      env: IncludeEnv,
    ): string => {
      const token = tokens[index];
      const includedPaths = (env.includedPaths ??= []);

      includedPaths.push(token.info);

      return "";
    };

    md.renderer.rules["include_pop"] = (
      _tokens,
      _index,
      _options,
      env: IncludeEnv,
    ): string => {
      const includedPaths = env.includedPaths;

      if (Array.isArray(includedPaths)) includedPaths.pop();
      else
        console.error(
          `[@mdit/plugin-include]: include_pop failed, no include_push.`,
        );

      return "";
    };

    if (resolveImagePath) {
      const defaultImageRenderer = md.renderer.rules.image!;

      md.renderer.rules.image = (
        tokens,
        index,
        options,
        env: IncludeEnv,
        self,
      ): string => {
        const token = tokens[index];
        const path = currentPath(env);

        if (path) resolveRelatedLink("src", token, path, env.includedPaths);

        // pass token to default renderer.
        return defaultImageRenderer(tokens, index, options, env, self);
      };
    }

    if (resolveLinkPath) {
      const defaultLinkRenderer =
        md.renderer.rules["link_open"] ||
        ((tokens, index, options, _env, self): string =>
          self.renderToken(tokens, index, options));

      md.renderer.rules["link_open"] = (
        tokens,
        index,
        options,
        env: IncludeEnv,
        self,
      ): string => {
        const token = tokens[index];
        const path = currentPath(env);

        if (path) resolveRelatedLink("href", token, path, env.includedPaths);

        // pass token to default renderer.
        return defaultLinkRenderer(tokens, index, options, env, self);
      };
    }
  }
};
