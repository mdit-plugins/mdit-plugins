import { deflateRaw } from "pako";

export const deflate = (data: string): string => {
  const compressed = deflateRaw(data, { level: 9 });

  // Convert Uint8Array to binary string
  return String.fromCharCode.apply(null, Array.from(compressed));
};
