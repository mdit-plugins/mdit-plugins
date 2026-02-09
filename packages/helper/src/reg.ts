// https://spec.commonmark.org/0.29/#line-ending
export const NEWLINE_RE: RegExp = /\r\n?|\n/g;

export const UNESCAPE_RE: RegExp = /\\([ \\!"#$%&'()*+,./:;<=>?@[\]^_`{|}~-])/gu;
