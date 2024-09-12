import untildify from 'untildify'
import { VscodeAdapter } from '../adapters/vscode.js'
import log from '../logger.js'
import { allSnips } from '../utils.js'

export async function syncToEditors(libraryPath: string, destinationEditors: string[]) {
	log.debug(`syncing snippets from ${libraryPath} to ${String(destinationEditors)}`)
	libraryPath = untildify(libraryPath)

	// Get all the snippets
	const snips = await allSnips(libraryPath)

	for (const editor of destinationEditors) {
		switch (editor) {
			case 'vscode': {
				try {
					await VscodeAdapter.writeSnipsToEditor(snips)
				} catch (error) {
					log.error(`error: ${String(error)}`)
				}

				break
			}

			default: {
				log.error(`Unknown editor ${editor}`)
			}
		}
	}
}
