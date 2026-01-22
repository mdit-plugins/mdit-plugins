/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
/* eslint-disable @typescript-eslint/naming-convention */
declare module "pako/lib/deflate.js" {
  enum constants {
    // FlushValues
    Z_NO_FLUSH = 0,
    Z_PARTIAL_FLUSH = 1,
    Z_SYNC_FLUSH = 2,
    Z_FULL_FLUSH = 3,
    Z_FINISH = 4,
    Z_BLOCK = 5,
    Z_TREES = 6,
    // StrategyValues
    Z_FILTERED = 1,
    Z_HUFFMAN_ONLY = 2,
    Z_RLE = 3,
    Z_FIXED = 4,
    Z_DEFAULT_STRATEGY = 0,
    // ReturnCodes
    Z_OK = 0,
    Z_STREAM_END = 1,
    Z_NEED_DICT = 2,
    Z_ERRNO = -1,
    Z_STREAM_ERROR = -2,
    Z_DATA_ERROR = -3,
    Z_BUF_ERROR = -5,
  }

  type StrategyValues =
    | constants.Z_FILTERED
    | constants.Z_HUFFMAN_ONLY
    | constants.Z_RLE
    | constants.Z_FIXED
    | constants.Z_DEFAULT_STRATEGY;

  interface DeflateFunctionOptions {
    level?: -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | undefined;
    windowBits?: number | undefined;
    memLevel?: number | undefined;
    strategy?: StrategyValues | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dictionary?: any;
    raw?: boolean | undefined;
  }

  type Data = Uint8Array | ArrayBuffer;

  /**
   * The same as deflate, but creates raw data, without wrapper (header and adler32 crc).
   */
  export function deflateRaw(data: Data | string, options?: DeflateFunctionOptions): Uint8Array;
}

declare module "@deflate" {
  export const deflate: (data: string) => string;
}
