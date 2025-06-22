'use strict'

/* eslint no-console: "off", n/no-process-exit: "off", no-undefined: "off" -- CLI app that gives users feedback */

const fs = require('node:fs')
const path = require('node:path')
// noinspection NpmUsedModulesInstalled
const process = require('node:process')
const checkConfig = require('@ivuorinen/config-checker')
const foundConfig = checkConfig('markdownlint')

if (foundConfig.length > 0) {
  console.log('markdownlint-config: Found existing markdownlint config file, skipping creation.')
  console.log('markdownlint-config: If you want to create a new config file, please remove the existing one.')
  console.log(`markdownlint-config: Found config files at: ${foundConfig.join(', ')}`)
  process.exit(0)
}

const filePath = path.join(process.env.INIT_CWD, '.markdownlint.json')
const fileConfigObject = {
  extends: '@ivuorinen/markdownlint-config'
}

if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify(fileConfigObject, undefined, 2))
}
