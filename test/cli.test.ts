import { execa } from 'execa'
import { describe, expect, it } from 'vitest'

describe('Snip CLI', () => {
	it('Program reports version', async () => {
		const { code, stdout } = await execa('node', ['./dist/cli.js', '--version'])

		expect(stdout[0]).toMatch(/^\d+\.\d+\.\d+$/)
		expect(code).toBe(0)
	})
})
