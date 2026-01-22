try {
  await import("katex");
  await import("katex/contrib/mhchem");
} catch {
  // do nothing
}

// oxlint-disable-next-line unicorn/require-module-specifiers
export {};
