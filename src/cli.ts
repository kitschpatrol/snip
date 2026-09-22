#!/usr/bin/env node

/* eslint-disable ts/no-unsafe-argument */
/* eslint-disable ts/no-unsafe-assignment */

import type { z } from 'zod'
import { createCommand, createOption } from '@commander-js/extra-typings'
import fs from 'fs-extra'
import untildify from 'untildify'
import { bin, description, version } from '../package.json' with { type: 'json' }
import { add, cd, list, setup, syncFromEditors, syncToEditors } from './commands/index.js'
import { HOME_DIRECTORY } from './constants.js'
import { SNIP_DEFAULT_CONFIG_FILE, SNIP_DEFAULT_LIBRARY_DIRECTORY } from './defaults.js'
import { log, setVerbose } from './log.js'
import { filePath } from './schemas.js'

function zodParser<T extends z.ZodType>(schema: T): (value: string) => z.infer<T> {
	return (value) => schema.parse(value)
}

const [commandName] = Object.keys(bin)
if (commandName === undefined || commandName === '') {
	throw new Error('No CLI command defined in package.json')
}

const program = createCommand()
	.name(commandName)
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
			setVerbose(true)
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
	})

program
	.command('add')
	.description('add a snippet')
	.argument('[filename]', 'name of snippet')
	// TODO break down args, and allow body to be passed in
	.action(async (filename, _, command) => {
		await add(command.optsWithGlobals().library, filename)
	})

program
	.command('cd')
	.description('launch a shell in the snippets directory')
	.action(async (_, command) => {
		await cd(command.optsWithGlobals().library)
	})

program
	.command('list')
	.description('list all snippets')
	.action(async (_, command) => {
		await list(command.optsWithGlobals().library)
	})

program
	.command('setup')
	.description('set up snip')
	.action(async (_, command) => {
		await setup(
			command.optsWithGlobals().config,
			SNIP_DEFAULT_CONFIG_FILE,
			SNIP_DEFAULT_LIBRARY_DIRECTORY,
		)
	})

program
	.command('sync-to-editors')
	.description('sync snippets to editors')
	.argument('[editors...]', 'editors to sync to', ['vscode'])
	.action(async (editors, _, command) => {
		await syncToEditors(command.optsWithGlobals().library, editors)
	})

program
	.command('sync-from-editors')
	.description('sync snippets from editors (not yet implemented)')
	.argument('[editors...]', 'editors to sync to', ['vscode'])
	.action(async (editors, _, command) => {
		await syncFromEditors(editors, command.optsWithGlobals().library)
	})

await program.showHelpAfterError().parseAsync()
