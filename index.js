import inquirer from 'inquirer'
import { writeEnvToFile } from './writeEnv.js'
import { configDotenv } from 'dotenv'
import axios from 'axios'
import { createSpinner } from 'nanospinner'
import { SUB_TASKS } from './constants/subtask.js'
import chalk from 'chalk'

configDotenv()

let username = process.env.USERNAME_JIRA
let password = process.env.PASSWORD_JIRA
let JIRA_URL = process.env.JIRA_URL
let allStories = []

async function inputAccount () {
  if (!JIRA_URL) {
    const jiraInput = await inquirer.prompt({
      name: 'jiraUrl',
      type: 'input',
      message: 'What is your Jira server?',
      default: () => {
        return ''
      }
    })
    JIRA_URL = jiraInput.jiraUrl
    writeEnvToFile([{ key: 'JIRA_URL', value: JIRA_URL }])
  }

  if (!username) {
    const answersInput = await inquirer.prompt({
      name: 'username',
      type: 'input',
      message: 'What is your username?',
      default: () => {
        return ''
      }
    })
    username = answersInput.username
    writeEnvToFile([{ key: 'USERNAME_JIRA', value: username }])
  }

  if (!password) {
    const passwordInput = await inquirer.prompt({
      name: 'password',
      type: 'password',
      message: 'What is your password?',
      default: () => {
        return ''
      }
    })
    password = passwordInput.password
    writeEnvToFile([{ key: 'PASSWORD_JIRA', value: password }])
  }
}

async function getJiraSprints () {
  const spinner = createSpinner('Checking stories of the active spring...').start()
  const { data: res } = await axios.get(`${JIRA_URL}/rest/agile/1.0/sprint/14667/issue?maxResults=100`, {
    auth: {
      username,
      password
    }
  })

  const stories = res.issues.filter(issue => issue.fields.issuetype.name === 'Story')
  allStories = stories.map(story => story.key)

  spinner.success()
  const { storiesChoosen } = await inquirer.prompt({
    name: 'storiesChoosen',
    type: 'checkbox',
    loop: false,
    message: 'What stories would you like to create the subtasks?',
    choices: ['All', ...stories.map(stories => stories.key)]
  })
  return storiesChoosen
}

async function createSubtaskForStories (stories, allStories) {
  if (stories.includes('All')) {
    createSubTask(allStories)
  } else {
    createSubTask(stories.filter(story => story !== 'All'))
  }
}

function createSubTask (stories) {
  stories.forEach(async story => {
    const createTaskSpin = createSpinner()
    const subTaskCreated = []
    for (const key in SUB_TASKS) {
      try {
        const body = {
          fields: {
            description: '',
            issuetype: {
              id: '10101'
            },
            parent: {
              key: story
            },
            project: {
              id: '22702'
            },
            summary: SUB_TASKS[key]
          }
        }
        await axios.post(`${JIRA_URL}/rest/api/2/issue`, body, {
          auth: {
            username,
            password
          }
        })
        subTaskCreated.push(SUB_TASKS[key])
      } catch (e) {
        console.log(chalk.red(`ERROR: ${e.message} \n`))
      }
    }
    console.log(chalk.green(`${story}: sub-task ${subTaskCreated.join(', ')} is created\n`))
    createTaskSpin.success({ text: `Create successfully sub-task for story ${story}` })
  })
}

await inputAccount()
const storiesChoosen = await getJiraSprints()
await createSubtaskForStories(storiesChoosen, allStories)
