import { VscodeAdapter } from '../adapters/vscode.js'
import { log } from '../log.js'

/**
 * Syncs snippets from the specified editors to the specified snip library.
 */
export async function syncFromEditors(sourceEditors: string[], libraryPath: string) {
	log.debug(`syncing snippets from ${JSON.stringify(sourceEditors)} to ${libraryPath}`)

	for (const editor of sourceEditors) {
		if (editor !== 'vscode') {
			log.error(`Unknown editor ${editor}`)
			continue
		}

		try {
			const snips = await VscodeAdapter.getSnipsFromEditor()
			log.debug(`snips: ${JSON.stringify(snips)}`)
		} catch (error) {
			log.error(`error: ${JSON.stringify(error, undefined, 2)}`)
		}
	}
}
