import { readdirSync } from "node:fs";
import { request } from "node:https";
import path from "node:path";

import ora from "ora";

const packagesDir = path.resolve(process.cwd(), "packages");
const packages = readdirSync(packagesDir);

export const sync = async (): Promise<void> => {
  const promises = packages.map((packageName) =>
    import(`../packages/${packageName}/package.json`, {
      with: { type: "json" },
    }).then(
      ({ default: content }: { default: Record<string, unknown> }) =>
        new Promise<void>((resolve) => {
          const req = request(
            `https://registry-direct.npmmirror.com/-/package/${content.name as string}/syncs`,
            {
              method: "PUT",
              headers: {
                "Content-Length": 0,
              },
            },
          );

          req.write("");

          req.on("close", () => {
            resolve();
          });

          req.end();
        }),
    ),
  );

  await Promise.all(promises);
};

const npmmirrorSpinner = ora("Syncing npmmirror.com").start();

await sync();

npmmirrorSpinner.succeed();

ora("Release complete").succeed();
