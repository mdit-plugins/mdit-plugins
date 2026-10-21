import fs from "node:fs";
import path from "node:path";

import { createAndUploadReport } from "@codecov/bundle-analyzer";

const DIST_DIR = "dist";

/**
 * Get package directory names that have build output
 *
 * @param packagesDir Packages directory
 * @returns Package directory names with a dist directory
 */
export const getPackagesWithDist = (packagesDir: string): string[] =>
  fs
    .readdirSync(packagesDir)
    .filter((name) => {
      const pkgPath = path.join(packagesDir, name);

      try {
        return fs.statSync(pkgPath).isDirectory() && fs.existsSync(path.join(pkgPath, DIST_DIR));
      } catch {
        return false;
      }
    })
    .sort();

const analyzerOptions = {
  ignorePatterns: ["*.map", "*.d.ts", "*.d.mts", "*.d.cts"],
  normalizeAssetsPattern: "[name]-[hash].js",
};

/**
 * Generate and upload bundle analysis reports
 *
 * @param packagesDir Packages directory
 */
const analyze = async (packagesDir: string): Promise<void> => {
  const packages = getPackagesWithDist(packagesDir);

  if (packages.length === 0) {
    console.error(
      `No packages with ${DIST_DIR} directory found under ${packagesDir}. Nothing to analyze.`,
    );
    process.exitCode = 1;

    return;
  }

  try {
    const reports = await Promise.all(
      packages.map((pkg) =>
        createAndUploadReport(
          [path.join(packagesDir, pkg, DIST_DIR)],
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
};

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename)
  await analyze(path.resolve(process.argv[2] ?? path.join(import.meta.dirname, "..", "packages")));
