const core = require('@actions/core');
const github = require('@actions/github');

const axios = require('axios')
const fs = require('fs')

const REPO_OWNER = 'samhinshaw'
const REPO_NAME = 'pr-template'

try {
  const token = core.getInput('github_token');
  const prNumber = core.getInput('pr_number');
  const branchName = core.getInput('branch_name');
  console.log({
    token,
    prNumber,
    branchName,
  })

  const requestUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls/${prNumber}`

  // template out PR body
  const template = fs.readFileSync('./templates/test.md', { encoding: 'utf-8' })
  console.log(template)

  axios.request({
    url: requestUrl,
    method: 'patch',
    headers: {
      'accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${TOKEN}`
    },
    data: {
      body: template,
    },
  })
  .then(() => console.log('done!'))

  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);
  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
