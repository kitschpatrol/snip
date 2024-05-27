import esbuild from 'esbuild'

await esbuild.build({
	bundle: true,
	entryPoints: ['src/cli.ts'],
	// Note weirdness since extra-typings wraps commander, it's not just types
	external: ['@commander-js/extra-typings', 'execa', 'fs-extra', 'inquirer', 'ignore-walk'],
	format: 'esm',
	minify: false,
	outfile: 'bin/cli.js',
	platform: 'node',
	target: 'node18',
})
