import fs from 'fs-extra'
import walk from 'ignore-walk'
import path from 'node:path'
import { type z } from 'zod'
import { ALL_EXTENSION, DESCRIPTION_DELIMITER } from './constants.js'
import log from './logger.js'
import { type snipSchema, type snipsSchema } from './schemas.js'

/**
 * Constructs a safe filename from a snip object.
 */
export function filenameFromSnip(snip: z.infer<typeof snipSchema>): string {
	const extension = snip.all ? ALL_EXTENSION : snip.extensions?.join('+')
	const description = snip.description ? DESCRIPTION_DELIMITER + snip.description : ''
	return `${snip.prefix}${description}.${extension}`
}

/**
 * Loads a snip from a file.
 * @public
 */
export async function loadSnip(
	libraryPath: string,
	file: string,
): Promise<z.infer<typeof snipSchema>> {
	// TODO what about extensions with multiple dots?
	// TODO what about multiple instances of the DELIMITER?
	const rawExtension = path.extname(file)
	const [prefix, description] = path.basename(file, rawExtension).split(DESCRIPTION_DELIMITER, 2)
	const rawExtensions = rawExtension.replace('.', '').toLowerCase().split('+')
	const all = rawExtensions.includes(ALL_EXTENSION)
	const extensions = rawExtensions.filter((value) => value !== ALL_EXTENSION)

	const body = await fs.readFile(libraryPath + '/' + file, { encoding: 'utf8' })

	const snip: z.infer<typeof snipSchema> = {
		all,
		body,
		description,
		extensions,
		prefix,
	}

	return snip
}

/**
 * Loads all snips from a folder.
 */
export async function allSnips(libraryPath: string): Promise<z.infer<typeof snipsSchema>> {
	const snipFiles = await walk({ ignoreFiles: ['.snipignore'], path: libraryPath })

	const snips = []

	for (const file of snipFiles) {
		const snip = await loadSnip(libraryPath, file)
		snips.push(snip)
	}

	log.debug(`Loaded ${snips.length} snips from ${libraryPath}`)
	return snips
}
