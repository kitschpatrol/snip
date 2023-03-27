// This file is for snipster-specific utilities
const { read } = require('./general')
const { SNIPSTER_CONFIG } = require('./constants')
const walk = require('ignore-walk')

// respects the .snipsterignore file
const getSnipsterFiles = async () => {
  const settings = await read(SNIPSTER_CONFIG)
  return (await walk({ path: settings.directory, ignoreFiles: ['.snipsterignore'] })).map(file => {
    return settings.directory + '/' + file
  })
}

module.exports = {
  getSnipsterFiles,
}
