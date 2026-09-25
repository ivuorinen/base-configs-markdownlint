import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

// Drive the script as a real subprocess against real directories. What can
// break is the filesystem behaviour a consumer's `npm install` triggers, so
// mocking fs would test nothing that matters.
const SCRIPT = fileURLToPath(new URL("../scripts/postinstall.cjs", import.meta.url));
const CONFIG_NAME = ".markdownlint.json";
const EXPECTED = { extends: "@ivuorinen/markdownlint-config" };

const tempRoot = () => fs.mkdtempSync(path.join(os.tmpdir(), "markdownlint-config-"));

/**
 * Run the script as npm would.
 * @param {Object} options Where to run it.
 * @param {string} options.cwd Working directory of the process.
 * @param {string|null} [options.initCwd] INIT_CWD to set; `null` unsets it entirely.
 * @returns {import("node:child_process").SpawnSyncReturns<string>} The finished process.
 */
const run = ({ cwd, initCwd = cwd }) => {
  const env = { ...process.env };
  delete env.INIT_CWD;
  if (initCwd !== null) {
    env.INIT_CWD = initCwd;
  }
  return spawnSync(process.execPath, [SCRIPT], { cwd, env, encoding: "utf8" });
};

const readConfig = (root) => JSON.parse(fs.readFileSync(path.join(root, CONFIG_NAME), "utf8"));

test("writes the starter config when the project has none", () => {
  const root = tempRoot();
  try {
    const result = run({ cwd: root });

    assert.strictEqual(result.status, 0, result.stderr);
    assert.deepStrictEqual(readConfig(root), EXPECTED);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("leaves an existing config untouched", () => {
  const root = tempRoot();
  const existing = path.join(root, CONFIG_NAME);
  const original = '{ "MD013": false }\n';
  fs.writeFileSync(existing, original);
  try {
    const result = run({ cwd: root });

    assert.strictEqual(result.status, 0, result.stderr);
    assert.strictEqual(fs.readFileSync(existing, "utf8"), original, "existing config must not be rewritten");
    assert.match(result.stdout, /skipping creation/u);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

// Regression guard: path.join(undefined) threw ERR_INVALID_ARG_TYPE and exited
// 1, failing the consumer's whole install when run outside a package manager.
test("falls back to the working directory when INIT_CWD is unset", () => {
  const root = tempRoot();
  try {
    const result = run({ cwd: root, initCwd: null });

    assert.strictEqual(result.status, 0, result.stderr);
    assert.deepStrictEqual(readConfig(root), EXPECTED);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

// Regression guard: an uncaught write error aborts the consumer's entire
// install. The unwritable target is a regular file rather than a 0555
// directory so the ENOTDIR holds even when the tests run as root.
test("does not fail the install when the config cannot be written", () => {
  const root = tempRoot();
  const target = path.join(root, "not-a-directory");
  fs.writeFileSync(target, "");
  try {
    const result = run({ cwd: root, initCwd: target });

    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.stdout, /could not write/u);
    assert.strictEqual(fs.existsSync(path.join(root, CONFIG_NAME)), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
