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
			// Knip workaround...
			// https://github.com/webpro-nl/knip/issues/158#issuecomment-1632648598
			'jsdoc/check-tag-names': ['error', { definedTags: ['public'] }],
		},
	},
})
