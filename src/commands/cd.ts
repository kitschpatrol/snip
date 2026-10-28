import { execa } from 'execa'
import { env } from 'node:process'
import untildify from 'untildify'
import { log } from '../log.js'

/**
 * Opens a shell in the specified snip library.
 */
export async function cd(libraryPath: string) {
	libraryPath = untildify(libraryPath)

	if (env.SHELL === undefined || env.SHELL === '') {
		log.error(`This command requires your SHELL environment variable to be defined`)
	} else {
		await execa(env.SHELL, ['-i'], {
			cwd: libraryPath,
			env,
			stdio: 'inherit',
		})
	}
}
