import type {
  FontData as FontDataType,
  CharDataArray,
  CharOptions,
  DelimiterData,
  DynamicFile,
  VariantData,
} from "@mathjax/src/js/output/common/FontData.js";

interface PatchedFontInstance<
  Char extends CharOptions = CharOptions,
  Variant extends VariantData<Char> = VariantData<Char>,
  Delimiter extends DelimiterData = DelimiterData,
> extends FontDataType<Char, Variant, Delimiter> {
  loadDynamicFileSync(dynamic: DynamicFile): void;
}

try {
  const { mathjax } = await import("@mathjax/src/js/mathjax.js");
  const { FontData } = await import("@mathjax/src/js/output/common/FontData.js");

  // patch font to avoid async loading of fonts
  Object.assign(FontData.prototype, {
    getDelimiter(this: PatchedFontInstance, num: number): DelimiterData | null {
      const delim = this.delimiters[num];

      // oxlint-disable-next-line typescript/strict-boolean-expressions
      if (delim && !("dir" in delim)) {
        // @ts-expect-error: delimiters is private in FontData
        this.delimiters[num] = null;

        if (mathjax.asyncIsSynchronous) {
          this.loadDynamicFileSync(delim);
          return this.getDelimiter(num);
        }

        mathjax.retryAfter(this.loadDynamicFile(delim));
        return null;
      }

      return delim;
    },
    getChar(
      this: PatchedFontInstance,
      name: string,
      num: number,
    ): CharDataArray<CharOptions> | null {
      const char = this.variant[name].chars[num];

      // oxlint-disable-next-line typescript/strict-boolean-expressions
      if (char && !Array.isArray(char)) {
        const variant = this.variant[name];

        // oxlint-disable-next-line typescript/no-dynamic-delete
        delete variant.chars[num];

        variant.linked.forEach((link) => {
          // oxlint-disable-next-line typescript/no-dynamic-delete
          delete link[num];
        });

        if (mathjax.asyncIsSynchronous) {
          this.loadDynamicFileSync(char);
          return this.getChar(name, num);
        }

        mathjax.retryAfter(this.loadDynamicFile(char));

        return null;
      }

      return char;
    },
  });
} catch {
  // do nothing if mathjax is not available
}
