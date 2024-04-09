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
import renderTemplate from '../utils/renderTemplate.js'
import generateReadme from '../utils/generateReadme.js'


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


  const defaultProjectName = !targetDir ? 'my-project' : targetDir

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
      // {
      //   type: (prev, answers) => prev && prev.stateManagement ? 'select' : null,
      //   name: 'stateManagement',
      //   message: reset('Select a state management library:'),
      //   choices: (prev, answers) => {
      //   }
      // },
      {
        name: 'stateManagementLibarary',
        hint: '- Use arrow-keys. Return to submit.',
        type: 'select',
        message: 'Choose a state management repository to apply in your project',
        initial: 1,
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
              {
                title: 'Ant Design Vue',
                value: 'antd-vue',
              }
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
      {
        name: 'needsI18n',
        type: 'toggle',
        message: 'Add internationalization?',
        initial: false,
        active: "Yes",
        inactive: "No",
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
    needsUI,
    needsI18n
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

  /*
  TODO: 
  1、有四个base模板，vue/vue-ts react/react-ts
  2、基于base模板 添加是否需要jsx/状态管理库/样式UI库/国际化
  */
  // 在调用 renderTemplate 时，如果文件以 .data.mjs 结尾，就会往 callbacks 数组中添加一个回调函数
  const callbacks = []
  const render = (templateName) => {
    const templateDir = path.resolve(fileURLToPath(import.meta.url), '../../template', templateName)
    renderTemplate(templateDir, root, callbacks, variant)
  }

  render(`template-${variant}`)
  
  // 渲染 config文件写的所有文件

  if (variant.includes('vue')) {
    render('config/auto-importer')
    render('config/auto-registry-component')
  }

  switch (stateManagementLibarary) {
    case 'vuex':
      // 加载vuex配置
     render('config/vuex')
     break
    case 'pinia':
      // 加载pinia配置
     render('config/pinia')
     break
    case 'redux':
      // 加载redux配置
     render('config/redux')
     break
    case 'mobx':
      // 加载mobx配置
     render('config/mobx')
     break
    default:
     break
  }
  if (needsJsx) {
    render('config/jsx')
  }
  if (needsEslint) {

  }
  if (needsUI) {
    if (needsUI === 'elementPlus') {
      render('config/element-plus')
    } else if (needsUI === 'antd-vue') {
      render('config/antd-vue')
    } else {
      render('config/antd')
    }
  }
  if (needsI18n) {
    if (variant.includes('vue')) {
      render('config/i18n-vue')
    } else {
      render('config/i18n-react')
    }
  }
  
  
  // 调用 callbacks 数组中的每一个回调函数
  // 在回调函数中，会调用 getData 函数，然后将返回的数据存储到 dataStore 中
  const dataStore = {}
  // Process callbacks
  for (const cb of callbacks) {
    await cb(dataStore, result)
  }
  // EJS template rendering
  // 前序遍历文件夹，对每一个文件进行处理，如果文件以 .ejs 结尾，就渲染模板
  preOrderDirectoryTraverse(
    root,
    () => {},
    (filepath) => {
      if (filepath.endsWith('.ejs')) {
        const template = fs.readFileSync(filepath, 'utf-8')
        const dest = filepath.replace(/\.ejs$/, '')
        if (dataStore[dest]) dataStore[dest].result = result
        const content = ejs.render(template, dataStore[dest])
        fs.writeFileSync(dest, content)
        fs.unlinkSync(filepath)
      }
    }
  )
  

  const userAgent = process.env.npm_config_user_agent ?? ''
  const packageManager = /pnpm/.test(userAgent) ? 'pnpm' : /yarn/.test(userAgent) ? 'yarn' : 'npm'

  // README generation
  fs.writeFileSync(
    path.resolve(root, 'README.md'),
    generateReadme({
      projectName: result.projectName ?? result.packageName ?? defaultProjectName,
      packageManager,
      needsEslint
    })
  )


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

// 前序遍历 dir 目录，针对目录调用 dirCallback 并把目录路径传递给它，针对文件调用 fileCallback 并把文件路径传递给它
export function preOrderDirectoryTraverse(dir, dirCallback, fileCallback) {
  for (const filename of fs.readdirSync(dir)) {
    if (filename === '.git') {
      continue
    }
    const fullpath = path.resolve(dir, filename)
    if (fs.lstatSync(fullpath).isDirectory()) {
      dirCallback(fullpath)
      // in case the dirCallback removes the directory entirely
      if (fs.existsSync(fullpath)) {
        preOrderDirectoryTraverse(fullpath, dirCallback, fileCallback)
      }
      continue
    }
    fileCallback(fullpath)
  }
}