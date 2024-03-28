#! /usr/bin/env node
const prompts = require('prompts')
const { red, green, bold } = require('kolorist')
const fs = require('node:fs')
const path = require('node:path')

const { parseArgs } = require('node:util')
const ejs = require('ejs')

async function init() {
  const cwd = process.cwd()

  const args = process.argv.slice(2)

  let targetDir = args[0]

  
  const defaultProjectName = !targetDir ? 'vue-project' : targetDir

  const options = {
    typescript: { type: 'boolean' },
    ts: { type: 'boolean' },
    'with-tests': { type: 'boolean' },
    tests: { type: 'boolean' },
    'vue-router': { type: 'boolean' },
    router: { type: 'boolean' }
  }

  const { values: argv } = parseArgs({
    args,
    options,
    strict: false
  })

  try {
    result = await prompts([
      {
        name: 'projectName',
        type: targetDir ? null : 'text',
        message: 'Project name:',
        initial: defaultProjectName,
        onState: state => (targetDir = String(state.value).trim() || defaultProjectName)
      },
      {
        name: 'selectFrame',
        hint: '- Use arrow-keys. Return to submit.',
        type: 'select',
        message: 'Select the framework used in the project',
        initial: 0,
        choices: (prev, answers) => [
          {
            title: 'Vue3',
            value: 'vue3',
          },
          {
            title: 'React18',
            value: 'react18',
          }
        ]
      },
      {
        name: 'stateManagementLibarary',
        hint: '- Use arrow-keys. Return to submit.',
        type: 'select',
        message: 'Choose a state management repository to apply in your project',
        initial: 0,
        choices: (prev, answers) => {
          if (prev === 'vue3') {
            return [
              {
                title: 'Vuex',
                value: 'vuex',
              }, 
              {
                title: 'Pinia',
                value: 'pinia',
              },
            ]
          } else {
            return [
            
              {
                title: 'Redux',
                value: 'redux',
              },
              {
                title: 'Mobx',
                value: 'mobx',
              }
            ]
          }
        }
      },
      {
        name: 'needsJsx',
        type: (prev, answers) => (answers.selectFrame === 'vue3' ? 'toggle': null),
        message: 'Add JSX Support?',
        initial: true,
        active: "Yes",
        inactive: "No",
      },
      {
        name: 'needsTypeScript',
        type: 'toggle',
        message: 'Add TypeScript?',
        initial: true,
        active: "Yes",
        inactive: "No",
      },
      {
        name: 'needsEslint',
        type: 'toggle',
        message: 'Add ESLint for code quality?',
        initial: false,
        active: "Yes",
        inactive: "No",
      },
      {
        name: 'needsPrettier',
        type: 'toggle',
        message: 'Add Prettier for code formatting?',
        initial: false,
        active: "Yes",
        inactive: "No",
      },
      {
        name: 'needsUI',
        hint: '- Use arrow-keys. Return to submit.',
        type: 'select',
        message: 'Choose a UI library for your project',
        initial: 0,
        choices: (prev, answers) => {
          if (prev === 'vue3') {
            return [
              {
                title: 'Element Plus',
                value: 'elementPlus',
              },
            ]
          } else {
            return [
            
              {
                title: 'Ant Design',
                value: 'antd',
              }
            ]
          }
        }
      },
    ])
  } catch (cancelled) {
    console.log(cancelled.message)
    process.exit(1)
  }
}

init().catch(e => {
  console.error(e)
})