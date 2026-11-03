/** Minimum width of a Markdown table column, matching the `oxfmt` formatter */
const MIN_TABLE_COLUMN_WIDTH = 3;

/** Unicode ranges of wide characters, used to compute the display width of table cells */
const WIDE_CHARACTER_RANGES: readonly (readonly [number, number])[] = [
  [0x1100, 0x115f],
  [0x2e80, 0x303e],
  [0x3041, 0x33ff],
  [0x3400, 0x4dbf],
  [0x4e00, 0x9fff],
  [0xa000, 0xa4cf],
  [0xa960, 0xa97f],
  [0xac00, 0xd7a3],
  [0xf900, 0xfaff],
  [0xfe10, 0xfe19],
  [0xfe30, 0xfe6f],
  [0xff00, 0xff60],
  [0xffe0, 0xffe6],
  [0x1f200, 0x1f251],
  [0x20000, 0x3fffd],
];

/** Target alignment of a Markdown table column */
export type ColumnAlignment = "left" | "right";

/**
 * Compute the display width of a string
 *
 * Wide (CJK) characters count as two columns, everything else as one column. This matches the
 * alignment used by `oxfmt` for Markdown tables, so generated tables stay formatter-clean.
 *
 * @param value - Text to measure
 * @returns Display width in columns
 */
export const displayWidth = (value: string): number => {
  let width = 0;

  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;

    width += WIDE_CHARACTER_RANGES.some(([start, end]) => codePoint >= start && codePoint <= end)
      ? 2
      : 1;
  }

  return width;
};

/**
 * Pad a table cell to a column width
 *
 * @param value - Cell value
 * @param width - Column width
 * @param alignment - Cell alignment
 * @returns Padded cell
 */
const padCell = (value: string, width: number, alignment: ColumnAlignment): string => {
  const padding = " ".repeat(Math.max(0, width - displayWidth(value)));

  return alignment === "right" ? `${padding}${value}` : `${value}${padding}`;
};

/**
 * Render a Markdown table in the style of the `oxfmt` formatter
 *
 * Columns are padded to the widest cell and separated by ` | `, so the generated Markdown stays
 * formatter-clean and produces stable diffs.
 *
 * @param headers - Header cells
 * @param rows - Body rows
 * @param alignments - Alignment per column, defaults to left
 * @returns Markdown table
 */
export const renderTable = (
  headers: readonly string[],
  rows: readonly (readonly string[])[],
  alignments: readonly ColumnAlignment[] = [],
): string => {
  const widths = headers.map((header, index) =>
    Math.max(
      MIN_TABLE_COLUMN_WIDTH,
      displayWidth(header),
      ...rows.map((row) => displayWidth(row[index] ?? "")),
    ),
  );
  const formatRow = (cells: readonly string[]): string =>
    `| ${cells.map((cell, index) => padCell(cell, widths[index] ?? 0, alignments[index] ?? "left")).join(" | ")} |`;
  const separator = `| ${widths
    .map((width, index) =>
      alignments[index] === "right" ? `${"-".repeat(width - 1)}:` : "-".repeat(width),
    )
    .join(" | ")} |`;

  return [formatRow(headers), separator, ...rows.map((row) => formatRow(row))].join("\n");
};

/**
 * Format a byte count with decimal units
 *
 * @param bytes - Size in bytes
 * @returns Formatted size, e.g. `12.8 kB`
 */
export const formatBytes = (bytes: number): string => {
  if (bytes < 1000) return `${bytes} B`;
  if (bytes < 1_000_000) return `${(bytes / 1000).toFixed(1)} kB`;

  return `${(bytes / 1_000_000).toFixed(2)} MB`;
};

/**
 * Format a throughput value with grouped thousands
 *
 * @param opsPerSec - Operations per second
 * @returns Formatted throughput, e.g. `21,033`
 */
export const formatOpsPerSec = (opsPerSec: number): string =>
  Math.round(opsPerSec)
    .toString()
    .replaceAll(/\B(?=(?:\d{3})+(?!\d))/gu, ",");

/**
 * Format a throughput ratio relative to the reference
 *
 * @param ratio - Throughput ratio
 * @returns Formatted ratio, e.g. `1.06×`
 */
export const formatRatio = (ratio: number): string =>
  ratio >= 10 ? `${ratio.toFixed(1)}×` : `${ratio.toFixed(2)}×`;

/**
 * Format a fitted scaling exponent
 *
 * @param exponent - Fitted exponent
 * @returns Formatted exponent, e.g. `~0.99`
 */
export const formatExponent = (exponent: number): string =>
  Number.isFinite(exponent) ? `~${exponent.toFixed(2)}` : "—";

/**
 * Serialize one code span using the shortest valid backtick run
 *
 * @param content - Content of the code span
 * @returns Serialized inline code span
 */
const serializeCodeSpan = (content: string): string => {
  const serialized =
    content.startsWith(" ") && content.endsWith(" ") && content.trim() !== ""
      ? content.slice(1, -1)
      : content;
  const runLengths = new Set<number>();

  for (const match of serialized.matchAll(/`+/gu)) runLengths.add(match[0].length);

  let delimiterLength = 1;

  while (runLengths.has(delimiterLength)) delimiterLength++;

  const delimiter = "`".repeat(delimiterLength);
  const needsPadding = serialized.startsWith("`") || serialized.endsWith("`");

  return `${delimiter}${needsPadding ? ` ${serialized} ` : serialized}${delimiter}`;
};

/**
 * Normalize the inline code spans of a Markdown snippet
 *
 * Result notes are authored as Markdown and may use long backtick delimiters, e.g. to show a fence.
 * Rewriting them into the canonical shortest form keeps the rendered documentation formatter-clean
 * without changing the displayed text.
 *
 * @param text - Markdown text
 * @returns Text with canonical inline code spans
 */
export const normalizeInlineCodeSpans = (text: string): string => {
  let result = "";
  let index = 0;

  while (index < text.length) {
    if (text[index] !== "`") {
      result += text[index] ?? "";
      index++;
      continue;
    }

    let runEnd = index;

    while (text[runEnd] === "`") runEnd++;

    const delimiter = text.slice(index, runEnd);
    const closingIndex = text.indexOf(delimiter, runEnd);

    if (closingIndex === -1) {
      result += delimiter;
      index = runEnd;
      continue;
    }

    result += serializeCodeSpan(text.slice(runEnd, closingIndex));
    index = closingIndex + delimiter.length;
  }

  return result;
};
