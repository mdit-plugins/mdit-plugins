import fs from "node:fs";
import path from "node:path";
import { createAndUploadReport } from "@codecov/bundle-analyzer";

const packagesDir = path.resolve(import.meta.dirname, "..", "packages");

const packages = fs.readdirSync(packagesDir).filter((name) => {
  const pkgPath = path.join(packagesDir, name);

  try {
    return fs.statSync(pkgPath).isDirectory() && fs.existsSync(path.join(pkgPath, "lib"));
  } catch {
    return false;
  }
});

const analyzerOptions = {
  ignorePatterns: ["*.map", "*.d.ts", "*.d.mts", "*.d.cts"],
  normalizeAssetsPattern: "[name]-[hash].js",
};

if (packages.length === 0) {
  console.warn("No packages with lib directory found under packages/. Nothing to analyze.");
} else {
  try {
    const reports = await Promise.all(
      packages.map((pkg) =>
        createAndUploadReport(
          [path.join(packagesDir, pkg, "lib")],
          {
            enableBundleAnalysis: true,
            bundleName: pkg,
            telemetry: false,
            oidc: {
              useGitHubOIDC: true,
            },
          },
          analyzerOptions,
        ),
      ),
    );

    console.log(`Report successfully generated and uploaded:\n${reports.join("\n")}`);
  } catch (err) {
    throw new Error("Failed to generate or upload report", { cause: err });
  }
}
