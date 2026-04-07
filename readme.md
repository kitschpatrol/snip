<!-- title -->

# @kitschpatrol/snip

<!-- /title -->

<!-- badges -->

[![NPM Package @kitschpatrol/snip](https://img.shields.io/npm/v/@kitschpatrol/snip.svg)](https://npmjs.com/package/@kitschpatrol/snip)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/kitschpatrol/snip/actions/workflows/ci.yml/badge.svg)](https://github.com/kitschpatrol/snip/actions/workflows/ci.yml)

<!-- /badges -->

<!-- short-description -->

**A CLI tool for snippet management.**

<!-- /short-description -->

> [!CAUTION]
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

#### Command: `snip`

A CLI tool for snippet management.

This section lists top-level commands for `snip`.

Usage:

```txt
snip [options] [command]
```

| Command             | Argument       | Description                                      |
| ------------------- | -------------- | ------------------------------------------------ |
| `add`               | `[filename]`   | add a snippet                                    |
| `cd`                |                | launch a shell in the snippets directory         |
| `list`              |                | list all snippets                                |
| `setup`             |                | set up snip                                      |
| `sync-to-editors`   | `[editors...]` | sync snippets to editors                         |
| `sync-from-editors` | `[editors...]` | sync snippets from editors (not yet implemented) |

| Option              | Argument | Description                                         | Default                      |
| ------------------- | -------- | --------------------------------------------------- | ---------------------------- |
| `--version`<br>`-v` |          | output the version number                           |                              |
| `--config`<br>`-c`  | `<path>` | path to configuration file                          | `~/.config/snip/config.json` |
| `--library`<br>`-l` | `<path>` | path to library directory where snippets are stored | `~/.snip`                    |
| `--debug`<br>`-d`   |          | extra logging for troubleshooting                   | `false`                      |
| `--help`<br>`-h`    |          | display help for command                            |                              |

_See the sections below for more information on each subcommand._

#### Subcommand: `snip add`

add a snippet

Usage:

```txt
snip add [options] [filename]
```

| Positional Argument | Description     |
| ------------------- | --------------- |
| `filename`          | name of snippet |

| Option           | Description              |
| ---------------- | ------------------------ |
| `--help`<br>`-h` | display help for command |

#### Subcommand: `snip cd`

launch a shell in the snippets directory

Usage:

```txt
snip cd [options]
```

| Option           | Description              |
| ---------------- | ------------------------ |
| `--help`<br>`-h` | display help for command |

#### Subcommand: `snip list`

list all snippets

Usage:

```txt
snip list [options]
```

| Option           | Description              |
| ---------------- | ------------------------ |
| `--help`<br>`-h` | display help for command |

#### Subcommand: `snip setup`

set up snip

Usage:

```txt
snip setup [options]
```

| Option           | Description              |
| ---------------- | ------------------------ |
| `--help`<br>`-h` | display help for command |

#### Subcommand: `snip sync-to-editors`

sync snippets to editors

Usage:

```txt
snip sync-to-editors [options] [editors...]
```

| Positional Argument | Description        | Default      |
| ------------------- | ------------------ | ------------ |
| `editors`           | editors to sync to | `["vscode"]` |

| Option           | Description              |
| ---------------- | ------------------------ |
| `--help`<br>`-h` | display help for command |

#### Subcommand: `snip sync-from-editors`

sync snippets from editors (not yet implemented)

Usage:

```txt
snip sync-from-editors [options] [editors...]
```

| Positional Argument | Description        | Default      |
| ------------------- | ------------------ | ------------ |
| `editors`           | editors to sync to | `["vscode"]` |

| Option           | Description              |
| ---------------- | ------------------------ |
| `--help`<br>`-h` | display help for command |

<!-- /cli-help -->

### Examples

Set up snip for the first time:

```sh
snip setup
# Enter a pathname for your snippets library (~/.snip):
```

Add a new snippet interactively — snip prompts for a prefix, description, and language, then opens your `$EDITOR`:

```sh
snip add
# Prefix (the trigger keyword for your snippet): cl
# A quick description of your snippet (optional): Print value to console
# Language (...): js+ts+jsx+tsx
# Opens your editor to write the snippet body...
```

Or pass a filename directly:

```sh
snip add "cl--Print value to console.js+ts+jsx+tsx"
```

List all snippets in your library:

```sh
snip list
# cl--Print value to console.js+ts+jsx+tsx
# html--HTML 5 boilerplate.html
# li--Lorem Ipsum.all
```

Sync your snippet library to VS Code:

```sh
snip sync-to-editors vscode
```

Jump into your snippets directory to edit files directly:

```sh
snip cd
```

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
