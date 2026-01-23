/**
 * @see https://plantuml.com/en/text-encoding
 *
 * PlantUML uses a custom Base64 encoding scheme for text data.
 *
 * @param byte - 6-bit byte value
 * @returns encoded character
 */
const encode6bit = (byte: number): string =>
  byte < 10
    ? String.fromCharCode(48 + byte)
    : byte < 36
      ? String.fromCharCode(65 + byte - 10)
      : byte < 62
        ? String.fromCharCode(97 + byte - 36)
        : byte === 62
          ? "-"
          : byte === 63
            ? "_"
            : "?";

const append3bytes = (b1: number, b2: number, b3: number): string => {
  const c1 = b1 >> 2;
  const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  const c3 = ((b2 & 0xf) << 2) | (b3 >> 6);
  const c4 = b3 & 0x3f;

  return (
    encode6bit(c1 & 0x3f) + encode6bit(c2 & 0x3f) + encode6bit(c3 & 0x3f) + encode6bit(c4 & 0x3f)
  );
};

/**
 * Custom Base64 encoding for PlantUML
 *
 * Mapping: 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_
 *
 * @param data The input string to encode
 * @returns The Base64 encoded string
 */
export const customEncodeBase64 = (data: string): string => {
  let result = "";

  for (let i = 0; i < data.length; i += 3) {
    if (i + 2 === data.length) {
      result += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), 0);
    } else if (i + 1 === data.length) {
      result += append3bytes(data.charCodeAt(i), 0, 0);
    } else {
      result += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), data.charCodeAt(i + 2));
    }
  }

  return result;
};
