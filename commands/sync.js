// Pulls from editors into snipster

const cson = require('cson')
const path = require('path')
const { parseString } = require('xml2js')
const {
  ATOM_USER_SNIPPETS_PATH,
  VSCODE_USER_SNIPPETS_PATH,
  SUBLIME_USER_SNIPPETS_PATH,
  SNIPSTER_PATH,
  SNIPSTER_CONFIG_PATH,
  VSCODE_EXTENSIONS_PATH,
} = require('../utils/constants')
const { read, write, files, fail, copy } = require('../utils/general')
const { reverseAtomMatcher, reverseVscodeMatcher, reverseSublimeMatcher } = require('../utils/matchers')
const resolve = require('resolve-dir')

const createSnipsterSnippets = async (snippetsJson, editor) => {
  const settings = await read(SNIPSTER_CONFIG_PATH)
  if (typeof snippetsJson !== 'object') {
    return null
  }
  for (const lang in snippetsJson) {
    let extension
    if (editor === 'atom') {
      extension = reverseAtomMatcher(lang)
    } else if (editor === 'vscode') {
      extension = reverseVscodeMatcher(lang)
    } else if (editor === 'sublime') {
      extension = reverseSublimeMatcher(lang)
    }
    for (const prefix in snippetsJson[lang]) {
      let body = snippetsJson[lang][prefix].body
      if (editor === 'vscode') {
        body = body.join('\n')
      }
      write(`${resolve(settings.directory)}/${editor}/${prefix}.${extension}`, body)
    }
  }
}

const errorMessage = editor => `Error syncing your pre-existing ${editor} snippets. Do you have ${editor} installed?`

const sync = async editor => {
  if (!editor) {
    const settings = await read(SNIPSTER_CONFIG_PATH)
    settings.editors.map(e => sync(e))
  }

  switch (editor) {
    case 'Atom': {
      try {
        copy(ATOM_USER_SNIPPETS_PATH, `${SNIPSTER_PATH}/backups/atom/${Date.now()}`)
      } catch (e) {
        // copy(ATOM_USER_SNIPPETS_PATH, `${SNIPSTER_PATH}/backups/atom/${Date.now()}`)
        fail(errorMessage('Atom'))
      }
      const atomCson = await read(ATOM_USER_SNIPPETS_PATH)
      const atomJson = cson.parse(atomCson)
      createSnipsterSnippets(atomJson, 'atom')
      break
    }
    case 'VSCode': {
      // Sync extension snippets

      // Scan extensions folder for snippets
      // All snippet extensions I can find use .json snippet files instead of .code-snippets...
      // TODO a GH search to see if that's really the case
      // Returns an array of objects keyed to the extension path

      // TODO walk or something more efficient...
      const extensionFiles = files(VSCODE_EXTENSIONS_PATH)

      for (const extensionFile of extensionFiles) {
        if (extensionFile.endsWith('/package.json')) {
          const packageJson = await read(extensionFile)
          if (packageJson?.contributes?.snippets !== undefined) {
            // The extension has snippets
            // for snippetGrpackageJson.contributes.snippets
          }
        }
      }

      // console.log(`extensionPackagesWithSnippets: ${extensionPackagesWithSnippets}`)

      process.exit(1)

      // Sync user snippets
      try {
        copy(VSCODE_USER_SNIPPETS_PATH, `${SNIPSTER_PATH}/backups/vscode/${Date.now()}`)
      } catch (e) {
        fail(errorMessage('VSCode'))
      }

      const vscodeFiles = files(VSCODE_USER_SNIPPETS_PATH, { type: 'filenames' })
      const vscodeFormatted = await vscodeFiles
        .filter(f => f !== '.DS_Store')
        .reduce(async (previousPromise, file) => {
          const acc = await previousPromise
          const lang = file.split('.')[0]
          acc[lang] = await read(`${VSCODE_USER_SNIPPETS_PATH}/${file}`)
          return acc
        }, {})
      createSnipsterSnippets(vscodeFormatted, 'vscode')
      break
    }
    case 'Sublime Text': {
      try {
        copy(SUBLIME_USER_SNIPPETS_PATH, `${SNIPSTER_PATH}/backups/sublime/${Date.now()}`)
      } catch (e) {
        fail(errorMessage('Sublime Text'))
      }
      const sublimeFiles = files(SUBLIME_USER_SNIPPETS_PATH, { type: 'filenames' })
      const sublimeFormatted = await sublimeFiles
        .filter(f => f.includes('sublime-snippet'))
        .reduce(async (prevPromise, file) => {
          const acc = await prevPromise
          const body = await read(`${SUBLIME_USER_SNIPPETS_PATH}/${file}`)
          parseString(body, (err, res) => {
            if (err) {
              fail(`Error parsing sublime files: ${err}`)
            }
            const { snippet } = res
            const lang = ('scope' in snippet && snippet.scope[0]) || 'all'
            const prefix = snippet.tabTrigger[0]
            if (!(lang in acc)) {
              acc[lang] = {}
            }
            acc[lang][prefix] = {
              prefix,
              body: snippet.content[0],
            }
          })
          return acc
        }, {})

      createSnipsterSnippets(sublimeFormatted, 'sublime')
      break
    }
  }
}

module.exports = sync
