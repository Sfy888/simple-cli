function getCommand(packageManager, scriptName, args) {
  if (scriptName === 'install') {
    return packageManager === 'yarn' ? 'yarn' : `${packageManager} install`
  }

  if (args) {
    return packageManager === 'npm'
      ? `npm run ${scriptName} -- ${args}`
      : `${packageManager} ${scriptName} ${args}`
  } else {
    return packageManager === 'npm' ? `npm run ${scriptName}` : `${packageManager} ${scriptName}`
  }
}

const sfcTypeSupportDoc = [
  '',
  '## Type Support for `.vue` Imports in TS',
  '',
  'TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.',
  ''
].join('\n')

export default function generateReadme({
  projectName,
  packageManager,
  needsEslint
}) {
  const commandFor = (scriptName, args) =>
    getCommand(packageManager, scriptName, args)

  let readme = `# ${projectName}

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

`

  let npmScriptsDescriptions = `\`\`\`sh
${commandFor('install')}
\`\`\`

### Compile and Hot-Reload for Development

\`\`\`sh
${commandFor('dev')}
\`\`\`

\`\`\`sh
${commandFor('build')}
\`\`\`
`




  if (needsEslint) {
    npmScriptsDescriptions += `
### Lint with [ESLint](https://eslint.org/)

\`\`\`sh
${commandFor('lint')}
\`\`\`
`
  }

  readme += npmScriptsDescriptions

  return readme
}
