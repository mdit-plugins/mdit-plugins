import { deflateRawSync } from "node:zlib";

export const deflate = (data: string): string =>
  deflateRawSync(Buffer.from(data, "utf8"), { level: 9 }).toString("binary");
