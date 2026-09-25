"use strict";

/* eslint no-console: "off", n/no-process-exit: "off", no-undefined: "off" -- CLI app that gives users feedback */

const fs = require("node:fs");
const path = require("node:path");
// noinspection NpmUsedModulesInstalled
const process = require("node:process");
const checkConfig = require("@ivuorinen/config-checker");

// This runs on every consumer install, and a non-zero exit fails that whole
// install. The starter config is a convenience, so every step below degrades to
// a message instead of throwing.

// INIT_CWD is an npm/yarn convention, not a guarantee.
const cwd = process.env.INIT_CWD || process.cwd();
const foundConfig = checkConfig("markdownlint", cwd);

if (foundConfig.length > 0) {
  console.log("markdownlint-config: Found existing markdownlint config file, skipping creation.");
  console.log("markdownlint-config: If you want to create a new config file, please remove the existing one.");
  console.log(`markdownlint-config: Found config files at: ${foundConfig.join(", ")}`);
  process.exit(0);
}

const filePath = path.join(cwd, ".markdownlint.json");
const fileConfigObject = {
  extends: "@ivuorinen/markdownlint-config",
};

// "wx" makes "does it exist?" and "write it" one atomic step, so a concurrent
// install cannot create the file in between and have it overwritten.
try {
  fs.writeFileSync(filePath, JSON.stringify(fileConfigObject, undefined, 2), { flag: "wx" });
} catch (error) {
  if (error.code !== "EEXIST") {
    console.log(`markdownlint-config: could not write ${filePath} (${error.code || error.message}).`);
    console.log(`markdownlint-config: create it manually with ${JSON.stringify(fileConfigObject)}`);
  }
}
