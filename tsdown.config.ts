import { defineConfig } from 'tsdown'

export default defineConfig({
	dts: false,
	entry: 'src/cli.ts',
	fixedExtension: false,
	minify: true,
	platform: 'node',
	publint: true,
})
