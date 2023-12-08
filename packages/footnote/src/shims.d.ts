declare module "markdown-it/lib/helpers/parse_link_label.mjs" {
  import parseLinkLabel from "markdown-it/lib/helpers/parse_link_label.js";

  export * from "markdown-it/lib/helpers/parse_link_label.js";
  export default parseLinkLabel;
}

declare module "markdown-it/lib/token.mjs" {
  import Token from "markdown-it/lib/token.js";

  export * from "markdown-it/lib/token.js";
  export default Token;
}
