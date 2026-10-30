try {
  await import("katex");
  await import("katex/contrib/mhchem");
} catch (err) {
  throw new Error(
    "[@mdit/plugin-katex-slim]: failed to load the mhchem extension. Make sure `katex` is installed and `katex/contrib/mhchem` is resolvable.",
    { cause: err },
  );
}

export {};
