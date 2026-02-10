import markdownit from "markdown-it";
import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

import { bare as emoji_bare, light as emoji_light, full as emoji_full } from "../src/index.js";

// data for integrity check testing
import emojies_shortcuts from "../src/data/shortcuts.js";
import emojies_defs from "../src/data/full.js";
import emojies_defs_light from "../src/data/light.js";

describe("markdown-it-emoji", () => {
  describe("default", () => {
    const md = markdownit().use(emoji_full);

    describe("aliases", () => {
      it("alias + original", () => {
        expect(md.render(":) :smiley:")).toBe("<p>😃 😃</p>\n");
      });

      it("2 differend aliases", () => {
        expect(md.render(":D :-D")).toBe("<p>😄 😄</p>\n");
      });

      it("Potentially conflicting", () => {
        expect(md.render(":/ :/. :/")).toBe("<p>😕 😕. 😕</p>\n");
      });

      it("should not conflict with URLs", () => {
        expect(md.render("http://google.com")).toBe("<p>http://google.com</p>\n");
      });

      it("should not conflict with win paths", () => {
        expect(md.render(String.raw`c:\windows`)).toBe("<p>c:\\windows</p>\n");
      });

      it("should not appear inside words", () => {
        expect(md.render("User:Preferences :P")).toBe("<p>User:Preferences 😛</p>\n");
      });
    });

    describe("emojis", () => {
      it("Start of string", () => {
        expect(md.render(":smile: test __1__")).toBe("<p>😄 test <strong>1</strong></p>\n");
      });

      it("End of string", () => {
        expect(md.render("test __2__ :laughing:")).toBe("<p>test <strong>2</strong> 😆</p>\n");
      });

      it("Middle & multiple", () => {
        expect(md.render("aaa :joy: bbb :blush: ccc :kissing_heart: ddd")).toBe(
          "<p>aaa 😂 bbb 😊 ccc 😘 ddd</p>\n",
        );
      });

      it("Unknown name", () => {
        expect(md.render(":joy: :qwerty:")).toBe("<p>😂 :qwerty:</p>\n");
      });

      it("Don't allow letters after shortcuts", () => {
        expect(md.render(":) :)123 :)abc")).toBe("<p>😃 :)123 :)abc</p>\n");
      });
    });

    describe("full", () => {
      it("should support full set of emoji names", () => {
        expect(md.render(":100:")).toBe("<p>💯</p>\n");
      });
    });
  });

  describe("options", () => {
    const md = markdownit().use(emoji_full, {
      defs: {
        one: "!!!one!!!",
        fifty: "!!50!!",
      },
      shortcuts: {
        fifty: [":50", "|50"],
        one: ":uno",
      },
    });

    it("emojis", () => {
      expect(md.render(":one: aaa :fifty:")).toBe("<p>!!!one!!! aaa !!50!!</p>\n");
    });

    it("shortcuts", () => {
      expect(md.render(":50 |50 :uno aaa")).toBe("<p>!!50!! !!50!! !!!one!!! aaa</p>\n");
    });

    it("skip rewritten defaults", () => {
      expect(md.render(":smile: :)")).toBe("<p>:smile: :)</p>\n");
    });
  });

  describe("whitelist", () => {
    const md = markdownit().use(emoji_full, { enabled: ["smile", "grin"] });

    it("Show only allowed emojies", () => {
      expect(md.render(":smile: :grin: :wink:")).toBe("<p>😄 😁 :wink:</p>\n");
    });
  });

  describe("autolinks", () => {
    const md = markdownit({ linkify: true }).use(emoji_full);

    it("disallow shortcuts inside autolinks", () => {
      expect(md.render("<http://www.example.org/wiki/Special:Preferences> :P")).toBe(
        '<p><a href="http://www.example.org/wiki/Special:Preferences">http://www.example.org/wiki/Special:Preferences</a> 😛</p>\n',
      );
    });

    it("disallow emojis inside autolinks", () => {
      expect(
        md.render(
          "<http://www.example.org/foo:joy:bar> :joy:\n\n[bar](http://www.example.org/foo:joy:)",
        ),
      ).toBe(
        '<p><a href="http://www.example.org/foo:joy:bar">http://www.example.org/foo:joy:bar</a> 😂</p>\n<p><a href="http://www.example.org/foo:joy:">bar</a></p>\n',
      );
    });

    it("disallow shortcuts inside linkified text", () => {
      expect(md.render("http://www.example.org/wiki/Special:Preferences :P")).toBe(
        '<p><a href="http://www.example.org/wiki/Special:Preferences">http://www.example.org/wiki/Special:Preferences</a> 😛</p>\n',
      );
    });

    it("disallow emojis inside linkified text", () => {
      expect(md.render("http://www.example.org/foo:joy:bar :joy:")).toBe(
        '<p><a href="http://www.example.org/foo:joy:bar">http://www.example.org/foo:joy:bar</a> 😂</p>\n',
      );
    });
  });
});

