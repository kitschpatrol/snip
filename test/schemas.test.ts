import { describe, expect, it } from 'vitest'
import { filePath, snipSchema, snipsSchema } from '../src/schemas'

describe('filePath schema', () => {
	it('accepts a valid absolute path', () => {
		expect(filePath.parse('/home/user/.snip')).toBe('/home/user/.snip')
	})

	it('accepts a tilde path', () => {
		expect(filePath.parse('~/.snip')).toBe('~/.snip')
	})

	it('accepts a Windows-style path', () => {
		expect(filePath.parse(String.raw`C:\Users\user\.snip`)).toBe(String.raw`C:\Users\user\.snip`)
	})

	it('accepts a relative path', () => {
		expect(filePath.parse('./snippets')).toBe('./snippets')
	})

	it('accepts a path with spaces', () => {
		expect(filePath.parse('/home/user/my snippets')).toBe('/home/user/my snippets')
	})

	it('rejects an empty string', () => {
		expect(() => filePath.parse('')).toThrow()
	})
})

describe('snipSchema', () => {
	it('validates a complete snip', () => {
		const snip = {
			all: false,
			body: 'console.log($1);$0',
			description: 'Print value console',
			extensions: ['js', 'ts'],
			prefix: 'cl',
		}
		expect(snipSchema.parse(snip)).toEqual(snip)
	})

	it('validates a snip with all flag', () => {
		const snip = {
			all: true,
			body: 'Lorem ipsum',
			description: 'Lorem Ipsum',
			extensions: [],
			prefix: 'li',
		}
		expect(snipSchema.parse(snip)).toEqual(snip)
	})

	it('validates a snip without optional fields', () => {
		const snip = {
			all: false,
			body: 'test body',
		}
		expect(snipSchema.parse(snip)).toEqual(snip)
	})

	it('rejects a snip with empty body', () => {
		expect(() =>
			snipSchema.parse({
				all: false,
				body: '',
			}),
		).toThrow()
	})

	it('rejects a snip without body', () => {
		expect(() =>
			snipSchema.parse({
				all: false,
			}),
		).toThrow()
	})

	it('rejects a snip without all field', () => {
		expect(() =>
			snipSchema.parse({
				body: 'test',
			}),
		).toThrow()
	})
})

describe('snipsSchema', () => {
	it('validates an array of snips', () => {
		const snips = [
			{
				all: false,
				body: 'test1',
				extensions: ['js'],
				prefix: 'a',
			},
			{
				all: true,
				body: 'test2',
				prefix: 'b',
			},
		]
		expect(snipsSchema.parse(snips)).toEqual(snips)
	})

	it('validates an empty array', () => {
		expect(snipsSchema.parse([])).toEqual([])
	})

	it('rejects non-array input', () => {
		expect(() => snipsSchema.parse('not an array')).toThrow()
	})
})
