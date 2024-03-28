#! /usr/bin/env node
import prompts from 'prompts'
import {
  blue,
  cyan,
  green,
  lightBlue,
  lightGreen,
  lightRed,
  magenta,
  red,
  reset,
  yellow,
} from 'kolorist'
import fs from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { fileURLToPath } from 'node:url'

import ejs from 'ejs'

const frameworks = [
  {
    name: 'Vue3',
    display: 'Vue',
    color: green,
    variants: [
      {
        name: 'vue-ts',
        display: 'TypeScript',
        color: blue,
        stateManagement: [
          {
            name: 'vuex',
            display: 'Vuex',
            color: cyan,
          },
          {
            name: 'pinia',
            display: 'Pinia',
            color: lightBlue,
          }
        ]
      },
      {
        name: 'vue',
        display: 'JavaScript',
        color: yellow,
        stateManagement: [
          {
            name: 'redux',
            display: 'Redux',
            color: cyan,
          },
          {
            name: 'mobx',
            display: 'Mobx',
            color: lightBlue,
          }
        ]
      },
    ]
  },
  {
    name: 'React18',
    display: 'React',
    color: cyan,
    variants: [
      {
        name: 'react-ts',
        display: 'TypeScript',
        color: blue,
      },
      {
        name: 'react',
        display: 'JavaScript',
        color: yellow,
      },
    ],
  },
]

const renameFiles = {
  _gitignore: '.gitignore',
}

const templates = frameworks.map(
  (f) => (f.variants && f.variants.map((v) => v.name)) || [f.name],
).reduce((a, b) => a.concat(b), [])

function canSkipEmptying(dir) {
  if (!fs.existsSync(dir)) {
    return true
  }

  const files = fs.readdirSync(dir)
  if (files.length === 0) {
    return true
  }
  if (files.length === 1 && files[0] === '.git') {
    return true
  }

  return false
}

function isValidPackageName(projectName) {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(projectName)
}

function toValidPackageName(projectName) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z0-9-~]+/g, '-')
}

function emptyDir(dir) {
  if (!fs.existsSync(dir)) {
    return
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === '.git') {
      continue
    }
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true })
  }
}

function formatTargetDir(targetDir) {
  return targetDir?.trim().replace(/\/+$/g, '')
}

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

  const forceOverwrite = argv.force

  const getProjectName = () =>
    targetDir === '.' ? path.basename(path.resolve()) : targetDir

  let result;

  try {
    result = await prompts([
      {
        name: 'projectName',
        type: targetDir ? null : 'text',
        message: 'Project name:',
        initial: defaultProjectName,
        onState: state => (targetDir = formatTargetDir(state.value) || defaultProjectName)
      },
      {
        name: 'shouldOverwrite',
        type: () => (canSkipEmptying(targetDir) || forceOverwrite ? null : 'toggle'),
        message: () => {
          const dirForPrompt =
            targetDir === '.'
              ? "Current directory"
              : `$Target directory "${targetDir}"`

          return `${dirForPrompt} is not empty. Remove existing files and continue?`
        },
        initial: true,
        active: "Yes",
        inactive: "No",
      },
      {
        type: () => (isValidPackageName(getProjectName()) ? null : 'text'),
        name: 'packageName',
        message: reset('Package name:'),
        initial: () => toValidPackageName(getProjectName()),
        validate: (dir) =>
          isValidPackageName(dir) || 'Invalid package.json name',
      },
      {
        name: 'framework',
        hint: '- Use arrow-keys. Return to submit.',
        type: 'select',
        message: 'Select the framework used in the project',
        initial: 0,
        choices: frameworks.map(framework => {
          const frameworkColor = framework.color
          return {
            title: frameworkColor(framework.display || framework.name),
            value: framework,
          }
        })
      },
      {
        type: (framework) =>
          framework && framework.variants ? 'select' : null,
        name: 'variant',
        message: reset('Select a variant:'),
        choices: (framework) =>
          framework.variants.map((variant) => {
            const variantColor = variant.color
            return {
              title: variantColor(variant.display || variant.name),
              value: variant.name,
            }
          }),
      },
      {
        type: (prev, answers) => prev && prev.stateManagement ? 'select' : null,
        name: 'stateManagement',
        message: reset('Select a state management library:'),
        choices: (prev, answers) => {
          console.log(prev, '快点解封两室的记录开发')
        }
      },
      {
        name: 'stateManagementLibarary',
        hint: '- Use arrow-keys. Return to submit.',
        type: 'select',
        message: 'Choose a state management repository to apply in your project',
        initial: 0,
        choices: (prev, answers) => {
          if (answers.framework.name === 'Vue3') {
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
          } else if (answers.framework.name === 'React18') {
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
        type: (prev, answers) => (answers.framework.name === 'Vue3' ? 'toggle' : null),
        message: 'Add JSX Support?',
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
          if (answers.framework.name === 'Vue3') {
            return [
              {
                title: 'Element Plus',
                value: 'elementPlus',
              },
            ]
          } else if (answers.framework.name === 'React18') {
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

  const {
    projectName,
    framework,
    shouldOverwrite,
    variant,
    stateManagementLibarary,
    packageName,
    needsJsx,
    needsEslint,
    needsPrettier,
    needsUI
  } = result

  const root = path.join(cwd, targetDir)

  if (fs.existsSync(root) && shouldOverwrite) {
    emptyDir(root)
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root)
  }

  let template = variant || framework?.name
  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent)
  const pkgManager = pkgInfo ? pkgInfo.name : 'npm'
  const isYarn1 = pkgManager === 'yarn' && pkgInfo?.version.startsWith('1.')
  
  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    '../..',
    `template-${template}`,
  )

  console.log(templateDir, '=================================', template)

  const write = (file, content) => {
    const targetPath = path.join(root, renameFiles[file] ?? file)
    if (content) {
      fs.writeFileSync(targetPath, content)
    } else {
      copy(path.join(templateDir, file), targetPath)
    }
  }

  const files = fs.readdirSync(templateDir)
  for (const file of files.filter((f) => f !== 'package.json')) {
    write(file)
  }

  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, `package.json`), 'utf-8'),
  )

  pkg.name = packageName || getProjectName()

  write('package.json', JSON.stringify(pkg, null, 2) + '\n')

  const cdProjectName = path.relative(cwd, root)
  console.log(`\nDone. Now run:\n`)
  if (root !== cwd) {
    console.log(
      `  cd ${
        cdProjectName.includes(' ') ? `"${cdProjectName}"` : cdProjectName
      }`,
    )
  }
  switch (pkgManager) {
    case 'yarn':
      console.log('  yarn')
      console.log('  yarn dev')
      break
    default:
      console.log(`  ${pkgManager} install`)
      console.log(`  ${pkgManager} run dev`)
      break
  }


}

init().catch(e => {
  console.error(e)
})

function pkgFromUserAgent(userAgent) {
  if (!userAgent) return undefined
  const pkgSpec = userAgent.split(' ')[0]
  const pkgSpecArr = pkgSpec.split('/')
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  }
}

function copy(src, dest) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    copyDir(src, dest)
  } else {
    fs.copyFileSync(src, dest)
  }
}

function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true })
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file)
    const destFile = path.resolve(destDir, file)
    copy(srcFile, destFile)
  }
}