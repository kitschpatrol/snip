import { execa } from 'execa'
import { describe, expect, it } from 'vitest'

describe('Snip CLI', () => {
	it('Program reports version', async () => {
		const { exitCode, stdout } = await execa('node', ['./bin/cli.js', '--version'])

		expect(stdout).toMatch(/^\d+\.\d+\.\d+$/)
		expect(exitCode).toBe(0)
	})
})
