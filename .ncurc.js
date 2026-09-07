export default {
  cooldown: (name) => {
    if (name.startsWith("@vuepress/") || name === "vuepress" || name.startsWith("vuepress-"))
      return "0";

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
