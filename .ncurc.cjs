// oxlint-disable import/no-commonjs, import/unambiguous
// oxlint-disable-next-line typescript/no-require-imports, typescript/no-unsafe-call
const { defineConfig } = require("npm-check-updates");

module.exports = defineConfig({
  workspaces: true,
  peer: true,
  upgrade: true,
  timeout: 360000,
  target: (name) => {
    if (name.startsWith("@vuepress/") || name === "vuepress") return "@next";
    if (name === "@types/node") return "minor";

    return "latest";
  },
});
