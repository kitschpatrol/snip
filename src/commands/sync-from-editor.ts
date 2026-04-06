import untildify from 'untildify'
import { VscodeAdapter } from '../adapters/vscode.js'
import { log } from '../log.js'

/**
 * Syncs snippets from the specified editors to the specified snip library.
 */
export async function syncFromEditors(sourceEditors: string[], libraryPath: string) {
	log.debug(`syncing snippets from ${JSON.stringify(sourceEditors)} to ${libraryPath}`)
	libraryPath = untildify(libraryPath)

	for (const editor of sourceEditors) {
		switch (editor) {
			case 'vscode': {
				try {
					const snips = await VscodeAdapter.getSnipsFromEditor()
					log.debug(`snips: ${JSON.stringify(snips)}`)
				} catch (error) {
					log.error(`error: ${JSON.stringify(error, undefined, 2)}`)
				}

				break
			}

			default: {
				log.error(`Unknown editor ${editor}`)
			}
		}
	}
}
