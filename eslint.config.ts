import { eslintConfig } from '@kitschpatrol/eslint-config'

export default eslintConfig({
	ignores: ['examples/**/*'],
	ts: {
		overrides: {
			'depend/ban-dependencies': [
				'error',
				{
					allowed: ['execa', 'fs-extra'],
				},
			],
			'import/no-named-as-default-member': 'off',
		},
	},
})
