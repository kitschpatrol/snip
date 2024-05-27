import { allExtension, descriptionDelimiter } from './constants.js'
import log from './logger.js'
import { type snipSchema, type snipsSchema } from './schemas.js'
import fs from 'fs-extra'
import walk from 'ignore-walk'
import path from 'node:path'
import { type z } from 'zod'

export function filenameFromSnip(snip: z.infer<typeof snipSchema>): string {
	const extension = snip.all ? allExtension : snip.extensions?.join('+')
	const description = snip.description ? descriptionDelimiter + snip.description : ''
	return `${snip.prefix}${description}.${extension}`
}

export async function loadSnip(
	libraryPath: string,
	file: string,
): Promise<z.infer<typeof snipSchema>> {
	// TODO what about extensions with multiple dots?
	// TODO what about multiple instances of the DELIMITER?
	const rawExtension = path.extname(file)
	const [prefix, description] = path.basename(file, rawExtension).split(descriptionDelimiter, 2)
	const rawExtensions = rawExtension.replace('.', '').toLowerCase().split('+')
	const all = rawExtensions.includes(allExtension)
	const extensions = rawExtensions.filter((value) => value !== allExtension)

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