describe("markdown-it-emoji-light", () => {
  describe("default", () => {
    const md = markdownit().use(emoji_light);

    describe("aliases", () => {
      it("alias + original", () => {
        expect(md.render(":) :smiley:")).toBe("<p>😃 😃</p>\n");
      });

      it("2 differend aliases", () => {
        expect(md.render(":D :-D")).toBe("<p>😄 😄</p>\n");
      });

      it("Potentially conflicting", () => {
        expect(md.render(":/ :/. :/")).toBe("<p>😕 😕. 😕</p>\n");
      });

      it("should not conflict with URLs", () => {
        expect(md.render("http://google.com")).toBe("<p>http://google.com</p>\n");
      });

      it("should not conflict with win paths", () => {
        expect(md.render(String.raw`c:\windows`)).toBe("<p>c:\\windows</p>\n");
      });

      it("should not appear inside words", () => {
        expect(md.render("User:Preferences :P")).toBe("<p>User:Preferences 😛</p>\n");
      });
    });

    describe("emojis", () => {
      it("Start of string", () => {
        expect(md.render(":smile: test __1__")).toBe("<p>😄 test <strong>1</strong></p>\n");
      });

      it("End of string", () => {
        expect(md.render("test __2__ :laughing:")).toBe("<p>test <strong>2</strong> 😆</p>\n");
      });

      it("Middle & multiple", () => {
        expect(md.render("aaa :joy: bbb :blush: ccc :kissing_heart: ddd")).toBe(
          "<p>aaa 😂 bbb 😊 ccc 😘 ddd</p>\n",
        );
      });

      it("Unknown name", () => {
        expect(md.render(":joy: :qwerty:")).toBe("<p>😂 :qwerty:</p>\n");
      });

      it("Don't allow letters after shortcuts", () => {
        expect(md.render(":) :)123 :)abc")).toBe("<p>😃 :)123 :)abc</p>\n");
      });
    });

    describe("light", () => {
      it("should fail on stripped emoji names", () => {
        expect(md.render(":100:")).toBe("<p>:100:</p>\n");
      });
    });
  });

  describe("options", () => {
    const md = markdownit().use(emoji_light, {
      defs: {
        one: "!!!one!!!",
        fifty: "!!50!!",
      },
      shortcuts: {
        fifty: [":50", "|50"],
        one: ":uno",
      },
    });

    it("emojis", () => {
      expect(md.render(":one: aaa :fifty:")).toBe("<p>!!!one!!! aaa !!50!!</p>\n");
    });

    it("shortcuts", () => {
      expect(md.render(":50 |50 :uno aaa")).toBe("<p>!!50!! !!50!! !!!one!!! aaa</p>\n");
    });

    it("skip rewritten defaults", () => {
      expect(md.render(":smile: :)")).toBe("<p>:smile: :)</p>\n");
    });
  });

  describe("whitelist", () => {
    const md = markdownit().use(emoji_light, { enabled: ["smile", "grin"] });

    it("Show only allowed emojies", () => {
      expect(md.render(":smile: :grin: :wink:")).toBe("<p>😄 😁 :wink:</p>\n");
    });
  });

  describe("autolinks", () => {
    const md = markdownit({ linkify: true }).use(emoji_full);

    it("disallow shortcuts inside autolinks", () => {
      expect(md.render("<http://www.example.org/wiki/Special:Preferences> :P")).toBe(
        '<p><a href="http://www.example.org/wiki/Special:Preferences">http://www.example.org/wiki/Special:Preferences</a> 😛</p>\n',
      );
    });

    it("disallow emojis inside autolinks", () => {
      expect(
        md.render(
          "<http://www.example.org/foo:joy:bar> :joy:\n\n[bar](http://www.example.org/foo:joy:)",
        ),
      ).toBe(
        '<p><a href="http://www.example.org/foo:joy:bar">http://www.example.org/foo:joy:bar</a> 😂</p>\n<p><a href="http://www.example.org/foo:joy:">bar</a></p>\n',
      );
    });

    it("disallow shortcuts inside linkified text", () => {
      expect(md.render("http://www.example.org/wiki/Special:Preferences :P")).toBe(
        '<p><a href="http://www.example.org/wiki/Special:Preferences">http://www.example.org/wiki/Special:Preferences</a> 😛</p>\n',
      );
    });

    it("disallow emojis inside linkified text", () => {
      expect(md.render("http://www.example.org/foo:joy:bar :joy:")).toBe(
        '<p><a href="http://www.example.org/foo:joy:bar">http://www.example.org/foo:joy:bar</a> 😂</p>\n',
      );
    });
  });
});

