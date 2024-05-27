/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { descriptionDelimiter, tempDirectory } from '../constants.js'
import log from '../logger.js'
import { execa } from 'execa'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import { env } from 'node:process'

export async function add(libraryPath: string, filename?: string) {
	log.debug(`Adding to library ${libraryPath}`)

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
			answers.description ? descriptionDelimiter + (answers.description as string).trim() : ''
		}.${(answers.langs as string).trim().toLowerCase()}`
	}

	// Check for a user's preferred editor, otherwise default to vim
	// also extract any args if needed (e.g. if your EDITOR='code -w -n')
	const userEditor = (env.EDITOR ?? 'vim').split(' ')[0]
	const userEditorArgs = (env.EDITOR ?? '').split(' ').slice(1)

	await execa(userEditor, [...userEditorArgs, `${tempDirectory}/${filename}`], {
		stdio: 'inherit',
	})

	// TODO prompt overwrite
	// TODO try catch
	await fs.ensureDir(libraryPath)
	await fs.move(`${tempDirectory}/${filename}`, `${libraryPath}/${filename}`, {
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
