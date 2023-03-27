const columnify = require('columnify')
const { home, read, files, log } = require('../utils/general')
const { getSnipsterFiles } = require('../utils/snipster')

const list = async () => {
  const paths = await getSnipsterFiles()
  const snippets = paths.map(path => ({
    prefix: path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.')),
    language: path.substring(path.lastIndexOf('.') + 1),
  }))
  log()
  log(columnify(snippets))
}

module.exports = list
