# @ivuorinen/markdownlint-config <!-- omit in toc -->

[![npm package][npm-badge]][npm-link] [![license MIT][license-badge]][license-link] [![code style][style-badge]][style-link]

> ivuorinen's shareable configuration for [`MarkdownLint`][markdownlint-link].

## Table of Contents <!-- omit in toc -->

- [Installation](#installation)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)

## Installation

Install `this config` as a _`devDependencies`_:

```sh
# npm
npm install @ivuorinen/markdownlint-config --save-dev

# Yarn
yarn add @ivuorinen/markdownlint-config --dev
```

Create a _`.markdownlint.json`_ in the project's root folder with the following configuration:

```json
{
  "extends": "@ivuorinen/markdownlint-config"
}
```

With npm, a `postinstall` script writes exactly this file when the project has no markdownlint config yet (npm 11
warns that the script is not covered by `allowScripts`). Yarn 4 does not run dependency install scripts, so no file is
written. pnpm refuses unapproved install scripts and fails the install until you allow this package with
`pnpm approve-builds`. In both cases create the file by hand as above.

Requires Node.js `^22.22.2 || ^24.15.0 || >=26`, the floor of the bundled `markdownlint-cli`.

## Documentation

Read the [MarkdownLint docs][markdownlint-docs-link] for more information.

## Contributing

If you are interested in helping contribute, please open an [issue][issue-link] or [pull request][pull-request-link].

## Changelog

See [CHANGELOG][changelog-link] for a human-readable history of changes.

## License

Distributed under the MIT License. See [LICENSE][license-link] for more information.

[changelog-link]: https://github.com/ivuorinen/base-configs-markdownlint/releases
[markdownlint-docs-link]: https://github.com/DavidAnson/markdownlint
[markdownlint-link]: https://github.com/DavidAnson/markdownlint
[issue-link]: https://github.com/ivuorinen/base-configs-markdownlint/issues
[license-badge]: https://img.shields.io/github/license/ivuorinen/base-configs-markdownlint?style=flat-square&labelColor=292a44&color=663399
[license-link]: ./LICENSE.md
[npm-badge]: https://img.shields.io/npm/v/@ivuorinen/markdownlint-config?style=flat-square&labelColor=292a44&color=663399
[npm-link]: https://www.npmjs.com/package/@ivuorinen/markdownlint-config
[pull-request-link]: https://github.com/ivuorinen/base-configs-markdownlint/pulls
[style-badge]: https://img.shields.io/badge/code_style-ivuorinen%E2%80%99s-663399.svg?labelColor=292a44&style=flat-square
[style-link]: https://github.com/ivuorinen/base-configs-markdownlint
