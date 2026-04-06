import { createLogger } from 'lognow'
import { name } from '../package.json' with { type: 'json' }

export let log = createLogger({
	logToConsole: {
		showLevel: false,
		showName: false,
		showTime: false,
	},
	name,
})

/**
 * Recreates the logger with verbose output enabled or disabled.
 */
export function setVerbose(verbose: boolean) {
	log = createLogger({
		logToConsole: {
			showLevel: verbose,
			showName: false,
			showTime: verbose,
		},
		name,
		verbose,
	})
}
