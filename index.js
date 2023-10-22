import chalk from 'chalk'
import inquirer from 'inquirer'
import fs from 'fs'
import * as envfile from 'envfile'
import { writeEnvToFile } from './writeEnv.js'
import { configDotenv } from 'dotenv'
import axios from 'axios'

configDotenv();

let username = process.env.USERNAME_JIRA;
let password = process.env.PASSWORD_JIRA;
let JIRA_URL = process.env.JIRA_URL;

async function inputAccount() {
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
        writeEnvToFile([{ key: 'JIRA_URL', value: jiraUrl }])
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


async function getJiraSprints() {
   const res = await axios.get(`${JIRA_URL}/rest/agile/1.0/sprint/14667/issue?maxResults=100`, {
    auth: {
        username: username,
        password: password
    }
   })
   console.log(res.data)
}


await inputAccount();
await getJiraSprints();