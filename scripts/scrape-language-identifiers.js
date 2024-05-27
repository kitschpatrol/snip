const { Octokit, SearchCodeRequest, githubClient } = require('@octokit/rest')
const { write, fail, log } = require('../utils/general')
const octokit = new Octokit({ auth: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' })

// Compare: https://docs.github.com/en/rest/reference/repos/#list-organization-repositories
// octokit.rest.repos
//   .listForOrg({
//     org: 'local-projects',
//     type: 'public',
//   })
//   .then(({ data }) => {
//     // handle data
//     console.log(`data: ${JSON.stringify(data, null, 2)}`)
//   })

//octokit.rest.search('l=&q=contributes+languages+engines+vscode+filename%3Apackage.json&type=code').then(({ data }) => {

const searchGh = async () => {
  //   const request = new SearchCodeRequest('contributes+languages+engines+vscode+filename%3Apackage.json&type=code')

  //   const result = await githubClient.Search.SearchCode(request)

  //   console.log(`result: ${JSON.stringify(result, null, 2)}`)

  const {
    data: { login },
  } = await octokit.rest.users.getAuthenticated()
  console.log('Hello, %s', login)

  const response = await octokit.request(
    '/search/code?q=contributes+languages+engines+vscode+filename%3Apackage.json&type=code'
  )

  for (const item of response.data.items) {
    const htmlUrl = item.html_url

    console.log(`htmlUrl: ${htmlUrl}`)

    const rawUrl = htmlUrl.replace('https://github.com', 'https://raw.githubusercontent.com')

    try {
      const response = await fetch(rawUrl)
      const responseText = await response.text()
      write('/Users/mika/Desktop/' + Date.now() + '.json', responseText)
    } catch (error) {
      fail(`Error updating language data: ${JSON.stringify(error, null, 2)}`)
      return
    }
  }
}

//           https://github.com/asat13/Vs-Code-Settings/blob/0e2b26d6278f2cbaf98f0af4481bb6bf28fcb03e/formulahendry.auto-rename-tag-0.1.0/package.json
// https://raw.githubusercontent.com/asat13/Vs-Code-Settings/0e2b26d6278f2cbaf98f0af4481bb6bf28fcb03e/formulahendry.auto-rename-tag-0.1.0/package.json

searchGh()
