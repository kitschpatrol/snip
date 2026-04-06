/* eslint-disable ts/naming-convention */

import { execa } from 'execa'
import fs from 'fs-extra'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const CLI_PATH = path.resolve('dist/cli.js')
const VERSION_REGEX = /^\d+\.\d+\.\d+$/

async function createTempDirectory(prefix: string): Promise<string> {
	return fs.mkdtemp(path.join(os.tmpdir(), `snip-test-${prefix}-`))
}

describe('Snip CLI', () => {
	describe('version', () => {
		it('reports version with --version flag', async () => {
			const { exitCode, stdout } = await execa('node', [CLI_PATH, '--version'])
			expect(stdout).toMatch(VERSION_REGEX)
			expect(exitCode).toBe(0)
		})

		it('reports version with -v flag', async () => {
			const { exitCode, stdout } = await execa('node', [CLI_PATH, '-v'])
			expect(stdout).toMatch(VERSION_REGEX)
			expect(exitCode).toBe(0)
		})
	})

	describe('help', () => {
		it('shows help with --help flag', async () => {
			const { exitCode, stdout } = await execa('node', [CLI_PATH, '--help'])
			expect(stdout).toContain('snip')
			expect(stdout).toContain('Options:')
			expect(stdout).toContain('Commands:')
			expect(exitCode).toBe(0)
		})

		it('lists all expected commands in help output', async () => {
			const { stdout } = await execa('node', [CLI_PATH, '--help'])
			expect(stdout).toContain('add')
			expect(stdout).toContain('cd')
			expect(stdout).toContain('list')
			expect(stdout).toContain('setup')
			expect(stdout).toContain('sync-to-editors')
			expect(stdout).toContain('sync-from-editors')
		})

		it('shows help for the list subcommand', async () => {
			const { exitCode, stdout } = await execa('node', [CLI_PATH, 'help', 'list'])
			expect(stdout).toContain('list')
			expect(exitCode).toBe(0)
		})

		it('shows global options in help', async () => {
			const { stdout } = await execa('node', [CLI_PATH, '--help'])
			expect(stdout).toContain('--config')
			expect(stdout).toContain('--library')
			expect(stdout).toContain('--debug')
		})
	})

	describe('error handling', () => {
		it('shows help after unknown command', async () => {
			const result = await execa('node', [CLI_PATH, 'nonexistent'], { reject: false })
			expect(result.exitCode).not.toBe(0)
			expect(result.stderr + result.stdout).toContain('nonexistent')
		})
	})

	describe('list command', () => {
		let tempLibrary: string

		beforeEach(async () => {
			tempLibrary = await createTempDirectory('list')

			await fs.writeFile(
				path.join(tempLibrary, 'cl--Print value console.js+ts+jsx+tsx'),
				'console.log($1);$0',
			)
			await fs.writeFile(
				path.join(tempLibrary, 'html--HTML 5 boilerplate.html'),
				'<!doctype html><html></html>',
			)
			await fs.writeFile(
				path.join(tempLibrary, 'li--Lorem Ipsum.all'),
				'Lorem ipsum dolor sit amet',
			)
		})

		afterEach(async () => {
			await fs.remove(tempLibrary)
		})

		it('lists snippets from a custom library path', async () => {
			const { exitCode, stdout } = await execa('node', [CLI_PATH, '--library', tempLibrary, 'list'])

			expect(exitCode).toBe(0)
			expect(stdout).toContain('cl--Print value console.js+ts+jsx+tsx')
			expect(stdout).toContain('html--HTML 5 boilerplate.html')
			expect(stdout).toContain('li--Lorem Ipsum.all')
		})

		it('lists snippets using environment variable', async () => {
			const { exitCode, stdout } = await execa('node', [CLI_PATH, 'list'], {
				env: { SNIP_LIBRARY_DIR: tempLibrary },
			})

			expect(exitCode).toBe(0)
			expect(stdout).toContain('cl--Print value console.js+ts+jsx+tsx')
		})

		it('handles empty library directory', async () => {
			const emptyLibrary = await createTempDirectory('empty')
			try {
				const { exitCode } = await execa('node', [CLI_PATH, '--library', emptyLibrary, 'list'])
				expect(exitCode).toBe(0)
			} finally {
				await fs.remove(emptyLibrary)
			}
		})

		it('handles library with single snippet', async () => {
			const singleLibrary = await createTempDirectory('single')
			await fs.writeFile(path.join(singleLibrary, 'test--A test snippet.js'), 'const x = 1;')
			try {
				const { exitCode, stdout } = await execa('node', [
					CLI_PATH,
					'--library',
					singleLibrary,
					'list',
				])
				expect(exitCode).toBe(0)
				expect(stdout).toContain('test--A test snippet.js')
			} finally {
				await fs.remove(singleLibrary)
			}
		})

		it('respects .snipignore files', async () => {
			const ignoreLibrary = await createTempDirectory('ignore')
			await fs.writeFile(path.join(ignoreLibrary, 'visible--Visible snippet.js'), 'visible')
			await fs.writeFile(path.join(ignoreLibrary, 'excluded--Excluded snippet.js'), 'excluded')
			await fs.writeFile(path.join(ignoreLibrary, '.snipignore'), 'excluded--Excluded snippet.js\n')
			try {
				const { exitCode, stdout } = await execa('node', [
					CLI_PATH,
					'--library',
					ignoreLibrary,
					'list',
				])
				expect(exitCode).toBe(0)
				expect(stdout).toContain('visible--Visible snippet.js')
				expect(stdout).not.toContain('excluded--Excluded snippet.js')
			} finally {
				await fs.remove(ignoreLibrary)
			}
		})
	})

	describe('list command with examples directory', () => {
		it('can list the bundled example snippets', async () => {
			const examplesPath = path.resolve('examples')
			const { exitCode, stdout } = await execa('node', [
				CLI_PATH,
				'--library',
				examplesPath,
				'list',
			])

			expect(exitCode).toBe(0)
			expect(stdout).toContain('cl--Print value console.js+ts+jsx+tsx')
			expect(stdout).toContain('html--HTML 5 boilerplate.html')
			expect(stdout).toContain('li--Lorem Ipsum.all')
		})
	})

	describe('debug mode', () => {
		it('accepts --debug flag without error', async () => {
			const tempLibrary = await createTempDirectory('debug')
			await fs.writeFile(path.join(tempLibrary, 'test--Debug test.js'), 'test')
			try {
				const { exitCode } = await execa('node', [
					CLI_PATH,
					'--debug',
					'--library',
					tempLibrary,
					'list',
				])
				expect(exitCode).toBe(0)
			} finally {
				await fs.remove(tempLibrary)
			}
		})

		it('accepts debug environment variable', async () => {
			const tempLibrary = await createTempDirectory('debug-env')
			await fs.writeFile(path.join(tempLibrary, 'test--Debug env test.js'), 'test')
			try {
				const { exitCode } = await execa('node', [CLI_PATH, '--library', tempLibrary, 'list'], {
					env: { SNIP_DEBUG: 'true' },
				})
				expect(exitCode).toBe(0)
			} finally {
				await fs.remove(tempLibrary)
			}
		})
	})

	describe('config file handling', () => {
		let tempConfigDirectory: string
		let tempLibrary: string

		beforeEach(async () => {
			tempConfigDirectory = await createTempDirectory('config')
			tempLibrary = await createTempDirectory('config-lib')
			await fs.writeFile(path.join(tempLibrary, 'cfg--Config test snippet.js'), 'config test')
		})

		afterEach(async () => {
			await fs.remove(tempConfigDirectory)
			await fs.remove(tempLibrary)
		})

		it('accepts --config flag with a valid config file path', async () => {
			const configFile = path.join(tempConfigDirectory, 'config.json')
			await fs.writeJSON(configFile, { library: tempLibrary })

			const { exitCode } = await execa('node', [
				CLI_PATH,
				'--config',
				configFile,
				'--library',
				tempLibrary,
				'list',
			])

			expect(exitCode).toBe(0)
		})

		it('accepts config file environment variable', async () => {
			const configFile = path.join(tempConfigDirectory, 'config.json')
			await fs.writeJSON(configFile, { library: tempLibrary })

			const { exitCode } = await execa('node', [CLI_PATH, '--library', tempLibrary, 'list'], {
				env: { SNIP_CONFIG_FILE: configFile },
			})

			expect(exitCode).toBe(0)
		})

		it('falls back to defaults when config file does not exist', async () => {
			const nonExistentConfig = path.join(tempConfigDirectory, 'nonexistent.json')
			const result = await execa(
				'node',
				[CLI_PATH, '--config', nonExistentConfig, '--library', tempLibrary, 'list'],
				{ reject: false },
			)
			expect(result.exitCode).toBe(0)
		})
	})

	describe('cross-platform path handling', () => {
		let tempLibrary: string

		beforeEach(async () => {
			tempLibrary = await createTempDirectory('paths')
		})

		afterEach(async () => {
			await fs.remove(tempLibrary)
		})

		it('handles paths with spaces', async () => {
			const spacedDirectory = path.join(tempLibrary, 'path with spaces')
			await fs.ensureDir(spacedDirectory)
			await fs.writeFile(path.join(spacedDirectory, 'space--Space test.js'), 'space test')

			const { exitCode, stdout } = await execa('node', [
				CLI_PATH,
				'--library',
				spacedDirectory,
				'list',
			])
			expect(exitCode).toBe(0)
			expect(stdout).toContain('space--Space test.js')
		})

		it('handles deeply nested library paths', async () => {
			const deepDirectory = path.join(tempLibrary, 'a', 'b', 'c', 'd')
			await fs.ensureDir(deepDirectory)
			await fs.writeFile(path.join(deepDirectory, 'deep--Deeply nested.js'), 'deep')

			const { exitCode, stdout } = await execa('node', [
				CLI_PATH,
				'--library',
				deepDirectory,
				'list',
			])
			expect(exitCode).toBe(0)
			expect(stdout).toContain('deep--Deeply nested.js')
		})
	})
})
