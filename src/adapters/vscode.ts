/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-depth */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-extraneous-class */

import { format } from 'date-fns'
import fs from 'fs-extra'
import path from 'node:path'
import { z } from 'zod'
import { HOME_DIRECTORY } from '../constants.js'
import packageInfo from '../generated/package-info.json' assert { type: 'json' }
import vscodeLanguageMap from '../generated/vscode-language-map.json' assert { type: 'json' }
import log from '../logger.js'
import { type snipSchema, type snipsSchema } from '../schemas.js'

// Type EditorAdapter<T extends z.ZodTypeAny, U extends z.ZodTypeAny> = {
//   type: z.infer<typeof Editor>;
//   fileSchema: U;
//   editorSnipSchema: T;
//   snipToEditor(snip: z.infer<typeof snipSchema>): T;
//   editorToSnip(editorSnip: T): z.infer<typeof snipSchema>;
// };

export class VscodeAdapter {
	private static readonly editorExtensionManifestSnipSchema = z.object({
		language: z.string().min(1),
		path: z.string().min(1),
	})

	private static readonly editorExtensionManifestSnipsSchema = z.array(
		this.editorExtensionManifestSnipSchema,
	) // TODO Windows

	// Schemas
	private static readonly editorSnipSchema = z.record(
		z.string().max(1),
		z.object({
			body: z.array(z.string()),
			description: z.optional(z.string().min(1)),
			prefix: z.optional(z.string().min(1)),
			scope: z.optional(z.string().min(1)),
		}),
	) // TODO Windows

	// TODO how to deal with records...
	private static readonly editorSnipsSchema = z.record(
		z.string().min(1),
		z.object({
			body: z.array(z.string()),
			description: z.optional(z.string().min(1)),
			prefix: z.optional(z.string().min(1)),
			scope: z.optional(z.string().min(1)),
		}),
	)

	// Constants
	private static readonly vscodeUserExtensionsDir = `${HOME_DIRECTORY}/.vscode/extensions`
	private static readonly vscodeUserSnippetsDir = `${HOME_DIRECTORY}/Library/Application Support/Code/User/snippets`

	// TODO zod way to do this?
	private static convertEditorSnipToSnip(
		editorSnip: z.infer<typeof this.editorSnipSchema>,
	): z.infer<typeof snipSchema> {
		const key = Object.keys(editorSnip)[0]
		const value = editorSnip[key]

		const snip: z.infer<typeof snipSchema> = {
			all: false, // TODO
			body: value.body.join('\n'),
			description: value.description,
			extensions: [], // TODO reverse lookup!!!
			prefix: value.prefix,
		}

		return snip
	}

	private static convertSnipToEditorSnip(
		snip: z.infer<typeof snipSchema>,
	): z.infer<typeof this.editorSnipSchema> {
		const key = snip.description ?? snip.prefix ?? `Key From Snip ${Date.now()}` // TODO hmm
		const vscodeSnippet: z.infer<typeof this.editorSnipSchema> = {}

		vscodeSnippet[key] = {
			body: snip.body.split('\n'),
			prefix: snip.prefix,
		}

		if (!snip.all && snip.extensions && snip.extensions.length > 0) {
			vscodeSnippet[key].scope = this.vscodeLanguageIdsForExtensions(snip.extensions).join(',')
		}

		if (snip.description) {
			vscodeSnippet[key].description = snip.description
		}

		return vscodeSnippet
	}

	// Transformers
	public static async getSnipsFromEditor(): Promise<z.infer<typeof snipsSchema>> {
		const extensionSnips = this.getSnipsFromExtensions()
		console.log(`extensionSnips: ${JSON.stringify(extensionSnips, undefined, 2)}`)

		// TODO
		const userSnips = this.getSnipsFromUser()
		console.log(`userSnips: ${JSON.stringify(userSnips, undefined, 2)}`)

		return extensionSnips
	}

