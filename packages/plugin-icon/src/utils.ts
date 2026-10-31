import { escapeHtml } from "@mdit/helper";

const SIZE_REGEXP = /(?<=\s|^)=(?<size>.+?)(?:\s|$)/;

/**
 * Extract size from content
 *
 * @param data Input data with content string
 * @returns Data with size property and cleaned content string
 */
export const extractSize = <Data extends { content: string }>(
  data: Data & { size?: string },
): Data & { size?: string } => {
  let size = "";

  data.content = data.content
    .replace(SIZE_REGEXP, (_, match: string) => {
      size = match;

      return "";
    })
    .trim();

  if (size) data.size = Number.isNaN(Number(size)) ? size : `${size}px`;

  return data;
};

const COLOR_REGEXP = /(?<=\s|^)\/(?<color>.+?)(?:\s|$)/;

/**
 * Extract color from content
 *
 * @param data Input data with content string
 * @returns Data with color property and cleaned content string
 */
export const extractColor = <Data extends { content: string }>(
  data: Data & { color?: string },
): Data & { color?: string } => {
  let color = "";

  data.content = data.content
    .replace(COLOR_REGEXP, (_, match: string) => {
      color = match;

      return "";
    })
    .trim();

  if (color) data.color = color;

  return data;
};

export type AttrsInfo = Record<string, string>;

/** Event handler attribute names, which can execute script and are always dropped. */
const EVENT_HANDLER_ATTR_REGEXP = /^on/i;

/**
 * URL-bearing attributes whose value is validated against dangerous URL schemes.
 *
 * 需要校验危险 URL scheme 的 URL 属性。
 */
const URL_ATTR_NAMES = new Set([
  "action",
  "background",
  "cite",
  "codebase",
  "data",
  "formaction",
  "href",
  "longdesc",
  "manifest",
  "ping",
  "poster",
  "src",
  "usemap",
  "xlink:href",
]);

/**
 * Attributes that can embed or execute content in other elements.
 *
 * The bundled renderers only output `<i>`, `<span>` and `<iconify-icon>`, where these attributes
 * are inert, but they are dropped defensively as they have no use for icons.
 *
 * 在其他元素中可嵌入或执行内容的属性。
 *
 * 内置渲染器只输出 `<i>`、`<span>` 与 `<iconify-icon>`，这些属性在这些元素上无效，但它们对图标没有用途， 因此仍会防御性地丢弃。
 */
const UNSAFE_ATTR_NAMES = new Set(["formaction", "imagesrcset", "srcdoc", "srcset"]);

/** Characters that browsers strip from URLs before parsing them. */
const URL_STRIPPED_CHAR_REGEXP = /[\t\n\r]/g;

/**
 * Matches the URL scheme, ignoring the leading whitespace and control characters browsers trim.
 *
 * 匹配 URL scheme，忽略浏览器在解析前会去除的前导空白与控制字符。
 */
// oxlint-disable-next-line no-control-regex -- browsers trim leading C0 controls before parsing URLs
const URL_SCHEME_REGEXP = /^[\u0000-\u0020]*(?<scheme>[a-z][a-z0-9+.-]*):/i;

/**
 * Get the URL scheme of an attribute value
 *
 * @param value Attribute value / 属性值
 * @returns Lower-cased URL scheme, empty for relative URLs / 小写的 URL scheme，相对 URL 返回空字符串
 */
const getUrlScheme = (value: string): string => {
  const { scheme } =
    URL_SCHEME_REGEXP.exec(value.replaceAll(URL_STRIPPED_CHAR_REGEXP, ""))?.groups ?? {};

  return scheme ? scheme.toLowerCase() : "";
};

/**
 * Check whether an attribute value uses a dangerous URL scheme
 *
 * @param value Attribute value / 属性值
 * @returns Whether the value uses `javascript:` or `vbscript:` / 是否使用 `javascript:` 或 `vbscript:`
 */
const hasDangerousUrlScheme = (value: string): boolean => {
  const scheme = getUrlScheme(value);

  return scheme === "javascript" || scheme === "vbscript";
};

/**
 * Check whether an attribute can be rendered
 *
 * Event handler attributes (`on*`) are always dropped, as are URL attributes whose value uses the
 * `javascript:` or `vbscript:` scheme. Other attributes, including `style`, are kept and their
 * values are HTML-escaped. Inline styles cannot execute script in modern browsers, but untrusted
 * content can still change the page appearance or trigger external `url()` requests; sanitize the
 * rendered HTML if it must be strictly isolated.
 *
 * 判断属性是否可以输出。
 *
 * 事件处理器属性（`on*`）始终会被丢弃；使用 `javascript:` 或 `vbscript:` scheme 的 URL 属性也会被丢弃。 其他属性（包括
 * `style`）会被保留，其值会进行 HTML 转义。内联样式在现代浏览器中无法执行脚本，但不可信内容 仍可改变页面外观或触发外部 `url()` 请求；若需要严格隔离，请对渲染结果做 HTML
 * 清洗。
 *
 * @param name Attribute name / 属性名
 * @param value Attribute value / 属性值
 * @returns Whether the attribute is safe to render / 属性是否可安全输出
 */
const isSafeAttr = (name: string, value: string): boolean => {
  if (EVENT_HANDLER_ATTR_REGEXP.test(name)) return false;

  const normalizedName = name.toLowerCase();

  if (UNSAFE_ATTR_NAMES.has(normalizedName)) return false;

  return !(URL_ATTR_NAMES.has(normalizedName) && hasDangerousUrlScheme(value));
};

