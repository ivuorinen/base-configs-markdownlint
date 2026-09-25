import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

// Resolve the package by its own name so the published `exports` map is
// exercised, not the file on disk. An entry pointing at a missing file fails
// here exactly as a consumer's `extends` would.
const require = createRequire(import.meta.url);
const PKG = "@ivuorinen/markdownlint-config";

test("the package resolves through its exports map to the rule set", () => {
  const config = require(PKG);
  assert.strictEqual(config.default, true);
  assert.deepStrictEqual(config.MD013, { line_length: 200, code_blocks: false, tables: false });
});

test("import() resolves the same JSON", async () => {
  const config = (await import(PKG, { with: { type: "json" } })).default;
  assert.deepStrictEqual(config, require(PKG));
});
