import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { plantuml } from "../src/index.js";

describe("plantuml renderer idempotency", () => {
  it("should render the same output in uml mode", () => {
    const md = new MarkdownIt().use(plantuml);
    const tokens = md.parse("@startuml\nBob -> Alice : hello\n@enduml\n", {});

    const firstRender = md.renderer.render(tokens, md.options, {});
    const secondRender = md.renderer.render(tokens, md.options, {});

    expect(firstRender).toContain('<img src="https://www.plantuml.com/plantuml/svg/');
    expect(firstRender).toContain('alt="PlantUML Diagram"');
    expect(secondRender).toBe(firstRender);
  });

  it("should render the same output in fence mode", () => {
    const md = new MarkdownIt().use(plantuml, { type: "fence" });
    const tokens = md.parse("```uml\nBob -> Alice : hello\n```\n", {});

    const firstRender = md.renderer.render(tokens, md.options, {});
    const secondRender = md.renderer.render(tokens, md.options, {});

    expect(firstRender).toContain('<img src="https://www.plantuml.com/plantuml/svg/');
    expect(firstRender).toContain('alt="PlantUML Diagram"');
    expect(secondRender).toBe(firstRender);
  });
});
