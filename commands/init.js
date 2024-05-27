// const inquirer = require('inquirer')
// const { success, log, exists, write } = require('../utils/general')
// const { SNIPSTER_CONFIG_PATH } = require('../utils/constants')
// const questions = require('../utils/questions')
// const publish = require('./publish')
// const sync = require('./sync')

// const init = async () => {
//   if (exists(SNIPSTER_CONFIG_PATH)) {
//     const question1 = await inquirer.prompt(questions.initAgain)
//     if (!question1.reset) {
//       log('Okay, exiting...')
//       return
//     }
//   }

//   success("🚀  Let's set up Snipster\n")
//   const settings = await inquirer.prompt(questions.init)
//   settings.editors.map(editor => {
//     sync(editor)
//     return null
//   })

//   await write(SNIPSTER_CONFIG_PATH, JSON.stringify(settings, null, 2))
//   log('Check out https://github.com/jhanstra/snipster/examples for snippet ideas and examples.\n')
//   log('You can run `snipster add lorem.md` to add a new snippet.\n')
//   publish()
//   success('All set! You can start using your snippets now :D\n')
// }

// module.exports = init
