import { execa } from 'execa'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import { env } from 'node:process'
import untildify from 'untildify'
import { DESCRIPTION_DELIMITER, TEMP_DIRECTORY } from '../constants.js'
import log from '../logger.js'

/**
 * Adds a new snippet to the specified snip library.
 */
export async function add(libraryPath: string, filename?: string) {
	log.debug(`Adding to library ${libraryPath}`)
	libraryPath = untildify(libraryPath)

	// TODO validate filename with zod...

	if (!filename) {
		const answers = await inquirer.prompt([
			{
				message: 'Prefix (the trigger keyword for your snippet):',
				name: 'prefix',
				type: 'input',
			},
			{
				message: 'A quick description of your snippet (optional):',
				name: 'description',
				type: 'input',
			},
			{
				message: `Language (for multiple languages, use 'all' or separate with a plus mark, like 'html+css+js'):`,
				name: 'langs',
				type: 'input',
			},
		])

		// TODO intermediate step as Snip object
		filename = `${answers.prefix}${
			answers.description ? DESCRIPTION_DELIMITER + (answers.description as string).trim() : ''
		}.${(answers.langs as string).trim().toLowerCase()}`
	}

	// Check for a user's preferred editor, otherwise default to vim
	// also extract any args if needed (e.g. if your EDITOR='code -w -n')
	const userEditor = (env.EDITOR ?? 'vim').split(' ')[0]
	const userEditorArgs = (env.EDITOR ?? '').split(' ').slice(1)

	await execa(userEditor, [...userEditorArgs, `${TEMP_DIRECTORY}/${filename}`], {
		stdio: 'inherit',
	})

	// TODO prompt overwrite
	// TODO try catch
	await fs.ensureDir(libraryPath)
	await fs.move(`${TEMP_DIRECTORY}/${filename}`, `${libraryPath}/${filename}`, {
		overwrite: true,
	})

	const answer = await inquirer.prompt([
		{
			message: 'Add more?',
			name: 'more',
			type: 'confirm',
		},
	])
	if (answer.more) {
		await add(libraryPath)
	} else {
		log.info('Okay, exiting...')
	}

	// TODO prompt to push
}
