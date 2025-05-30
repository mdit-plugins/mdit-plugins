import * as deflateModule from "pako/lib/deflate.js";

export const deflate = (data: string): string => {
  const compressed = deflateModule.deflateRaw(data, { level: 9 });

  // Convert Uint8Array to binary string
  return String.fromCharCode.apply(null, Array.from(compressed));
};
