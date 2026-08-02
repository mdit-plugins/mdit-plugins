import { deflateRaw } from "pako";

const CHUNK_SIZE = 0x8000;

export const deflate = (data: string): string => {
  const compressed = deflateRaw(data, { level: 9 });

  // Convert Uint8Array to binary string in chunks: spreading the whole array
  // via `Function.prototype.apply` overflows the stack for large outputs.
  const chunks: string[] = [];

  for (let i = 0; i < compressed.length; i += CHUNK_SIZE) {
    const chunk = compressed.subarray(i, i + CHUNK_SIZE);
    const chars = Array.from(chunk);

    chunks.push(String.fromCharCode.apply(null, chars));
  }

  return chunks.join("");
};
