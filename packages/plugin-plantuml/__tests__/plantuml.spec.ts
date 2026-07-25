import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { plantuml } from "../src/index.js";

describe(plantuml, () => {
  it("should render without options", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(plantuml);

    const result = markdownIt.render(`
@startuml
Bob -> Alice : hello
@enduml
    `);

    expect(result).toMatchSnapshot();
    expect(result).toMatch(/<img src=".*" alt=".*">/);
  });

  it("should render now-ascii characters", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(plantuml);

    const result = markdownIt.render(`
@startuml
Bob -> Alice : 你好
@enduml
    `);

    expect(result).toMatchSnapshot();
    expect(result).toMatch(/<img src=".*" alt=".*">/);
  });

  it("should parse custom uml", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(plantuml, {
      name: "json",
    });

    const result = markdownIt.render(`
@startjson
{
  "firstName": "John",
  "lastName": "Smith",
  "isAlive": true,
  "age": 27,
  "address": {
    "streetAddress": "21 2nd Street",
    "city": "New York",
    "state": "NY",
    "postalCode": "10021-3100"
  },
  "phoneNumbers": [
    {
      "type": "home",
      "number": "212 555-1234"
    },
    {
      "type": "office",
      "number": "646 555-4567"
    }
  ],
  "children": [],
  "spouse": null
}
@endjson
    `);

    expect(result).toMatchSnapshot();
    expect(result).toMatch(/<img src=".*" alt=".*">/);
  });

  it("should parse code block", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(plantuml, {
      type: "fence",
    });

    const result = markdownIt.render(`
\`\`\`uml
Bob -> Alice : hello
\`\`\`
    `);

    expect(result).toMatchSnapshot();
    expect(result).toMatch(/<img src=".*" alt=".*">/);
  });

  it("should parse custom code block", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(plantuml, {
      type: "fence",
      name: "json",
      fence: "jsonuml",
    });

    const result = markdownIt.render(`
\`\`\`jsonuml
{
  "firstName": "John",
  "lastName": "Smith",
  "isAlive": true,
  "age": 27,
  "address": {
    "streetAddress": "21 2nd Street",
    "city": "New York",
    "state": "NY",
    "postalCode": "10021-3100"
  },
  "phoneNumbers": [
    {
      "type": "home",
      "number": "212 555-1234"
    },
    {
      "type": "office",
      "number": "646 555-4567"
    }
  ],
  "children": [],
  "spouse": null
}
\`\`\`
    `);

    expect(result).toMatchSnapshot();
    expect(result).toMatch(/<img src=".*" alt=".*">/);
  });

  it("should not break normal code block", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(plantuml, {
      type: "fence",
    });

    const result = markdownIt.render(`
\`\`\`js
const a = 1
\`\`\`
    `);

    expect(result).toMatchSnapshot();
    expect(result).toMatch(/<pre><code[\s\S]*<\/code><\/pre>/);
  });

  it("should support alt text in fence info", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(plantuml, {
      type: "fence",
    });

    const result = markdownIt.render(`
\`\`\`uml This is my alt text
Bob -> Alice : hello
\`\`\`
    `);

    expect(result).toMatchSnapshot();
    expect(result).toMatch(/alt="This is my alt text"/);
  });

  it("should support custom server and format", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(plantuml, {
      server: "https://my-server.com",
      format: "png",
    });

    const result = markdownIt.render(`
@startuml
Bob -> Alice : hello
@enduml
    `);

    expect(result).toContain("https://my-server.com/png/");
  });

  it("should support custom srcGetter", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(plantuml, {
      srcGetter: (content) => `https://custom.com/${content.length}`,
    });

    const result = markdownIt.render(`
@startuml
Bob -> Alice : hello
@enduml
    `);

    expect(result).toContain('src="https://custom.com/20"');
  });
});
