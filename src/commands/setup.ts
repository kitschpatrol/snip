import fs from 'fs-extra'
import inquirer from 'inquirer'
import path from 'node:path'
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import log from '../logger.js'

export async function setup(
	configPath: string,
	defaultConfigPath: string,
	defaultLibraryPath: string,
) {
	let answers

	// Ask before overwriting existing
	if (await fs.exists(configPath)) {
		answers = await inquirer.prompt([
			{
				message:
					'You already have a config file set up in this location. It will be backed up and your snippets will remain safe. Do you want to continue and create a new config?',
				name: 'overwrite',
				type: 'confirm',
			},
		])

		if (!answers.overwrite) {
			log.info('Ok, exiting...')
			return
		}

		const backupConfigPath = configPath.replace(/\.json$/, `-backup-${Date.now()}.json`)
		log.info(`Ok, backing up existing config to ${backupConfigPath}`)
		await fs.rename(configPath, backupConfigPath)
	}

	// Creating in a weird location
	if ((await fs.exists(defaultConfigPath)) && configPath !== defaultConfigPath) {
		answers = await inquirer.prompt([
			{
				message: `You already have a config file set up in the default location (${defaultConfigPath}). Do you want to delete this config before creating a new one in a different location?`,
				name: 'cleanup',
				type: 'confirm',
			},
		])

		if (answers.cleanup) {
			log.info(`Ok, deleting ${defaultConfigPath}`)
			await fs.remove(defaultConfigPath)

			// Clean up parent folder as well if it's empty
			const configDirectory = path.dirname(configPath)
			const defaultConfigDirectory = path.dirname(defaultConfigPath)
			if (configDirectory === defaultConfigDirectory) {
				log.info(`Cleaning up parent directory as well (${configDirectory})`)
				await fs.remove(configDirectory)
			}
		} else {
			log.info('Ok, leaving the existing config in place...')
		}

		log.warn(
			`You're creating a config file in a non-default location, you'll have to call snip with the --config flag to use it (every time).`,
		)
	}

	answers = await inquirer.prompt([
		{
			default: defaultLibraryPath,
			message: `Enter a pathname for your snippets library`,
			name: 'libraryPath',
			type: 'input',
		},
	])

	if (answers.libraryPath) {
		// TODO targets?
		// TODO validation
		// TODO overwrite warning
		// TODO migrate existing?
		// TODO zod
		// TODO create library path?

		await fs.ensureDir(path.dirname(configPath))

		await fs.writeJSON(
			configPath,
			{
				library: answers.libraryPath,
			},
			{ encoding: 'utf8', flag: 'w', spaces: 2 },
		)
	}

	log.info('Done!')
}
