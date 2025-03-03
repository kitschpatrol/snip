#!/usr/bin/env node

/* eslint-disable ts/no-unsafe-argument */
/* eslint-disable ts/no-unsafe-assignment */
/* eslint-disable ts/no-unsafe-return */

import { createCommand, createOption } from '@commander-js/extra-typings'
import fs from 'fs-extra'
import untildify from 'untildify'
import { type z } from 'zod'
import { bin, description, version } from '../package.json'
import { add, cd, list, setup, syncFromEditors, syncToEditors } from './commands/index.js' // The type from extra-typings isn't working...
import { HOME_DIRECTORY } from './constants.js'
import { SNIP_DEFAULT_CONFIG_FILE, SNIP_DEFAULT_LIBRARY_DIRECTORY } from './defaults.js'
import log from './logger.js'
import { filePath } from './schemas.js'

function zodParser<T extends z.ZodTypeAny>(schema: T): (value: string) => z.infer<T> {
	return (value) => schema.parse(value)
}

const program = createCommand()
	.name(Object.keys(bin)[0])
	.description(description)
	.version(version, '-v, --version')
	.addOption(
		createOption('-c, --config <path>', 'path to configuration file')
			.env('SNIP_CONFIG_FILE')
			.default(SNIP_DEFAULT_CONFIG_FILE.replace(HOME_DIRECTORY, '~'))
			.argParser(zodParser(filePath))
			.makeOptionMandatory(),
	)
	.addOption(
		createOption('-l, --library <path>', 'path to library directory where snippets are stored')
			.env('SNIP_LIBRARY_DIR')
			.default(SNIP_DEFAULT_LIBRARY_DIRECTORY.replace(HOME_DIRECTORY, '~'))
			.argParser(zodParser(filePath))
			.makeOptionMandatory(),
	)
	.addOption(
		createOption('-d, --debug', 'extra logging for troubleshooting')
			.env('SNIP_DEBUG')
			.default(false),
	)
	.hook('preSubcommand', async (hookedCommand, subCommand) => {
		// Set initial logging level
		if (hookedCommand.opts().debug) {
			log.setDebug(true)
			log.warn('debug mode enabled, expect extra logging')
		}

		// Hook to load config from file if available
		const configPath = untildify(hookedCommand.opts().config)
		log.debug(`loading config from ${configPath}`)

		if (await fs.exists(configPath)) {
			try {
				const config = await fs.readJSON(configPath)
				// TODO zod parse
				for (const [key, value] of Object.entries(config)) {
					subCommand.setOptionValue(key, value)
				}
			} catch {
				log.error('Error reading configuration file, using defaults')
			}
		} else {
			log.warn('No config file found, using defaults')
		}

		// Set logging level
		if (!log.getDebug() && hookedCommand.opts().debug) {
			log.setDebug(true)
			log.warn('debug mode enabled, expect extra logging')
		}
	})
	.addCommand(
		createCommand('add')
			.description('add a snippet')
			.argument('[filename]', 'name of snippet')
			// TODO break down args, and allow body to be passed in
			.action(async (filename, _, options) => {
				await add(options.optsWithGlobals().library as string, filename)
			}),
	)
	.addCommand(
		createCommand('cd')
			.description('launch a shell in the snippets directory')
			.action(async (_, options) => {
				await cd(options.optsWithGlobals().library as string)
			}),
	)
	.addCommand(
		createCommand('list')
			.description('list all snippets')
			.action(async (_, options) => {
				await list(options.optsWithGlobals().library as string)
			}),
	)
	.addCommand(
		createCommand('setup')
			.description('set up snip')
			.action(async (_, options) => {
				// TODO can you fish defaults out of commander's options?
				await setup(
					options.optsWithGlobals().config as string,
					SNIP_DEFAULT_CONFIG_FILE,
					SNIP_DEFAULT_LIBRARY_DIRECTORY,
				)
			}),
	)
	.addCommand(
		createCommand('sync-to-editors')
			.description('sync snippets to editors')
			.argument('[editors...]', 'editors to sync to', ['vscode'])
			.action(async (editors, _, options) => {
				// TODO can you fish defaults out of commander's options?
				await syncToEditors(options.optsWithGlobals().library as string, editors)
			}),
	)
	.addCommand(
		createCommand('sync-from-editors')
			.description('sync snippets from editors (not yet implemented)')
			.argument('[editors...]', 'editors to sync to', ['vscode'])
			.action(async (editors, _, options) => {
				// TODO can you fish defaults out of commander's options?
				await syncFromEditors(editors, options.optsWithGlobals().library as string)
			}),
	)
	.showHelpAfterError()

await program.parseAsync()
