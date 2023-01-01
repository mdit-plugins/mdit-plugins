import MarkdownIt from "markdown-it";
import { snippet } from "@mdit/plugin-snippet";

// #region snippet
const mdIt = MarkdownIt().use(snippet, {
  // your options, currentPath is required
  currentPath: (env) => env.filePath,
});
// #endregion snippet

mdIt.render("<<< snippet.ts", {
  filePath: "path/to/current/file.md",
});
