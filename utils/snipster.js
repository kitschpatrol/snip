// This file is for snipster-specific utilities
const { read } = require('./general')
const { SNIPSTER_CONFIG } = require('./constants')
const walk = require('ignore-walk')
const resolve = require('resolve-dir')

// respects the .snipsterignore file
const getSnipsterFiles = async () => {
  const settings = await read(SNIPSTER_CONFIG)
  const resolvedSettingsDir = resolve(settings.directory)
  return (await walk({ path: resolvedSettingsDir, ignoreFiles: ['.snipsterignore'] })).map(file => {
    return resolvedSettingsDir + '/' + file
  })
}

module.exports = {
  getSnipsterFiles,
}
