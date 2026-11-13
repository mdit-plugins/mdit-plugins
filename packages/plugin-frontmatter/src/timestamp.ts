import { CORE_SCHEMA, defineScalarTag, NOT_RESOLVED } from "js-yaml";
import type { ScalarTagDefinition, Schema } from "js-yaml";

const DATE_RE = /^(?<year>[0-9]{4})-(?<month>[0-9]{2})-(?<day>[0-9]{2})$/;
const TIMESTAMP_RE =
  /^(?<year>[0-9]{4})-(?<month>[0-9]{1,2})-(?<day>[0-9]{1,2})(?:[Tt]|[ \t]+)(?<hour>[0-9]{1,2}):(?<minute>[0-9]{2}):(?<second>[0-9]{2})(?:\.(?<fraction>[0-9]*))?(?:[ \t]*(?<zone>Z|(?<sign>[-+])(?<offsetHour>[0-9]{1,2})(?::(?<offsetMinute>[0-9]{2}))?))?$/;
const TIMESTAMP_FIRST_CHARS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const DAY_MS = 86_400_000;

interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

interface DateTimeParts extends WallClock {
  milliseconds: number;
}

interface ExplicitOffset {
  sign: "+" | "-";
  hour: number;
  minute: number;
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

/**
 * Get a cached formatter for an IANA timezone
 *
 * @param timeZone - IANA timezone name / IANA 时区名
 * @returns Formatter for the timezone / 该时区的格式化器
 */
const getFormatter = (timeZone: string): Intl.DateTimeFormat => {
  const cached = formatterCache.get(timeZone);

  if (cached) return cached;

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
      era: "short",
    });

    formatterCache.set(timeZone, formatter);

    return formatter;
  } catch {
    throw new TypeError(`[@mdit/plugin-frontmatter]: Invalid timezone "${timeZone}"`);
  }
};

/**
 * Read wall-clock components from a timestamp in a timezone
 *
 * @param timestamp - Unix timestamp in milliseconds / 毫秒时间戳
 * @param formatter - Timezone formatter / 时区格式化器
 * @returns Wall-clock components / 日历时间组件
 */
const getWallClock = (timestamp: number, formatter: Intl.DateTimeFormat): WallClock => {
  let year = 0;
  let month = 1;
  let day = 1;
  let hour = 0;
  let minute = 0;
  let second = 0;
  let era = "";

  for (const part of formatter.formatToParts(timestamp)) {
    switch (part.type) {
      case "year": {
        year = Number(part.value);
        break;
      }
      case "month": {
        month = Number(part.value);
        break;
      }
      case "day": {
        day = Number(part.value);
        break;
      }
      case "hour": {
        hour = Number(part.value);
        break;
      }
      case "minute": {
        minute = Number(part.value);
        break;
      }
      case "second": {
        second = Number(part.value);
        break;
      }
      case "era": {
        era = part.value;
        break;
      }
      default: {
        break;
      }
    }
  }

  return { year: era === "BC" ? 1 - year : year, month, day, hour, minute, second };
};

/**
 * Build a UTC timestamp without the 0-99 year remapping of `Date.UTC`
 *
 * @param parts - Date-time components / 时间组件
 * @returns Unix timestamp in milliseconds / 毫秒时间戳
 */
const getUtcTimestamp = (parts: DateTimeParts): number => {
  const date = new Date(0);

  date.setUTCFullYear(parts.year, parts.month - 1, parts.day);
  date.setUTCHours(parts.hour, parts.minute, parts.second, parts.milliseconds);

  return date.getTime();
};

/**
 * Get the timezone offset at a timestamp
 *
 * @param timestamp - Unix timestamp in milliseconds / 毫秒时间戳
 * @param formatter - Timezone formatter / 时区格式化器
 * @returns Offset in milliseconds east of UTC / 相对 UTC 向东的毫秒偏移
 */
const getOffset = (timestamp: number, formatter: Intl.DateTimeFormat): number => {
  const wallClock = getWallClock(timestamp, formatter);
  const asUtc = getUtcTimestamp({ ...wallClock, milliseconds: 0 });

  return asUtc - Math.floor(timestamp / 1000) * 1000;
};

/**
 * Check whether a date has the expected wall-clock components
 *
 * @param date - Date to check / 待检查的日期
 * @param parts - Expected components / 期望的时间组件
 * @param formatter - Timezone formatter / 时区格式化器
 * @returns Whether the components match / 组件是否匹配
 */
const matchesWallClock = (
  date: Date,
  parts: DateTimeParts,
  formatter: Intl.DateTimeFormat,
): boolean => {
  const wallClock = getWallClock(date.getTime(), formatter);

  return (
    wallClock.year === parts.year &&
    wallClock.month === parts.month &&
    wallClock.day === parts.day &&
    wallClock.hour === parts.hour &&
    wallClock.minute === parts.minute &&
    wallClock.second === parts.second &&
    date.getMilliseconds() === parts.milliseconds
  );
};

/**
 * Build a date from wall-clock components in a timezone
 *
 * Returns `null` for invalid dates and local times skipped by a daylight-saving transition.
 *
 * 在指定时区中根据日历时间组件构建日期。
 *
 * 无效日期以及被夏令时跳过的本地时间会返回 `null`。
 *
 * @param parts - Wall-clock components / 日历时间组件
 * @param formatter - Timezone formatter / 时区格式化器
 * @returns Date, or `null` when invalid / 日期，无效时为 `null`
 */