const ATTR_NAME_REGEXP = "[A-Za-z_][a-zA-Z0-9_-]*";

/** Escaped double quote inside a double-quoted attribute value. */
const ESCAPED_DOUBLE_QUOTE_REGEXP = /\\"/g;

/** Escaped single quote inside a single-quoted attribute value. */
const ESCAPED_SINGLE_QUOTE_REGEXP = /\\'/g;

const ATTR_REGEXP = new RegExp(
  // oxlint-disable-next-line prefer-template
  String.raw`\b` +
    // attr name
    `(?<attr>${ATTR_NAME_REGEXP})` +
    // =
    "=" +
    // attr value, should match on of the following
    `(?:` +
    /** Case 1: value with quotes */
    //   starting quote
    /**/ `(?<quote>['"])` +
    //   value capture group
    /**/ `(?<valueWithQuotes>` +
    /*  */ `(?:` +
    //      any character
    /*    */ `.` +
    //      negative lookahead for one of the following
    /*    */ `(?!` +
    //      case 1: ending and starting another attr
    /*      */ `\\k<quote>\\s+(?:${ATTR_NAME_REGEXP})=` +
    /*      */ `|` +
    //      case 2: an escaped quote
    /*      */ `(?<!\\\\)\\k<quote>` +
    /*    */ `)` +
    /*  */ `)+.` +
    /**/ `)` +
    //   ending with same quote
    /**/ `\\k<quote>` +
    /**/ "|" +
    /** Case 2: empty values */
    /**/ `(?<emptyValue>''|"")` +
    /**/ "|" +
    /** Case 3: value without quotes */
    /**/ String.raw`(?<valueWithoutQuotes>\S+)` +
    `)` +
    // optional space
    `(?:\\s+|$)`,
  "g",
);

/**
 * Parse attrs string to object.
 *
 * Attributes that could execute script (event handlers and URL attributes with a dangerous URL
 * scheme) are dropped together with their values, everything else is kept. Attribute values are
 * HTML-escaped when they are rendered.
 *
 * 解析属性字符串为对象。
 *
 * 可能执行脚本的属性（事件处理器，以及使用危险 URL scheme 的 URL 属性）会连同其值一起被丢弃，其余属性保留。 输出时属性值会进行 HTML 转义。
 *
 * @param data Input data with content string / 包含内容字符串的输入数据
 * @returns Data with attrs object and cleaned content string / 包含属性对象与清理后内容字符串的数据
 */
export const extractAttrs = <Data extends { content: string }>(
  data: Data & { attrs?: AttrsInfo },
): Data & { attrs: AttrsInfo } => {
  const attrs: AttrsInfo = {};

  const content = data.content
    .replaceAll(
      ATTR_REGEXP,
      // oxlint-disable-next-line max-params
      (
        _,
        _1,
        _2,
        _3,
        _4,
        _5,
        _6,
        _7,
        info: {
          attr: string;
          emptyValue: string | undefined;
          valueWithoutQuotes: string | undefined;
          valueWithQuotes: string | undefined;
          quote: string | undefined;
        },
      ) => {
        const value = info.emptyValue
          ? ""
          : (info.valueWithoutQuotes ??
            // oxlint-disable-next-line typescript/no-non-null-assertion
            info.valueWithQuotes!.replaceAll(
              info.quote === '"' ? ESCAPED_DOUBLE_QUOTE_REGEXP : ESCAPED_SINGLE_QUOTE_REGEXP,
              // oxlint-disable-next-line typescript/no-non-null-assertion
              info.quote!,
            ));

        if (!isSafeAttr(info.attr, value)) return "";

        attrs[info.attr] = value;

        return "";
      },
    )
    .trim();

  return Object.assign({}, data, { attrs, content });
};

export const extractInfo = <Data extends { content: string }>(
  data: Data & { attrs?: AttrsInfo; size?: string; color?: string },
): Data & { attrs: AttrsInfo; size?: string; color?: string } =>
  extractColor(extractSize(extractAttrs(data)));

/**
 * Append styles to attrs object
 *
 * @param attrs Attrs object
 * @param styleDefinition New style definition
 * @returns Updated attrs object
 */
export const appendStyle = (
  attrs: Record<string, string>,
  styleDefinition: string,
): Record<string, string> => {
  const { style = "" } = attrs;

  attrs.style = `${style}${style && !style.endsWith(";") ? ";" : ""}${styleDefinition}`;

  return attrs;
};

/**
 * Stringify attrs object
 *
 * Attributes that could execute script (event handlers and URL attributes with a dangerous URL
 * scheme) are dropped as a second line of defense; attribute values are HTML-escaped.
 *
 * 序列化属性对象。
 *
 * 作为第二道防线，可能执行脚本的属性（事件处理器，以及使用危险 URL scheme 的 URL 属性）会被丢弃；属性值会进行 HTML 转义。
 *
 * @param attrs Attrs object / 属性对象
 * @returns Stringified attrs / 序列化后的属性字符串
 */
export const stringifyAttrs = (attrs: Record<string, string>): string => {
  const result = Object.entries(attrs)
    .filter(([key, value]) => isSafeAttr(key, value))
    .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
    .join(" ");

  return result ? ` ${result}` : "";
};
