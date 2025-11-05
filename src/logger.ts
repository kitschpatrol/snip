/* eslint-disable ts/no-unsafe-assignment */
/* eslint-disable ts/no-unsafe-member-access */
/* eslint-disable ts/no-unsafe-argument */
/* eslint-disable ts/member-ordering */
/* eslint-disable ts/no-explicit-any */
import { formatWithOptions } from 'node:util'
import pc from 'picocolors'
import { Logger as BaseLogger } from 'tslog'

const identity = (text: string) => text

class Logger extends BaseLogger<unknown> {
	private static instance: Logger | undefined

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

	public getDebug(): boolean {
		return Logger.getInstance().settings.minLevel === 0
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
					let messageColor = identity
					if (logMetaMarkup.includes('DEBUG')) {
						messageColor = pc.green
					} else if (logMetaMarkup.includes('WARN')) {
						messageColor = pc.yellow
					} else if (logMetaMarkup.includes('ERROR')) {
						messageColor = pc.red
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
					let messageColor = identity

					if (modifiedMarkup.includes('DEBUG')) {
						modifiedMarkup = pc.bold(pc.blue('Debug: '))
						messageColor = pc.blue
					} else if (modifiedMarkup.includes('WARN')) {
						modifiedMarkup = pc.bold(pc.yellow('⚠️ '))
						messageColor = pc.yellow
					} else if (modifiedMarkup.includes('ERROR')) {
						modifiedMarkup = pc.bold(pc.red('🚨'))
						messageColor = pc.red
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
