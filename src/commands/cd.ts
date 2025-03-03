import { execa } from 'execa'
import { env } from 'node:process'
import untildify from 'untildify'
import log from '../logger.js'

/**
 * Opens a shell in the specified snip library.
 */
export async function cd(libraryPath: string) {
	libraryPath = untildify(libraryPath)

	if (env.SHELL) {
		await execa(env.SHELL, ['-i'], {
			cwd: libraryPath,
			env,
			stdio: 'inherit',
		})
	} else {
		log.error(`This command requires your SHELL environment variable to be defined`)
	}
}
