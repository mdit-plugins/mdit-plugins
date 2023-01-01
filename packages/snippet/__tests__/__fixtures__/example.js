const MarkdownIt = require("markdown-it");
const { snippet } = require("@mdit/plugin-snippet");

// #region snippet
const mdIt = MarkdownIt().use(snippet, {
  // your options, currentPath is required
  currentPath: (env) => env.filePath,
});
// #endregion snippet

mdIt.render("<<< snippet.js", {
  filePath: "path/to/current/file.md",
});
