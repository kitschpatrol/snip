# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.17] - 2026-11-01

### Maintenance

- Refresh declared runtime requirements for Execa, Inquirer, lognow, and Zod.
- Update shared configuration, tsdown, Vitest, Node.js types, and pnpm; remove obsolete release-age exemptions and adjust contributor-tool peer compatibility.
- Build the CLI before lint and fix commands, and move contributor skill setup from the prepare script to pnpm workspace configuration.
- Run dependency-update automation monthly, refresh CI and release actions, and make link checks skip loopback URLs and tolerate empty link sets.

## [0.0.16] - 2026-10-06

### Documentation

- Correct the documented Node.js requirement, add one-off execution with npx, and regenerate npm and Homebrew installation guidance.

### Maintenance

- Update fs-extra and Inquirer runtime requirements.
- Refresh pnpm, shared configuration, Homebrew publishing, documentation, and test tools; simplify contributor configuration and synchronize development skills during preparation.
- Add scheduled dependency-update automation and fix error-output capture in the website link-checking workflow.

## [0.0.15] - 2026-09-21

### Added

- Add Homebrew installation through `brew install kitschpatrol/tap/snip`, with formula updates integrated into releases.

### Changed

- **Breaking:** Change supported Node.js versions to `^24.16.0 || >=26.0.0`, dropping earlier releases and Node.js 25.

### Fixed

- Report a clear error when `$EDITOR` does not specify an executable.
- Emit the debug-mode startup warning only once.

### Documentation

- Document Homebrew installation alongside npm installation and refresh package and license links.

### Maintenance

- Refresh runtime requirements, including Commander 15, Execa 10, ignore-walk 9, Inquirer 14, lognow, and Zod.
- Migrate to TypeScript 6, pnpm 12, and shared-config 8; refresh development dependencies and refactor CLI and adapter code for stricter checks.
- Add automated repository and website link checks, refresh CI actions, and validate release tags against the repository's default branch.

## [0.0.14] - 2026-05-16

### Documentation

- Update contribution guidance to request discussion before pull requests and explain the linting, formatting, and README-generation tools.

### Maintenance

- Refresh fs-extra, Inquirer, lognow, and Zod runtime requirements.
- Upgrade to pnpm 11, refresh development dependencies, migrate build-script permissions, and make repository cleanup cross-platform.
- Repair npm release authentication forwarding, support release tags with or without a `v` prefix, and refresh CI actions.

## [0.0.13] - 2026-04-06

### Documentation

- Generate detailed subcommand and option reference tables and add examples for setup, snippet creation, listing, VS Code export, and opening the library shell.

### Maintenance

- Update Inquirer and mdat-plugin-cli-help dependency requirements.

## [0.0.12] - 2026-04-06

### Changed

- **Breaking:** Raise the minimum supported Node.js version to 20.17.0.
- Use lognow for CLI diagnostics, write snippet listings directly to stdout, and show VS Code import diagnostic dumps only in debug mode.

### Fixed

- Accept filesystem paths in `--library`, `--config`, and their environment variables instead of requiring URLs.
- Join snippet file paths with platform-aware path handling.
- Prevent CLI logging crashes when optional formatting settings are absent.

### Maintenance

- Migrate runtime requirements to Inquirer 13 and Zod 4, remove redundant Inquirer types, and declare previously bundled runtime libraries as production dependencies.
- Replace pkgroll with tsdown and package validation, migrate to shared-config 7, refresh development dependencies, and declare Node.js 22.18+ for contributor tooling.
- Expand automated coverage to 63 CLI, utility, schema, and VS Code adapter tests, with build, lint, and test CI on Linux, macOS, and Windows.

## [0.0.11] - 2025-12-08

### Maintenance

- Update Execa and Inquirer runtime dependency requirements.
- Fix contributor-tool dependency hoisting through pnpm workspace configuration and refresh pnpm and development dependencies.

## [0.0.10] - 2025-11-06

### Maintenance

- Update shared configuration and the CLI-help documentation generator.

## [0.0.9] - 2025-11-04

### Documentation

- Correct Markdown syntax so the README's caution notice renders as an alert.

### Maintenance

- Refresh runtime dependencies, including Commander 14, ignore-walk 8, Execa, fs-extra, and Inquirer.
- Refresh development tooling, including TypeScript 5.9 and Vitest 4; replace Chalk with picocolors and update build, documentation-generation, publishing, and metadata workflows.

## [0.0.8] - 2025-03-04

### Documentation

- Correct the repository URL in npm package metadata.

### Maintenance