	private static async getSnipsFromExtensions(): Promise<z.infer<typeof snipsSchema>> {
		console.log(`vscodeUserExtensionsDir: ${VscodeAdapter.vscodeUserExtensionsDir}`)
		// Scan extensions folder for snippets
		// All snippet extensions I can find use .json snippet files instead of .code-snippets...
		// TODO a GH search to see if that's really the case

		// Returns an array of objects keyed to the extension path
		// TODO walk or something more efficient...

		const snips: z.infer<typeof snipsSchema> = []

		const extensions = await fs.readdir(VscodeAdapter.vscodeUserExtensionsDir)
		for (const directory of extensions) {
			const packagePath = path.join(
				VscodeAdapter.vscodeUserExtensionsDir,
				directory,
				'package.json',
			)
			if (await fs.exists(packagePath)) {
				const manifest = (await fs.readJSON(packagePath)) as Record<string, any>
				if (manifest.contributes?.snippets) {
					console.log(`${manifest.name} contributes snippets...`)

					try {
						const extensionSnippets = this.editorExtensionManifestSnipsSchema.parse(
							manifest.contributes.snippets,
						)

						for (const extensionSnippet of extensionSnippets) {
							const extensionSnippetPath = path.join(
								path.dirname(packagePath),
								extensionSnippet.path,
							)

							console.log(`Loading "${extensionSnippetPath}"`)

							const extensionSnips = this.editorSnipsSchema.parse(
								await fs.readJSON(extensionSnippetPath),
							)

							for (const key of Object.keys(extensionSnips)) {
								// Todo hmm
								const snip = this.convertEditorSnipToSnip({ [key]: extensionSnips[key] })
								snips.push(snip)
							}

							// Console.log(`extensionSnips: ${extensionSnips}`);
						}
					} catch {
						console.error(`Error parsing snippets from ${directory}`)
						// Console.error(`error: ${JSON.stringify(error, undefined, 2)}`)
					}
				}
			}
		}

		return snips
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	private static async getSnipsFromUser(): Promise<z.infer<typeof snipsSchema>> {
		// TODO
		// Back up existing vscode snippets
		// try {
		// 	await fs.copy(
		// 		VscodeAdapter.vscodeUserSnippetsDir,
		// 		`${SNIP_LIBRARY_DIR}/backups/vscode/${Date.now()}`,
		// 	)
		// } catch (error) {
		// 	console.log(`Error backing up user snippets: ${String(error)}`)
		// }

		// const vscodeFiles = await fs.readdir(VscodeAdapter.vscodeUserSnippetsDir)
		// const vscodeFormattedFiles = vscodeFiles
		// 	.filter((f) => f !== '.DS_Store')
		// 	.reduce(async (previous, file) => {
		// 		const acc = previous
		// 		const lang = file.split('.')[0]
		// 		acc[lang] = await fs.read(`${VscodeAdapter.vscodeUserSnippetsDir}/${file}`)
		// 		return acc
		// 	}, {})

		console.warn('getSnipsFromUser not implemented')

		return []
	}

	// Helpers
	private static vscodeLanguageIdsForExtensions(extensions: string[]): string[] {
		const languageIds = new Set<string>()

		for (const extension of extensions) {
			// Dot prefix
			const key = `.${extension}`
			if (key in vscodeLanguageMap) {
				for (const languageId of (vscodeLanguageMap as any)[key]) {
					languageIds.add(languageId)
				}
			} else {
				log.warn(`No VSCode language id for extension ${extension}`)
			}
		}

		return [...languageIds]
	}

	// Methods
	public static async writeSnipsToEditor(snips: z.infer<typeof snipsSchema>): Promise<void> {
		const vscodeSnippets: z.infer<typeof this.editorSnipsSchema> = {}

		for (const snip of snips) {
			const editorSnip = this.convertSnipToEditorSnip(snip)

			// TODO cleaner way
			const key = Object.keys(editorSnip)[0]
			vscodeSnippets[key] = editorSnip[key]
		}

		const content = `/* This file of ${Object.keys(vscodeSnippets).length} snippets was generated by ${packageInfo.command} v${packageInfo.version} on ${format(new Date(), "yyyy-MM-dd 'at' HH:mm:ss")} */\n${JSON.stringify(
			vscodeSnippets,
			undefined,
			2,
		)}`

		// Log.debug(content);
		// TODO flag overwrite
		// TODO check directory exists
		await fs.writeFile(`${VscodeAdapter.vscodeUserSnippetsDir}/snip.code-snippets`, content)

		log.debug(`Wrote ${snips.length} snips to VSCode`)
	}
}
