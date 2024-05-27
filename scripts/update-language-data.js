const { SNIPSTER_LANGUAGE_DATA_PATH } = require('../utils/constants')
const { write, fail, log } = require('../utils/general')
const yaml = require('js-yaml')

// TODO make this a command and call it at init...

const updateLanguageData = async () => {
  let gitHubLanguageData
  try {
    const response = await fetch('https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml')
    const yamlText = await response.text()
    gitHubLanguageData = yaml.load(yamlText)
  } catch (error) {
    fail(`Error updating language data: ${JSON.stringify(error, null, 2)}`)
    return
  }

  // TODO back up existing if we have it

  write(SNIPSTER_LANGUAGE_DATA_PATH, JSON.stringify(gitHubLanguageData, null, 2))

  const languageCount = Object.keys(gitHubLanguageData).length
  const fileExtensionCount = Object.values(gitHubLanguageData).flatMap(languageMetadata => {
    return languageMetadata.extensions || []
  }).length

  log(`Successfully updated language data for ${languageCount} languages with ${fileExtensionCount} file extensions`)
  log(`Language metadata saved to ${SNIPSTER_LANGUAGE_DATA_PATH}`)
}

updateLanguageData()
