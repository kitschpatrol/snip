const { read, home } = require('../general')
const { SNIPSTER_CONFIG } = require('../constants')

const vscodeComment = async () => {
  const settings = await read(SNIPSTER_CONFIG)
  return `
/*******************************************************************************
*               _              _                                               *
*   ___  _ __  (_) _ __   ___ | |_   ___  _ __                                 *
*  / __|| '_ \\ | || '_ \\ / __|| __| / _ \\| '__|                                *
*  \\__ \\| | | || || |_) |\\__ \\| |_ |  __/| |                                   *
*  |___/|_| |_||_|| .__/ |___/ \\__| \\___||_|                                   *
*                 |_|                                                          *
*                                                                              *
*  This file was generated by Snipster (https://github.com/jhanstra/snipster)  *
*                                                                              *
*  If you want to continue using Snipster, do not edit your snippets in this   *
*  file. Rather, add them to your chosen snippets directory:                   *
*                                                                              *
*    ${settings.directory}
*                                                                              *
*  Then use 'snipster publish' from the command line to republish.             *
*                                                                              *
*******************************************************************************/
    `
}

module.exports = vscodeComment