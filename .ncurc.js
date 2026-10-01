export default {
  cooldown: (pkg) => {
    if (
      ["@mdit/", "@mr-hope/", "@oxfmt/", "@oxlint/", "@vuepress/", "vuepress-"].some((prefix) =>
        pkg.startsWith(prefix),
      ) ||
      [
        "oxc-config-hope",
        "oxfmt",
        "oxlint",
        "vuepress",
        "vuepress-plugin-components",
        "vuepress-plugin-md-enhance",
        "vuepress-shared",
        "vuepress-theme-hope",
      ].includes(pkg)
    )
      return 0;

    return 1;
  },
  workspaces: true,
  peer: true,
  upgrade: true,
  timeout: 360000,
  target: (name) => {
    if (name.startsWith("@vuepress/") || name === "vuepress") return "@next";
    if (name === "@types/node") return "minor";

    return "latest";
  },
};
