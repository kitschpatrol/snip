// This file is for general node utils that can/should be extracted to a separate repo soon
const os = require('os')
const fs = require('fs-extra')
const chalk = require('chalk')
const stripJsonComments = require('strip-json-comments')
const { promisify } = require('util')

const success = log => console.log(chalk.green(log))
const fail = log => console.log(chalk.red(log))
const log = log => {
  if (typeof log === 'undefined') {
    console.log()
    return
  }
  console.log(chalk.yellow(log))
}

const home = () => os.homedir()

const exists = path => {
  return fs.existsSync(path)
}

// Options:
// type: 'filename', 'absPath', 'relPath'
// const files = (dir) => {
//   let results = [];
//   fs.readdirSync(dir).map(file => {
//     file = dir + '/' + file
//     let stat = fs.statSync(file)
//     if (stat && stat.isDirectory()) {
//       results = results.concat(files(file))
//     }
//     else {
//       results.push(file)
//     }
//   });
//   return results;
// }

const files = (dir, options = {}) => {
  const { levels = 100, type = 'fullPaths' } = options
  let results = []
  fs.readdirSync(dir).map(item => {
    item = dir + '/' + item
    const stat = fs.statSync(item)
    if (stat && stat.isDirectory() && levels > 0) {
      results = results.concat(files(item, { levels: levels - 1 }))
    } else {
      results.push(item)
    }
    return null
  })
  if (type === 'filename' || type === 'filenames') {
    return results.map(result => {
      return result.substring(result.lastIndexOf('/') + 1)
    })
  }
  return results
}

const create = path => {
  const dirPath = path.substring(0, path.lastIndexOf('/'))
  return fs.mkdirSync(dirPath, { recursive: true }, err => {
    if (err) {
      throw err
    }
  })
}

const write = (path, contents) => {
  const file = path.substring(path.lastIndexOf('/') + 1)
  if (!file) {
    fail('Write to a file please')
  }
  create(path)
  try {
    fs.writeFileSync(path, contents)
    return
  } catch (err) {
    fail(err)
  }
}

const read = async (path, options) => {
  const readFile = promisify(fs.readFile)
  try {
    const res = await readFile(path, options || 'utf-8')
    try {
      const json = JSON.parse(stripJsonComments(res))
      return json
    } catch (jsonErr) {
      console.error('json error')
    }
    return res
  } catch (err) {
    fail(err)
  }
}

const copy = (pathFrom, pathTo) => {
  if (!exists(pathTo)) {
    create(pathTo)
  }
  fs.copySync(pathFrom, pathTo)
}

module.exports = {
  read,
  write,
  copy,
  success,
  log,
  fail,
  home,
  exists,
  files,
}