describe("markdown-it-emoji-bare", () => {
  describe("default", () => {
    const md = markdownit().use(emoji_bare);

    describe("bare", () => {
      it("don't convert emojis without definitions", () => {
        expect(md.render(":smile:")).toBe("<p>:smile:</p>\n");
      });
    });
  });

  describe("options", () => {
    const md = markdownit().use(emoji_bare, {
      defs: {
        one: "!!!one!!!",
        fifty: "!!50!!",
      },
      shortcuts: {
        fifty: [":50", "|50"],
        one: ":uno",
      },
    });

    it("emojis", () => {
      expect(md.render(":one: aaa :fifty:")).toBe("<p>!!!one!!! aaa !!50!!</p>\n");
    });

    it("shortcuts", () => {
      expect(md.render(":50 |50 :uno aaa")).toBe("<p>!!50!! !!50!! !!!one!!! aaa</p>\n");
    });

    it("skip rewritten defaults", () => {
      expect(md.render(":smile: :)")).toBe("<p>:smile: :)</p>\n");
    });
  });
});

describe("integrity", () => {
  it("all shortcuts should exist", () => {
    Object.keys(emojies_shortcuts).forEach((name) => {
      expect(emojies_defs[name], "shortcut doesn't exist: " + name).toBeTruthy();
    });
  });

  it('no chars with "uXXXX" names allowed', () => {
    Object.keys(emojies_defs).forEach((name) => {
      if (/^u[0-9a-b]{4,}$/i.test(name)) {
        throw new Error("Name " + name + " not allowed");
      }
    });
  });

  it("all light chars should exist", () => {
    const visible = readFileSync(new URL("../visible.txt", import.meta.url), "utf-8");

    const available = new Set(
      Object.keys(emojies_defs_light).map((k) => emojies_defs_light[k].replaceAll("\uFE0F", "")),
    );

    let missed = "";

    [...visible].forEach((ch) => {
      if (!available.has(ch)) missed += ch;
    });

    if (missed) {
      throw new Error("Characters " + missed + " missed.");
    }
  });
});
