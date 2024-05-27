/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from 'chalk'
import { formatWithOptions } from 'node:util'
import { Logger as BaseLogger } from 'tslog'

class Logger extends BaseLogger<unknown> {
	private static instance: Logger

	private constructor() {
		super({
			prettyLogTimeZone: 'local',
			stylePrettyLogs: true,
			type: 'pretty',
		})
	}

	public static getInstance(): Logger {
		if (this.instance === undefined) {
			this.instance = new Logger()
			// Start with debug off
			Logger.getInstance().setDebug(false)
		}

		return this.instance
	}

	public setDebug(debug: boolean): void {
		if (debug) {
			Logger.getInstance().settings.minLevel = 0 // Silly
			Logger.getInstance().settings.hideLogPositionForProduction = false
			Logger.getInstance().settings.prettyLogTemplate =
				'{{hh}}:{{MM}}:{{ss}}:{{ms}}\t{{logLevelName}}\t{{filePathWithLine}}{{nameWithDelimiterPrefix}}\t'
			Logger.getInstance().settings.overwrite = {
				transportFormatted(
					logMetaMarkup: string,
					logArgs: unknown[],
					logErrors: string[],
					settings: any,
				): void {
					const logErrorsString =
						(logErrors.length > 0 && logArgs.length > 0 ? '\n' : '') + logErrors.join('\n')
					settings.prettyInspectOptions.colors = settings.stylePrettyLogs

					// Ugly, but it's the only sane point of intervention...
					let messageColor = chalk.reset
					if (logMetaMarkup.includes('DEBUG')) {
						messageColor = chalk.green
					} else if (logMetaMarkup.includes('WARN')) {
						messageColor = chalk.yellow
					} else if (logMetaMarkup.includes('ERROR')) {
						messageColor = chalk.red
					}

					console.log(
						logMetaMarkup +
							messageColor(formatWithOptions(settings.prettyInspectOptions, ...logArgs)) +
							logErrorsString,
					)
				},
			}
		} else {
			Logger.getInstance().settings.minLevel = 3 // Info
			Logger.getInstance().settings.hideLogPositionForProduction = true
			Logger.getInstance().settings.prettyLogTemplate = `{{logLevelName}}`
			Logger.getInstance().settings.overwrite = {
				transportFormatted(
					logMetaMarkup: string,
					logArgs: unknown[],
					logErrors: string[],
					settings: any,
				): void {
					const logErrorsString =
						(logErrors.length > 0 && logArgs.length > 0 ? '\n' : '') + logErrors.join('\n')
					settings.prettyInspectOptions.colors = settings.stylePrettyLogs

					// Ugly, but it's the only sane point of intervention...
					let modifiedMarkup = logMetaMarkup
					let messageColor = chalk.reset

					if (modifiedMarkup.includes('DEBUG')) {
						modifiedMarkup = chalk.blue.bold('Debug: ')
						messageColor = chalk.blue
					} else if (modifiedMarkup.includes('WARN')) {
						modifiedMarkup = chalk.yellow.bold('⚠️ ')
						messageColor = chalk.yellow
					} else if (modifiedMarkup.includes('ERROR')) {
						modifiedMarkup = chalk.red.bold('🚨')
						messageColor = chalk.red
					} else {
						modifiedMarkup = ''
					}

					console.log(
						modifiedMarkup +
							messageColor(formatWithOptions(settings.prettyInspectOptions, ...logArgs)) +
							logErrorsString,
					)
				},
			}
		}
	}
}

// Log to file...
// log.attachTransport((logObj) => {
//   appendFileSync('logs/debug.log', JSON.stringify(logObj) + '\n');
// });

export default Logger.getInstance()
