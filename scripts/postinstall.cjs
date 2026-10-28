"use strict";

/* eslint no-console: "off", no-undefined: "off" -- CLI app that gives users feedback */

const { writeStarterConfig } = require("@ivuorinen/config-checker");

// This runs on every consumer install, and a non-zero exit fails that whole
// install. writeStarterConfig never throws: it falls back to the working
// directory when INIT_CWD is unset, creates the file with "wx" so a config a
// concurrent install wrote is never overwritten, and returns a failed write for
// this script to report.
const fileConfigObject = {
  extends: "@ivuorinen/markdownlint-config",
};
const result = writeStarterConfig(
  "markdownlint",
  ".markdownlint.json",
  JSON.stringify(fileConfigObject, undefined, 2),
);

if (result.status === "found") {
  console.log("markdownlint-config: Found existing markdownlint config file, skipping creation.");
  console.log("markdownlint-config: If you want to create a new config file, please remove the existing one.");
  console.log(`markdownlint-config: Found config files at: ${result.found.join(", ")}`);
} else if (result.status === "failed") {
  console.log(`markdownlint-config: could not write ${result.filePath} (${result.error.code || result.error.message}).`);
  console.log(`markdownlint-config: create it manually with ${JSON.stringify(fileConfigObject)}`);
}
