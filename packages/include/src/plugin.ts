import fs from "node:fs";
import path from "upath";
import { NEWLINES_RE } from "./utils.js";

import type { PluginWithOptions } from "markdown-it";
import type { RuleBlock } from "markdown-it/lib/parser_block.js";
import type { RuleCore } from "markdown-it/lib/parser_core.js";
import type Token from "markdown-it/lib/token.js";
import type { MarkdownItIncludeOptions } from "./options.js";
import type { IncludeEnv } from "./types.js";

interface ImportFileLineInfo {
  filePath: string;
  lineStart: number;
  lineEnd: number | undefined;
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

const INDENT_RE = /^([ \t]*)(.*)\n/gm;
const REGIONS_RE = [
  /^<!-- ?#?((?:end)?region) ([\w*-]+) ?-->$/, // markdown
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
  /^@include\(([^)]+(?:\.[a-z0-9]+))(?:#([\w-]+))?(?:\{(\d+)?-(\d+)?\})?\)$/;

const dedent = (text: string): string => {
  let match: RegExpMatchArray | null;
  let minIndentLength = null;

  while ((match = INDENT_RE.exec(text)) !== null) {
    const [indentation, content] = match.slice(1);

    if (!content) continue;

    const indentLength = indentation.length;

    if (indentLength > 0) {
      minIndentLength =
        minIndentLength !== null
          ? Math.min(minIndentLength, indentLength)
          : indentLength;
    } else break;
  }

  if (minIndentLength) {
    text = text.replace(
      new RegExp(`^[ \t]{${minIndentLength}}(.*)`, "gm"),
      "$1"
    );
  }

  return text;
};

const testLine = (
  line: string,
  regexp: RegExp,
  regionName: string,
  end = false
): boolean => {
  const [full, tag, name] = regexp.exec(line.trim()) || [];

  return Boolean(
    full &&
      tag &&
      name === regionName &&
      tag.match(end ? /^[Ee]nd ?[rR]egion$/ : /^[rR]egion$/)
  );
};

const findRegion = (
  lines: string[],
  regionName: string
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
    } else if (testLine(line, regexp, regionName, true))
      return { lineStart, lineEnd: lineId };

  return null;
};

export const handleInclude = (
  info: ImportFileInfo,
  { cwd, includedFiles, resolvedPath }: IncludeInfo
): string => {
  const { filePath } = info;
  let realPath = filePath;

  if (!path.isAbsolute(filePath)) {
    // if the importPath is relative path, we need to resolve it
    // according to the markdown filePath
    if (!cwd) {
      console.error(
        `[@mdit/plugin-include]: Error when resolving path: ${filePath}`
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

  if ("region" in info) {
    const region = findRegion(lines, info.region);

    if (region) results = lines.slice(region.lineStart, region.lineEnd);
  } else {
    const { lineStart, lineEnd } = info;

    results = lines.slice(lineStart ? lineStart - 1 : lineStart, lineEnd);
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
  { cwd, includedFiles }: IncludeInfo
): string =>
  content
    .split("\n")
    .map((line) => {
      if (line.startsWith("@include")) {
        // check if it’s matched the syntax
        const result = line.match(INCLUDE_RE);

        if (result) {
          const [, includePath, region, lineStart, lineEnd] = result;
          const actualPath = options.getPath(includePath, cwd);
          const resolvedPath =
            options.resolveImagePath || options.resolveLinkPath;

          const content = handleInclude(
            {
              filePath: actualPath,
              ...(region
                ? { region }
                : {
                    lineStart: lineStart ? Number(lineStart) : 0,
                    lineEnd: lineEnd ? Number(lineEnd) : undefined,
                  }),
            },
            { cwd, includedFiles, resolvedPath }
          );

          return options.deep && actualPath.endsWith(".md")
            ? resolveInclude(content, options, {
                cwd: path.isAbsolute(actualPath)
                  ? path.dirname(actualPath)
                  : cwd
                  ? path.resolve(cwd, path.dirname(actualPath))
                  : null,
                includedFiles,
              })
            : content;
        }
      }

      return line;
    })
    .join("\n");

export const createIncludeCoreRule =
  (options: Required<MarkdownItIncludeOptions>): RuleCore =>
  (state): void => {
    const env = <IncludeEnv>state.env;
    const includedFiles = env.includedFiles || (env.includedFiles = []);
    const currentPath = options.getCurrentPath(env);

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
    } else result = false;
  }

  return result;
};

const resolveRelatedLink = (
  attr: string,
  token: Token,
  filePath: string,
  includedPaths?: string[]
): void => {
  const attrIndex = token.attrIndex(attr);
  const url = token.attrs?.[attrIndex][1];

  if (url?.startsWith(".") && Array.isArray(includedPaths)) {
    const { length } = includedPaths;

    if (length) {
      const includeDir = path.relative(
        path.dirname(filePath),
        includedPaths[length - 1]
      );

      token.attrs![attrIndex][1] = `.${path.sep}${path.join(includeDir, url)}`;
    }
  }
};

export const include: PluginWithOptions<MarkdownItIncludeOptions> = (
  md,
  options
): void => {
  const {
    getCurrentPath,
    getPath = (path: string): string => path,
    deep = false,
    resolveLinkPath = true,
    resolveImagePath = true,
  } = options || {};

  if (typeof getCurrentPath !== "function")
    return console.error(
      '[@mdit/plugin-include]: "getCurrentPath" is required'
    );

  // add md_import core rule
  md.core.ruler.after(
    "normalize",
    "md_import",
    createIncludeCoreRule({
      getCurrentPath,
      getPath,
      deep,
      resolveLinkPath,
      resolveImagePath,
    })
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
      env: IncludeEnv
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
      env: IncludeEnv
    ): string => {
      const includedPaths = env.includedPaths;

      if (Array.isArray(includedPaths)) includedPaths.pop();
      else
        console.error(
          `[@mdit/plugin-include]: include_pop failed, no include_push.`
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
        self
      ): string => {
        const token = tokens[index];
        const currentPath = getCurrentPath(env);

        if (currentPath)
          resolveRelatedLink("src", token, currentPath, env.includedPaths);

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
        self
      ): string => {
        const token = tokens[index];
        const currentPath = getCurrentPath(env);

        if (currentPath)
          resolveRelatedLink("href", token, currentPath, env.includedPaths);

        // pass token to default renderer.
        return defaultLinkRenderer(tokens, index, options, env, self);
      };
    }
  }
};
