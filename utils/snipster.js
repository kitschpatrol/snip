// This file is for snipster-specific utilities
const { read, fail } = require('./general')
const { SNIPSTER_CONFIG_PATH, SNIPSTER_LANGUAGE_DATA_PATH } = require('./constants')
const walk = require('ignore-walk')
const resolve = require('resolve-dir')

// respects the .snipsterignore file
const getSnipsterFiles = async () => {
  const settings = await read(SNIPSTER_CONFIG_PATH)
  const resolvedSettingsDir = resolve(settings.directory)
  return (await walk({ path: resolvedSettingsDir, ignoreFiles: ['.snipsterignore'] })).map(file => {
    return resolvedSettingsDir + '/' + file
  })
}

const getFileExtensionsForLanguageName = async name => {
  // TODO call init if we don't have language data
  const languageData = await read(SNIPSTER_LANGUAGE_DATA_PATH)

  // there seem to be no case-sensitive duplicates in the language data... for now
  for (const languageName of Object.keys(languageData)) {
    if (languageName.toLowerCase() === name.toLowerCase()) {
      try {
        return languageData.languageName.extensions.map(extension => extension.toLowercase())
      } catch (error) {
        // TODO instructions on action to take
        fail(`Could not find file extensions for language named "${name}"\nEncountered error: ${error}\nExiting`)
        process.exit(1)
      }
    }
  }
  // TODO instructions on action to take
  fail(`Could not find language named "${name}"\nExiting`)
  process.exit(1)
}

const getLanguageNamesForFileExtension = async fileExtension => {
  // TODO call init if we don't have language data
  const languageData = await read(SNIPSTER_LANGUAGE_DATA_PATH)

  const languageNames = Object.entries(languageData).flatMap(([key, value]) => {
    return key === fileExtension && value.extensions ? value.extensions : []
  })

  if (languageNames.length > 0) {
    return languageNames
  } else {
    // TODO instructions on action to take
    fail(`Could not find language names for file extension "${fileExtension}\nExiting"`)
    process.exit(1)
  }
}

module.exports = {
  getSnipsterFiles,
  getFileExtensionsForLanguageName,
  getLanguageNamesForFileExtension,
}
