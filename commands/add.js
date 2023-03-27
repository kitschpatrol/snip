const child_process = require('child_process')
const exec = require('child_process').exec
const inquirer = require('inquirer')
const publish = require('./publish')
const questions = require('../utils/questions')
const { log, read, write, home, fail, exists } = require('../utils/general')
const { SNIPSTER_CONFIG } = require('../utils/constants')

const add = async () => {
  const hasConfig = exists(SNIPSTER_CONFIG)
  if (!hasConfig) { log('Please run `npx snipster init` first to set up Snipster'); return }
  const settings = await read(SNIPSTER_CONFIG)
  let filename, prefix, lang
  if (process.argv.length > 3) {
    filename = process.argv[3]
  } else {
    log('\n✂️  Add a snippet:')
    const question1 = await inquirer.prompt(questions.add)
    filename = `${question1.prefix}.${question1.langs}`
  }

  // check for a user's preferred editor, otherwise default to vim
  // also extract any args if needed (e.g. if your EDITOR='code -w -n')
  const userEditor = (process.env.EDITOR || 'vim').split(' ')[0];
  const userEditorArgs = (process.env.EDITOR || '').split(' ').slice(1)
  
  const child = child_process.spawn(userEditor, [...userEditorArgs, `/tmp/${filename}`], {
    stdio: 'inherit'
  })

  child.on('exit', async function (e, code) {
    if (e) { fail(e) }
    const contents = await read(`/tmp/${filename}`)
    const file = write(`${settings.directory}/added/${filename}`, contents)
    const published = await publish()
    const question2 = await inquirer.prompt(questions.more)
      if (!question2.more) {
        log('Okay, exiting...')
        return
      }
      add()
  })
}

module.exports = add