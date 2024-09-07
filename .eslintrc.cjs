/* eslint-disable perfectionist/sort-objects */

/* @type {import('eslint').Linter.Config} */
module.exports = {
	root: true,
	extends: ['@kitschpatrol/eslint-config'],
	// Overrides
	overrides: [
		{
			// Some weird inconsistency between VSCode and CLI eslint execution
			files: ['./src/cli.ts'],
			rules: {
				'n/hashbang': 'off',
				'@typescript-eslint/no-unsafe-call': 'off',
			},
		},
	],
}