- Update shared configuration and Node.js types, and remove an obsolete lint workaround.

## [0.0.7] - 2025-03-02

### Changed

- **Breaking:** Raise the minimum supported Node.js version to 20.9.0.

### Maintenance

- Refresh runtime dependencies, including Commander 13 and Inquirer 12.
- Migrate to shared-config 5 and pnpm 10, refresh TypeScript and development tools, and update internal code and build configuration for stricter checks.

## [0.0.6] - 2024-09-14

### Changed

- **Breaking:** Drop Node.js 18 support and require Node.js 20.5.0 or newer.

### Maintenance

- Refresh shared configuration, Node.js types, and Vitest; remove unused build dependencies and simplify maintenance scripts and package metadata.

## [0.0.5] - 2024-09-12

### Fixed

- Build after incrementing the release version so the published executable reports the released package version.

## [0.0.4] - 2024-09-12

### Fixed

- Read CLI version, name, and description directly from package metadata instead of stale generated metadata.

## [0.0.3] - 2024-09-12

### Fixed

- Expand `~` in configuration and library paths before filesystem access across CLI commands.
- Enable debug logging before configuration loading so startup diagnostics are visible.

### Maintenance

- Refresh pnpm, TypeScript, build, and test dependencies, and adjust the cleanup script.

## [0.0.2] - 2024-09-07

### Changed

- **Breaking:** Change supported Node.js versions to `^18.17.0 || >=20.5.0`.

### Documentation

- Show home-relative configuration and library defaults in CLI help and update the autocomplete roadmap.

### Maintenance

- Update runtime dependencies, including Execa, ignore-walk 7, and Inquirer 10.
- Replace the custom esbuild pipeline with pkgroll, distribute the executable from `dist`, remove Fig generation tooling, and refresh development dependencies and release workflows.

## [0.0.1] - 2024-05-27

### Added

- Introduce a persistent plain-text snippet library with filename-based prefixes and descriptions, multiple language extensions, `.all` snippets, and `.snipignore` exclusions.
- Create snippets interactively or from a supplied filename using `$EDITOR`, defaulting to Vim, with prompts for repeated additions.
- Provide interactive setup that saves the library location in JSON configuration and backs up existing configuration before replacement.
- Provide snippet listing, an interactive shell in the library directory, configuration and library overrides, and help, version, and debug options.
- Export snippets to VS Code on macOS, mapping file extensions to language scopes and preserving descriptions and multiline bodies.

### Documentation

- Document global npm installation, Node.js 18+ requirements, CLI commands, project background, and incomplete editor-import support.
- Add example snippets for Markdown alerts, JavaScript and TypeScript console output, HTML, Svelte, and Lorem Ipsum.

### Maintenance

- Establish TypeScript and ESM builds, linting, tests, language-map generation, and release automation.

[0.0.1]: https://github.com/kitschpatrol/snip/releases/tag/v0.0.1
[0.0.2]: https://github.com/kitschpatrol/snip/compare/v0.0.1...v0.0.2
[0.0.3]: https://github.com/kitschpatrol/snip/compare/v0.0.2...v0.0.3
[0.0.4]: https://github.com/kitschpatrol/snip/compare/v0.0.3...v0.0.4
[0.0.5]: https://github.com/kitschpatrol/snip/compare/v0.0.4...v0.0.5
[0.0.6]: https://github.com/kitschpatrol/snip/compare/v0.0.5...v0.0.6
[0.0.7]: https://github.com/kitschpatrol/snip/compare/v0.0.6...v0.0.7
[0.0.8]: https://github.com/kitschpatrol/snip/compare/v0.0.7...v0.0.8
[0.0.9]: https://github.com/kitschpatrol/snip/compare/v0.0.8...v0.0.9
[0.0.10]: https://github.com/kitschpatrol/snip/compare/v0.0.9...v0.0.10
[0.0.11]: https://github.com/kitschpatrol/snip/compare/v0.0.10...v0.0.11
[0.0.12]: https://github.com/kitschpatrol/snip/compare/v0.0.11...v0.0.12
[0.0.13]: https://github.com/kitschpatrol/snip/compare/v0.0.12...v0.0.13
[0.0.14]: https://github.com/kitschpatrol/snip/compare/v0.0.13...v0.0.14
[0.0.15]: https://github.com/kitschpatrol/snip/compare/v0.0.14...v0.0.15
[0.0.16]: https://github.com/kitschpatrol/snip/compare/v0.0.15...v0.0.16
[0.0.17]: https://github.com/kitschpatrol/snip/compare/v0.0.16...v0.0.17
