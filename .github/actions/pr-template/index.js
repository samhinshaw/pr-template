const core = require('@actions/core');
const github = require('@actions/github');

const axios = require('axios');
const fs = require('fs');

/**
 * Extract a Celium Software jira ticket id from a branch name.
 *
 * @param {string} branchName
 * @returns a formatted string to link to the jira ticket
 */
function getJiraTicketId(branchName) {
  // get the jira ticket number from the branch, if possible
  const match = branchName.match(/CS-[0-9]{4,}/i);
  if (match) {
    const ticketId = match[0];
    return ticketId;
  }
}

/**
 * Format a ticketId into a markdown link.
 *
 * @param {string} ticketId
 * @returns
 */
function formatJiraTicketLink(ticketId) {
  if (ticketId) {
    const jiraTicketLink = `[ticket](https://celium.atlassian.net/browse/${ticketId})`;
    return jiraTicketLink;
  }
  return '_No ticket found._';
}

/**
 * Fill out a template with the provided pattern/replacement pairs.
 *
 * @param {string} emptyTemplate
 * @param {[RegExp, string][]} templateReplacements
 * @returns
 */
function fillOutPrTemplate(emptyTemplate, templateReplacements) {
  return templateReplacements.reduce(
    (template, [pattern, replacement]) =>
      template.replace(pattern, replacement),
    emptyTemplate,
  );
}

/**
 * Create the PR title for a branch with or without a jira ticket
 *
 * @param {string} ticketId
 * @param {string} branchName
 * @returns
 */
function createPrTitle(ticketId, branchName) {
  if (ticketId) {
    const description = branchName
      .replace(`${ticketId}-`, '')
      .replace(/-/g, ' ');
    const prTitle = `${ticketId} | ${description}`;
    return prTitle;
  }
  const description = branchName.replace(/-/g, ' ');
  return description;
}

/**
 * Initiate GitHub Action
 *
 */
function main() {
  try {
    const branchName = core.getInput('branch_name');
    const author = core.getInput('author');

    const ticketId = getJiraTicketId(branchName);
    const ticketLink = formatJiraTicketLink(ticketId);

    const templateReplacements = [
      [/PR_AUTHOR/, author],
      [/JIRA_TICKET_LINK/, ticketLink],
    ];
    // template out PR body
    const TEMPLATE_PATH = './templates/test.md';
    const template = fs.readFileSync(TEMPLATE_PATH, {
      encoding: 'utf-8',
    });

    const prTitle = createPrTitle(ticketId, branchName);
    const prBody = fillOutPrTemplate(template, templateReplacements);

    core.setOutput('pr_title', prTitle);
    core.setOutput('pr_body', prBody);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