const makeZonedDate = (parts: DateTimeParts, formatter: Intl.DateTimeFormat): Date | null => {
  const wallClockUtc = getUtcTimestamp(parts);
  const offsets = new Set([
    getOffset(wallClockUtc - DAY_MS, formatter),
    getOffset(wallClockUtc, formatter),
    getOffset(wallClockUtc + DAY_MS, formatter),
  ]);
  let earliest: Date | null = null;

  for (const offset of offsets) {
    const date = new Date(wallClockUtc - offset);

    if (!matchesWallClock(date, parts, formatter)) continue;

    if (!earliest || date.getTime() < earliest.getTime()) earliest = date;
  }

  return earliest;
};

/**
 * Build a date from wall-clock components and an explicit UTC offset
 *
 * @param parts - Wall-clock components / 日历时间组件
 * @param offset - Explicit UTC offset / 显式 UTC 偏移
 * @returns Date, or `null` when invalid / 日期，无效时为 `null`
 */
const makeExplicitDate = (parts: DateTimeParts, offset: ExplicitOffset): Date | null => {
  const date = new Date(getUtcTimestamp(parts));

  if (
    date.getUTCFullYear() !== parts.year ||
    date.getUTCMonth() !== parts.month - 1 ||
    date.getUTCDate() !== parts.day
  )
    return null;

  const offsetMilliseconds = (offset.hour * 60 + offset.minute) * 60_000;

  date.setTime(date.getTime() + (offset.sign === "-" ? offsetMilliseconds : -offsetMilliseconds));

  return date;
};

/**
 * Convert named regex groups into date-time components
 *
 * @param groups - Named regex groups / 正则命名分组
 * @param milliseconds - Milliseconds / 毫秒
 * @returns Date-time components / 时间组件
 */
const getDateTimeParts = (
  groups: Record<string, string | undefined>,
  milliseconds: number,
): DateTimeParts => ({
  year: Number(groups.year),
  month: Number(groups.month),
  day: Number(groups.day),
  hour: Number(groups.hour),
  minute: Number(groups.minute),
  second: Number(groups.second),
  milliseconds,
});

/**
 * Resolve a date-only value, using the first valid time when midnight is skipped
 *
 * @param year - Year / 年
 * @param month - Month (1-12) / 月（1-12）
 * @param day - Day / 日
 * @param formatter - Timezone formatter / 时区格式化器
 * @returns Date, or `null` when the whole date is skipped / 日期，整日被跳过时为 `null`
 */
const makeDateOnly = (
  year: number,
  month: number,
  day: number,
  formatter: Intl.DateTimeFormat,
): Date | null => {
  for (let minute = 0; minute < 1440; minute++) {
    const date = makeZonedDate(
      {
        year,
        month,
        day,
        hour: Math.floor(minute / 60),
        minute: minute % 60,
        second: 0,
        milliseconds: 0,
      },
      formatter,
    );

    if (date) return date;
  }

  return null;
};

/**
 * Create the YAML timestamp tag for a timezone
 *
 * @param timeZone - IANA timezone name / IANA 时区名
 * @returns Scalar tag resolving timestamps to dates / 将时间戳解析为日期的标量标签
 */
const createTimestampTag = (timeZone: string): ScalarTagDefinition<Date> => {
  const formatter = getFormatter(timeZone);

  return defineScalarTag("tag:yaml.org,2002:timestamp", {
    implicit: true,
    implicitFirstChars: TIMESTAMP_FIRST_CHARS,
    identify: () => false,
    resolve: (source) => {
      const dateMatch = DATE_RE.exec(source);

      if (dateMatch) {
        const groups = dateMatch.groups as Record<string, string | undefined>;
        const date = makeDateOnly(
          Number(groups.year),
          Number(groups.month),
          Number(groups.day),
          formatter,
        );

        return date ?? NOT_RESOLVED;
      }

      const match = TIMESTAMP_RE.exec(source);

      if (!match) return NOT_RESOLVED;

      const groups = match.groups as Record<string, string | undefined>;
      const fraction = (groups.fraction ?? "").slice(0, 3).padEnd(3, "0");
      const parts = getDateTimeParts(groups, Number(fraction));

      if (parts.hour > 23 || parts.minute > 59 || parts.second > 59) return NOT_RESOLVED;

      const zone = groups.zone;

      if (zone) {
        if (zone === "Z") {
          const date = makeExplicitDate(parts, { sign: "+", hour: 0, minute: 0 });

          return date ?? NOT_RESOLVED;
        }

        const offset: ExplicitOffset = {
          sign: groups.sign === "-" ? "-" : "+",
          hour: Number(groups.offsetHour),
          minute: Number(groups.offsetMinute ?? "0"),
        };

        if (offset.hour > 23 || offset.minute > 59) return NOT_RESOLVED;

        const date = makeExplicitDate(parts, offset);

        return date ?? NOT_RESOLVED;
      }

      const date = makeZonedDate(parts, formatter);

      return date ?? NOT_RESOLVED;
    },
  });
};

/**
 * Create a YAML 1.2 core schema that also resolves timestamps to dates
 *
 * @param timeZone - IANA timezone used for timestamps without an explicit offset / 无显式偏移的时间戳所使用的
 *   IANA 时区
 * @returns Schema with timestamp support / 支持时间戳的 YAML 模式
 */
export const createTimestampSchema = (timeZone: string): Schema =>
  CORE_SCHEMA.withTags(createTimestampTag(timeZone));
