import untildify from 'untildify'
import log from '../logger.js'
import { allSnips, filenameFromSnip } from '../utilities.js'

/**
 * Lists all the snippets in the specified snip library.
 */
export async function list(libraryPath: string) {
	libraryPath = untildify(libraryPath)

	const snips = await allSnips(libraryPath)
	for (const snip of snips) {
		log.info(filenameFromSnip(snip))
	}
}
