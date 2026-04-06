import fs from 'fs-extra'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { allSnips, filenameFromSnip, loadSnip } from '../src/utilities'

async function createTempDirectory(prefix: string): Promise<string> {
	return fs.mkdtemp(path.join(os.tmpdir(), `snip-test-${prefix}-`))
}

describe('filenameFromSnip', () => {
	it('constructs filename with prefix, description, and single extension', () => {
		const result = filenameFromSnip({
			all: false,
			body: 'test body',
			description: 'A test snippet',
			extensions: ['js'],
			prefix: 'test',
		})
		expect(result).toBe('test--A test snippet.js')
	})

	it('constructs filename with multiple extensions', () => {
		const result = filenameFromSnip({
			all: false,
			body: 'console.log($1)',
			description: 'Print value console',
			extensions: ['js', 'ts', 'jsx', 'tsx'],
			prefix: 'cl',
		})
		expect(result).toBe('cl--Print value console.js+ts+jsx+tsx')
	})

	it('constructs filename without description', () => {
		const result = filenameFromSnip({
			all: false,
			body: 'test',
			extensions: ['js'],
			prefix: 'test',
		})
		expect(result).toBe('test.js')
	})

	it('constructs filename with all extension flag', () => {
		const result = filenameFromSnip({
			all: true,
			body: 'Lorem ipsum',
			description: 'Lorem Ipsum',
			extensions: [],
			prefix: 'li',
		})
		expect(result).toBe('li--Lorem Ipsum.all')
	})

	it('handles prefix-only snippet', () => {
		const result = filenameFromSnip({
			all: false,
			body: 'simple',
			extensions: ['txt'],
			prefix: 'simple',
		})
		expect(result).toBe('simple.txt')
	})
})

describe('loadSnip', () => {
	let tempDirectory: string

	beforeEach(async () => {
		tempDirectory = await createTempDirectory('load-snip')
	})

	afterEach(async () => {
		await fs.remove(tempDirectory)
	})

	it('loads a snip with description and single extension', async () => {
		const filename = 'html--HTML 5 boilerplate.html'
		const body = '<!doctype html><html></html>'
		await fs.writeFile(path.join(tempDirectory, filename), body)

		const snip = await loadSnip(tempDirectory, filename)
		expect(snip.prefix).toBe('html')
		expect(snip.description).toBe('HTML 5 boilerplate')
		expect(snip.extensions).toEqual(['html'])
		expect(snip.body).toBe(body)
		expect(snip.all).toBe(false)
	})

	it('loads a snip with multiple extensions', async () => {
		const filename = 'cl--Print value console.js+ts+jsx+tsx'
		const body = 'console.log($1);$0'
		await fs.writeFile(path.join(tempDirectory, filename), body)

		const snip = await loadSnip(tempDirectory, filename)
		expect(snip.prefix).toBe('cl')
		expect(snip.description).toBe('Print value console')
		expect(snip.extensions).toEqual(['js', 'ts', 'jsx', 'tsx'])
		expect(snip.body).toBe(body)
		expect(snip.all).toBe(false)
	})

	it('loads a snip with the all extension', async () => {
		const filename = 'li--Lorem Ipsum.all'
		const body = 'Lorem ipsum dolor sit amet'
		await fs.writeFile(path.join(tempDirectory, filename), body)

		const snip = await loadSnip(tempDirectory, filename)
		expect(snip.prefix).toBe('li')
		expect(snip.description).toBe('Lorem Ipsum')
		expect(snip.extensions).toEqual([])
		expect(snip.all).toBe(true)
	})

	it('loads a snip without description', async () => {
		const filename = 'simple.js'
		const body = 'const x = 1;'
		await fs.writeFile(path.join(tempDirectory, filename), body)

		const snip = await loadSnip(tempDirectory, filename)
		expect(snip.prefix).toBe('simple')
		expect(snip.description).toBeUndefined()
		expect(snip.extensions).toEqual(['js'])
		expect(snip.body).toBe(body)
	})

	it('preserves multiline body content', async () => {
		const filename = 'multi--Multiline snippet.html'
		const body = '<!doctype html>\n<html>\n<body>\n$0\n</body>\n</html>'
		await fs.writeFile(path.join(tempDirectory, filename), body)

		const snip = await loadSnip(tempDirectory, filename)
		expect(snip.body).toBe(body)
		expect(snip.body.split('\n')).toHaveLength(6)
	})

	it('handles snippet with whitespace body', async () => {
		const filename = 'ws--Whitespace snippet.txt'
		const body = '  \n  \n  '
		await fs.writeFile(path.join(tempDirectory, filename), body)

		const snip = await loadSnip(tempDirectory, filename)
		expect(snip.body).toBe(body)
	})
})

