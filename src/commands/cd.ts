import { execa } from 'execa'
import { env } from 'node:process'
import log from '../logger.js'

export async function cd(libraryPath: string) {
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
