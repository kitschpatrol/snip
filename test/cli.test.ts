import { execa } from 'execa'
import { describe, expect, it } from 'vitest'

const VERSION_REGEX = /^\d+\.\d+\.\d+$/

describe('Snip CLI', () => {
	it('Program reports version', async () => {
		const { exitCode, stdout } = await execa('node', ['./dist/cli.js', '--version'])

		expect(stdout).toMatch(VERSION_REGEX)
		expect(exitCode).toBe(0)
	})
})
