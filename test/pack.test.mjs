import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

// resolve.test.mjs resolves the package by name, but that reads the working
// tree, so a file left out of the `files` allowlist passes there and ships
// broken. npm always packs `main`, so the exposed files are the `exports`
// targets other than `main` and the postinstall script. Pack the package the
// way npm publishes it and assert that every file a consumer reaches is in the
// tarball.
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

const clean = (p) => normalize(p).replace(/^\.\//u, "").replaceAll("\\", "/");

// Every string leaf of the exports map is a published entry point.
const exportTargets = (value) =>
  typeof value === "string" ? [value] : Object.values(value ?? {}).flatMap(exportTargets);

// The postinstall runs in the consumer's install, so its script must ship too.
const scriptFile = (command) => command?.match(/^node\s+(\S+)/u)?.[1];

test("npm pack ships every file a consumer reaches", () => {
  const out = execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
    cwd: root,
    encoding: "utf8",
  });
  const packed = new Set(JSON.parse(out)[0].files.map((f) => clean(f.path)));

  const required = [pkg.main, ...exportTargets(pkg.exports), scriptFile(pkg.scripts?.postinstall)]
    .filter(Boolean)
    .map(clean);
  assert.ok(required.length > 0, "package.json names no published files");

  const missing = [...new Set(required)].filter((file) => !packed.has(file));
  assert.deepStrictEqual(missing, [], `missing from the tarball: ${missing.join(", ")}`);
});
