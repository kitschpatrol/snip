import { describe, expect, it } from 'vitest'
import { VscodeAdapter } from '../../src/adapters/vscode'

describe('Snip VSCode Adapter', () => {
	it('Reads snippets from extensions', async () => {
		// Expect(stdout[0]).toMatch(/^\d+\.\d+\.\d+$/);
		// expect(code).toBe(0);
		const snips = await VscodeAdapter.getSnipsFromEditor()

		expect(snips).not.toBeNull()
	})
})
