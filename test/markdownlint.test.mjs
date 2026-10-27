import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import process from "node:process";

// resolve.test.mjs proves the JSON resolves; it cannot prove markdownlint still
// honours it. markdownlint ignores parameters it does not recognise, so a
// renamed MD013 option would leave the config inert with every shape test
// green. Run the real CLI the way a consumer does: a .markdownlint.json that
// extends the package, over files on either side of each configured limit.
const require = createRequire(import.meta.url);
const CLI = path.join(path.dirname(require.resolve("markdownlint-cli/package.json")), "markdownlint.js");
const CONFIG = require.resolve("@ivuorinen/markdownlint-config");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "markdownlint-config-lint-"));
after(() => fs.rmSync(root, { recursive: true, force: true }));
fs.writeFileSync(path.join(root, ".markdownlint.json"), `${JSON.stringify({ extends: CONFIG })}\n`);

/**
 * Lint one Markdown document with the consumer config.
 *
 * Runs from the temp project root with relative paths, as a consumer would:
 * markdownlint-cli matches ignore patterns against paths relative to its cwd
 * and throws on a file outside it.
 * @param {string} markdown The document.
 * @returns {{ status: number | null, output: string }} The CLI's exit status and its report.
 */
function lint(markdown) {
  fs.writeFileSync(path.join(root, "doc.md"), markdown);
  const result = spawnSync(process.execPath, [CLI, "--config", ".markdownlint.json", "doc.md"], {
    cwd: root,
    encoding: "utf8",
  });
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

// Exactly `length` characters of space-separated words, ending on a letter so
// MD009 (trailing spaces) never fires. MD013 is non-strict by default: it only
// reports a long line that still has whitespace past the limit, which is why
// the over-long case below appends " x".
const words = (length) => `${"word ".repeat(length).slice(0, length - 1)}w`;

test("MD013 allows a 200-character line and reports a longer one", () => {
  assert.strictEqual(lint(`# Title\n\n${words(200)}\n`).status, 0);

  const tooLong = lint(`# Title\n\n${words(200)} x\n`);
  assert.strictEqual(tooLong.status, 1);
  assert.match(tooLong.output, /MD013/u);
});

test("MD013 skips code blocks and tables", () => {
  const long = words(250);
  assert.strictEqual(lint(`# Title\n\n\`\`\`text\n${long}\n\`\`\`\n`).status, 0);
  assert.strictEqual(lint(`# Title\n\n| Column |\n| --- |\n| ${long} |\n`).status, 0);
});

test("MD024 allows repeated headings under different parents only", () => {
  assert.strictEqual(lint("# Title\n\n## One\n\n### Notes\n\n## Two\n\n### Notes\n").status, 0);

  const siblings = lint("# Title\n\n## Notes\n\n## Notes\n");
  assert.strictEqual(siblings.status, 1);
  assert.match(siblings.output, /MD024/u);
});

test("MD033 and MD041 are off: inline HTML and a non-heading first line pass", () => {
  assert.strictEqual(lint("Intro line, not a heading.\n\n<details><summary>More</summary>Body</details>\n").status, 0);
});

test("the rest of the default rule set is still on", () => {
  const trailingSpace = lint("# Title\n\nText with trailing space \n");
  assert.strictEqual(trailingSpace.status, 1);
  assert.match(trailingSpace.output, /MD009/u);
});