describe('allSnips', () => {
	let tempDirectory: string

	beforeEach(async () => {
		tempDirectory = await createTempDirectory('all-snips')
	})

	afterEach(async () => {
		await fs.remove(tempDirectory)
	})

	it('loads all snips from a directory', async () => {
		await fs.writeFile(path.join(tempDirectory, 'cl--Console log.js+ts'), 'console.log($1)')
		await fs.writeFile(path.join(tempDirectory, 'html--HTML boilerplate.html'), '<html></html>')
		await fs.writeFile(path.join(tempDirectory, 'li--Lorem.all'), 'Lorem ipsum')

		const snips = await allSnips(tempDirectory)
		expect(snips).toHaveLength(3)

		const prefixes = snips.map((s) => s.prefix).toSorted((a, b) => (a ?? '').localeCompare(b ?? ''))
		expect(prefixes).toEqual(['cl', 'html', 'li'])
	})

	it('returns empty array for empty directory', async () => {
		const snips = await allSnips(tempDirectory)
		expect(snips).toEqual([])
	})

	it('respects .snipignore file', async () => {
		await fs.writeFile(path.join(tempDirectory, 'keep--Keep this.js'), 'keep')
		await fs.writeFile(path.join(tempDirectory, 'ignore--Ignore this.js'), 'ignore')
		await fs.writeFile(path.join(tempDirectory, '.snipignore'), 'ignore--Ignore this.js\n')

		const snips = await allSnips(tempDirectory)
		const prefixes = snips.map((s) => s.prefix)
		expect(prefixes).toContain('keep')
		expect(prefixes).not.toContain('ignore')
	})

	it('loads the bundled examples correctly', async () => {
		const examplesPath = path.resolve('examples')
		const snips = await allSnips(examplesPath)

		expect(snips.length).toBeGreaterThanOrEqual(10)

		const consoleLogSnip = snips.find((s) => s.prefix === 'cl')
		expect(consoleLogSnip).toBeDefined()
		expect(consoleLogSnip!.extensions).toEqual(['js', 'ts', 'jsx', 'tsx'])
		expect(consoleLogSnip!.description).toBe('Print value console')
		expect(consoleLogSnip!.body).toBe('console.log($1);$0')

		const htmlSnip = snips.find((s) => s.prefix === 'html')
		expect(htmlSnip).toBeDefined()
		expect(htmlSnip!.extensions).toEqual(['html'])
		expect(htmlSnip!.body).toContain('<!doctype html>')

		const loremSnip = snips.find((s) => s.prefix === 'li')
		expect(loremSnip).toBeDefined()
		expect(loremSnip!.all).toBe(true)
		expect(loremSnip!.extensions).toEqual([])
	})

	it('handles multiple snips with similar prefixes', async () => {
		await fs.writeFile(path.join(tempDirectory, 'alert--Generic alert.md'), 'alert')
		await fs.writeFile(path.join(tempDirectory, 'ac--Caution alert.md'), 'caution')
		await fs.writeFile(path.join(tempDirectory, 'aw--Warning alert.md'), 'warning')

		const snips = await allSnips(tempDirectory)
		expect(snips).toHaveLength(3)
		const prefixes = snips.map((s) => s.prefix).toSorted((a, b) => (a ?? '').localeCompare(b ?? ''))
		expect(prefixes).toEqual(['ac', 'alert', 'aw'])
	})

	it('handles .snipignore with glob patterns', async () => {
		await fs.writeFile(path.join(tempDirectory, 'keep--Keep.js'), 'keep')
		await fs.writeFile(path.join(tempDirectory, 'draft--Draft.md'), 'draft')
		await fs.writeFile(path.join(tempDirectory, 'notes--Notes.md'), 'notes')
		await fs.writeFile(path.join(tempDirectory, '.snipignore'), '*.md\n')

		const snips = await allSnips(tempDirectory)
		const prefixes = snips.map((s) => s.prefix)
		expect(prefixes).toContain('keep')
		expect(prefixes).not.toContain('draft')
		expect(prefixes).not.toContain('notes')
	})
})

describe('roundtrip: filenameFromSnip and loadSnip', () => {
	let tempDirectory: string

	beforeEach(async () => {
		tempDirectory = await createTempDirectory('roundtrip')
	})

	afterEach(async () => {
		await fs.remove(tempDirectory)
	})

	it('roundtrips a basic snippet', async () => {
		const original = {
			all: false,
			body: 'console.log($1);$0',
			description: 'Print value console',
			extensions: ['js', 'ts'],
			prefix: 'cl',
		}

		const filename = filenameFromSnip(original)
		await fs.writeFile(path.join(tempDirectory, filename), original.body)
		const loaded = await loadSnip(tempDirectory, filename)

		expect(loaded.prefix).toBe(original.prefix)
		expect(loaded.description).toBe(original.description)
		expect(loaded.extensions).toEqual(original.extensions)
		expect(loaded.body).toBe(original.body)
		expect(loaded.all).toBe(original.all)
	})

	it('roundtrips an all-extension snippet', async () => {
		const original = {
			all: true,
			body: 'Lorem ipsum dolor sit amet',
			description: 'Lorem Ipsum',
			extensions: [],
			prefix: 'li',
		}

		const filename = filenameFromSnip(original)
		expect(filename).toBe('li--Lorem Ipsum.all')

		await fs.writeFile(path.join(tempDirectory, filename), original.body)
		const loaded = await loadSnip(tempDirectory, filename)

		expect(loaded.all).toBe(true)
		expect(loaded.extensions).toEqual([])
		expect(loaded.body).toBe(original.body)
	})

	it('roundtrips a snippet without description', async () => {
		const original = {
			all: false,
			body: 'simple body',
			extensions: ['txt'],
			prefix: 'simple',
		}

		const filename = filenameFromSnip(original)
		expect(filename).toBe('simple.txt')

		await fs.writeFile(path.join(tempDirectory, filename), original.body)
		const loaded = await loadSnip(tempDirectory, filename)

		expect(loaded.prefix).toBe('simple')
		expect(loaded.description).toBeUndefined()
		expect(loaded.body).toBe(original.body)
	})
})
