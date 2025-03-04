<!--+ Warning: Content inside HTML comment blocks was generated by mdat and may be overwritten. +-->

<!-- title -->

# @kitschpatrol/snip

<!-- /title -->

<!-- badges -->

[![NPM Package @kitschpatrol/snip](https://img.shields.io/npm/v/@kitschpatrol/snip.svg)](https://npmjs.com/package/@kitschpatrol/snip)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<!-- /badges -->

<!-- short-description -->

**A CLI tool for snippet management.**

<!-- /short-description -->

> \[!CAUTION]
> This tool is a work in progress, certain commands are not yet implemented and
> others might behave unpredictably. I don't recommend using it until a 1.0.0
> release.

## Overview

Snip helps you create, edit, manage, and synchronize code snippets from the command line. Synchronize to (and possibly eventually from) editors like VS Code.

Snip is a fork of [Jared Hanstra](https://github.com/jhanstra)'s [snipster](https://github.com/jhanstra/snipster). Snip includes both some [additions](#background) and some [regressions](#the-future) vs. the original.

## Getting started

### Dependencies

The `snip` CLI tool requires Node 18+.

### Installation

Install globally for access across your system:

```sh
npm install --global @kitschpatrol/snip
```

## Usage

TK

### CLI

<!-- cli-help -->

```txt
Usage: snip [options] [command]

A CLI tool for snippet management.

Options:
  -v, --version                   output the version number
  -c, --config <path>             path to configuration file (default:
                                  "~/.config/snip/config.json", env:
                                  SNIP_CONFIG_FILE)
  -l, --library <path>            path to library directory where snippets are
                                  stored (default: "~/.snip", env:
                                  SNIP_LIBRARY_DIR)
  -d, --debug                     extra logging for troubleshooting (default:
                                  false, env: SNIP_DEBUG)
  -h, --help                      display help for command

Commands:
  add [filename]                  add a snippet
  cd                              launch a shell in the snippets directory
  list                            list all snippets
  setup                           set up snip
  sync-to-editors [editors...]    sync snippets to editors
  sync-from-editors [editors...]  sync snippets from editors (not yet
                                  implemented)
  help [command]                  display help for command
```

<!-- /cli-help -->

#### Examples

TK

## Background

Snip is a fork of [Jared Hanstra](https://github.com/jhanstra)'s [snipster](https://github.com/jhanstra/snipster).

Modifications include:

- A monosyllabic name 😅.
- Migration from JavaScript → TypeScript + Zod.
- Migration from CommonJS → ES Modules.
- Migration from Yarn → PNPM.
- Added `.ignore` file support.
- Added `$EDITOR` support for creating new snippets.
- Added support for `~` in paths.
- Implemented a new automated language ID aggregation approach based on scraping plugin manifests from the VS Code marketplace.
- Added support for snippet descriptions — stored in the snippet file name itself.

## The future

- [ ] Explore Amazon Q (née Fig) auto-complete generation and integration
- [ ] Additional editor adapters
- [ ] Sync-from-editor migration fixes
- [ ] Cosmiconfig

## Maintainers

[@kitschpatrol](https://github.com/kitschpatrol)

## Acknowledgments

[Jared Hanstra](https://github.com/jhanstra) is the author of the original [snipster](https://github.com/jhanstra/snipster) project on which Snip is based.

<!-- contributing -->

## Contributing

[Issues](https://github.com/kitschpatrol/snip/issues) and pull requests are welcome.

<!-- /contributing -->

<!-- license -->

## License

[MIT](license.txt) © Eric Mika

<!-- /license -->
