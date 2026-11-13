import { CORE_SCHEMA, YAML11_SCHEMA } from "js-yaml";
import type { Env } from "markdown-it";
import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import type { MarkdownItFrontmatterOptions } from "../src/index.js";
import { frontmatter } from "../src/index.js";
import { parseFrontmatter } from "../src/parse.js";
import { createTimestampSchema } from "../src/timestamp.js";

const parseYaml = (
  source: string,
  options: MarkdownItFrontmatterOptions = {},
): Record<string, unknown> => parseFrontmatter(`---\n${source}\n---\n`, options).data;

describe("timestamps", () => {
  it("keeps timestamps as strings by default", () => {
    expect(
      parseYaml("date: 2022-07-06\ndatetime: 2022-07-06 00:30:00", {
        timezone: "Invalid/Timezone",
      }),
    ).toStrictEqual({
      date: "2022-07-06",
      datetime: "2022-07-06 00:30:00",
    });
  });

  it("parses date-only and datetime values as UTC by default", () => {
    expect(
      parseYaml("date: 2022-07-06\ndatetime: 2022-07-06 00:30:00", {
        parseTimestamps: true,
      }),
    ).toStrictEqual({
      date: new Date("2022-07-06T00:00:00.000Z"),
      datetime: new Date("2022-07-06T00:30:00.000Z"),
    });
  });

  it("keeps quoted timestamps as strings", () => {
    expect(
      parseYaml('date: "2022-07-06"\ndatetime: "2022-07-06T00:30:00Z"', {
        parseTimestamps: true,
      }),
    ).toStrictEqual({
      date: "2022-07-06",
      datetime: "2022-07-06T00:30:00Z",
    });
  });

  it("honors explicit UTC offsets", () => {
    expect(
      parseYaml(
        [
          "utc: 2022-07-06T00:30:00Z",
          "positive: 2022-07-06T00:30:00+08:00",
          "negative: 2022-07-06T00:30:00-05:00",
          "short: 2022-07-06T00:30:00+8",
          "nepal: 2022-07-06T00:30:00+05:45",
        ].join("\n"),
        { parseTimestamps: true, timezone: "Asia/Shanghai" },
      ),
    ).toStrictEqual({
      utc: new Date("2022-07-06T00:30:00.000Z"),
      positive: new Date("2022-07-05T16:30:00.000Z"),
      negative: new Date("2022-07-06T05:30:00.000Z"),
      short: new Date("2022-07-05T16:30:00.000Z"),
      nepal: new Date("2022-07-05T18:45:00.000Z"),
    });
  });

  it("interprets timestamps without an offset in the configured timezone", () => {
    expect(
      parseYaml(
        [
          "date: 2022-07-06",
          "datetime: 2022-07-06 00:30:00",
          "utc: 2022-07-06T00:30:00Z",
          "offset: 2022-07-06T00:30:00+08:00",
        ].join("\n"),
        { parseTimestamps: true, timezone: "Asia/Shanghai" },
      ),
    ).toStrictEqual({
      date: new Date("2022-07-05T16:00:00.000Z"),
      datetime: new Date("2022-07-05T16:30:00.000Z"),
      utc: new Date("2022-07-06T00:30:00.000Z"),
      offset: new Date("2022-07-05T16:30:00.000Z"),
    });
  });

  it("accepts single-digit month, day and hour fields", () => {
    expect(
      parseYaml("datetime: 2022-7-6 0:30:00", {
        parseTimestamps: true,
      }),
    ).toStrictEqual({
      datetime: new Date("2022-07-06T00:30:00.000Z"),
    });
  });

  it("preserves fractional seconds up to milliseconds", () => {
    expect(
      parseYaml(
        [
          "full: 2022-07-06T00:30:00.123456Z",
          "short: 2022-07-06T00:30:00.5Z",
          "empty: 2022-07-06T00:30:00.Z",
        ].join("\n"),
        { parseTimestamps: true },
      ),
    ).toStrictEqual({
      full: new Date("2022-07-06T00:30:00.123Z"),
      short: new Date("2022-07-06T00:30:00.500Z"),
      empty: new Date("2022-07-06T00:30:00.000Z"),
    });
  });

  it("parses timestamps inside nested values", () => {
    expect(
      parseYaml(
        ["items:", "  - at: 2022-07-06", "    meta:", "      at: 2022-07-06 00:30:00"].join("\n"),
        { parseTimestamps: true },
      ),
    ).toStrictEqual({
      items: [
        {
          at: new Date("2022-07-06T00:00:00.000Z"),
          meta: { at: new Date("2022-07-06T00:30:00.000Z") },
        },
      ],
    });
  });

  it("keeps invalid dates and times as strings", () => {
    expect(
      parseYaml(
        [
          "date: 2022-02-30",
          "leap: 2023-02-29",
          "month: 2022-13-01",
          "hour: 2022-07-06T24:00:00Z",
          "minute: 2022-07-06T00:60:00Z",
          "second: 2022-07-06T00:00:60Z",
          "offsetHour: 2022-07-06T00:30:00+24:00",
          "offsetMinute: 2022-07-06T00:30:00+08:60",
          "missingSeconds: 2022-07-06T00:30",
          "invalidDate: 2022-02-30T00:00:00Z",
          "invalidOffsetDate: 2022-02-30T00:00:00+08:00",
        ].join("\n"),
        { parseTimestamps: true },
      ),
    ).toStrictEqual({
      date: "2022-02-30",
      leap: "2023-02-29",
      month: "2022-13-01",
      hour: "2022-07-06T24:00:00Z",
      minute: "2022-07-06T00:60:00Z",
      second: "2022-07-06T00:00:60Z",
      offsetHour: "2022-07-06T00:30:00+24:00",
      offsetMinute: "2022-07-06T00:30:00+08:60",
      missingSeconds: "2022-07-06T00:30",
      invalidDate: "2022-02-30T00:00:00Z",
      invalidOffsetDate: "2022-02-30T00:00:00+08:00",
    });
  });

  it("handles daylight-saving offsets", () => {
    expect(
      parseYaml(
        [
          "summer: 2023-07-06 00:30:00",
          "winter: 2023-01-06 00:30:00",
          "fold: 2023-11-05 01:30:00",
          "gap: 2023-03-12 02:30:00",
        ].join("\n"),
        { parseTimestamps: true, timezone: "America/New_York" },
      ),
    ).toStrictEqual({
      summer: new Date("2023-07-06T04:30:00.000Z"),
      winter: new Date("2023-01-06T05:30:00.000Z"),
      fold: new Date("2023-11-05T05:30:00.000Z"),
      gap: "2023-03-12 02:30:00",
    });
  });

  it("accepts leap days", () => {
    expect(parseYaml("date: 2024-02-29", { parseTimestamps: true })).toStrictEqual({
      date: new Date("2024-02-29T00:00:00.000Z"),
    });
  });

  it("uses the earlier occurrence for ambiguous folds", () => {
    expect(
      parseYaml(
        [
          "london: 2024-10-27 01:30:00",
          "berlin: 2024-10-27 02:30:00",
          "sydney: 2024-04-07 02:30:00",
        ].join("\n"),
        { parseTimestamps: true, timezone: "Europe/London" },
      ).london,
    ).toStrictEqual(new Date("2024-10-27T00:30:00.000Z"));

    expect(
      parseYaml("berlin: 2024-10-27 02:30:00", {
        parseTimestamps: true,
        timezone: "Europe/Berlin",
      }).berlin,
    ).toStrictEqual(new Date("2024-10-27T00:30:00.000Z"));

    expect(
      parseYaml("sydney: 2024-04-07 02:30:00", {
        parseTimestamps: true,
        timezone: "Australia/Sydney",
      }).sydney,
    ).toStrictEqual(new Date("2024-04-06T15:30:00.000Z"));
  });

  it("uses the first valid time when date-only midnight is skipped", () => {
    expect(
      parseYaml("date: 2024-09-08", {
        parseTimestamps: true,
        timezone: "America/Santiago",
      }).date,
    ).toStrictEqual(new Date("2024-09-08T04:00:00.000Z"));

    expect(
      parseYaml("date: 2011-12-30", {
        parseTimestamps: true,
        timezone: "Pacific/Apia",
      }).date,
    ).toBe("2011-12-30");

    expect(
      parseYaml("date: 1986-01-01", {
        parseTimestamps: true,
        timezone: "Asia/Kathmandu",
      }).date,
    ).toStrictEqual(new Date("1985-12-31T18:30:00.000Z"));
  });

  it("supports years below 100", () => {
    expect(
      parseYaml(
        [
          "date: 0000-01-01",
          "naive: 0000-01-01T00:00:00",
          "explicit: 0000-01-01T00:00:00Z",
          "year50: 0050-01-01",
        ].join("\n"),
        { parseTimestamps: true },
      ),
    ).toStrictEqual({
      date: new Date("0000-01-01T00:00:00.000Z"),
      naive: new Date("0000-01-01T00:00:00.000Z"),
      explicit: new Date("0000-01-01T00:00:00.000Z"),
      year50: new Date("0050-01-01T00:00:00.000Z"),
    });
  });

  it("supports timezones with minute offsets", () => {
    expect(
      parseYaml("date: 2022-07-06", {
        parseTimestamps: true,
        timezone: "Asia/Kathmandu",
      }).date,
    ).toStrictEqual(new Date("2022-07-05T18:15:00.000Z"));
  });

  it("parses multiple values in the same timezone", () => {
    const options: MarkdownItFrontmatterOptions = {
      parseTimestamps: true,
      timezone: "Asia/Shanghai",
    };

    expect(parseYaml("date: 2022-07-06", options).date).toStrictEqual(
      new Date("2022-07-05T16:00:00.000Z"),
    );
    expect(parseYaml("date: 2022-07-07", options).date).toStrictEqual(
      new Date("2022-07-06T16:00:00.000Z"),
    );
  });

  it("throws for an invalid timezone", () => {
    expect(() =>
      parseYaml("date: 2022-07-06", {
        parseTimestamps: true,
        timezone: "Invalid/Timezone",
      }),
    ).toThrow(new TypeError('[@mdit/plugin-frontmatter]: Invalid timezone "Invalid/Timezone"'));
  });

  it("falls back to UTC for an empty timezone", () => {
    expect(
      parseYaml("date: 2022-07-06", {
        parseTimestamps: true,
        timezone: "",
      }).date,
    ).toStrictEqual(new Date("2022-07-06T00:00:00.000Z"));

    expect(
      parseYaml("date: 2022-07-06", {
        parseTimestamps: true,
        timezone: "  ",
      }).date,
    ).toStrictEqual(new Date("2022-07-06T00:00:00.000Z"));
  });

  it("lets an explicit schema take precedence", () => {
    expect(
      parseYaml("date: 2022-07-06\nflag: yes", {
        parseTimestamps: true,
        timezone: "Invalid/Timezone",
        yamlOptions: { schema: CORE_SCHEMA },
      }),
    ).toStrictEqual({
      date: "2022-07-06",
      flag: "yes",
    });

    expect(
      parseYaml("date: 2022-07-06\nflag: yes", {
        parseTimestamps: true,
        yamlOptions: { schema: YAML11_SCHEMA },
      }),
    ).toStrictEqual({
      date: new Date("2022-07-06T00:00:00.000Z"),
      flag: true,
    });
  });

  it("does not change custom parsers", () => {
    expect(
      parseFrontmatter('---toml\ndate = "2022-07-06"\n---', {
        parseTimestamps: true,
        parsers: { toml: () => ({ date: "2022-07-06" }) },
      }).data,
    ).toStrictEqual({ date: "2022-07-06" });
  });

  it("exposes a load-only timestamp tag", () => {
    const schema = createTimestampSchema("UTC");
    const tag = schema.tags.find((item) => item.tagName === "tag:yaml.org,2002:timestamp");

    expect(tag?.identify(new Date())).toBe(false);
  });

  it("parses timestamps through the plugin", () => {
    const md = new MarkdownIt().use(frontmatter, {
      parseTimestamps: true,
      timezone: "Asia/Shanghai",
    });
    const env: Env = {};

    expect(md.render("---\ncreated: 2022-07-06 00:30:00\n---\n# Hello", env)).toBe(
      "<h1>Hello</h1>\n",
    );
    expect(env.frontmatter).toStrictEqual({
      created: new Date("2022-07-05T16:30:00.000Z"),
    });
  });
});
