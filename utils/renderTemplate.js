import * as fs from 'node:fs'
import * as path from 'node:path'
import { pathToFileURL } from 'node:url'

const isObject = (val) => val && typeof val === 'object'
const mergeArrayWithDedupe = (a, b) => Array.from(new Set([...a, ...b]))

/**
 * Recursively merge the content of the new object to the existing one
 * @param {Object} target the existing object
 * @param {Object} obj the new object
 */
function deepMerge(target, obj) {
  for (const key of Object.keys(obj)) {
    const oldVal = target[key]
    const newVal = obj[key]

    if (Array.isArray(oldVal) && Array.isArray(newVal)) {
      target[key] = mergeArrayWithDedupe(oldVal, newVal)
    } else if (isObject(oldVal) && isObject(newVal)) {
      target[key] = deepMerge(oldVal, newVal)
    } else {
      target[key] = newVal
    }
  }

  return target
}
// 作用：对 package.json 中的依赖进行排序
function sortDependencies(packageJson) {
  const sorted = {}

  const depTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']

  for (const depType of depTypes) {
    if (packageJson[depType]) {
      sorted[depType] = {}

      Object.keys(packageJson[depType])
        .sort()
        .forEach((name) => {
          sorted[depType][name] = packageJson[depType][name]
        })
    }
  }

  return {
    ...packageJson,
    ...sorted
  }
}


/**
 * Renders a template folder/file to the file system,
 * by recursively copying all files under the `src` directory,
 * with the following exception:
 *   - `_filename` should be renamed to `.filename`
 *   - Fields in `package.json` should be recursively merged
 * @param {string} src source filename to copy
 * @param {string} dest destination filename of the copy operation
 */
// 作用：渲染模板文件夹/文件到文件系统
function renderTemplate(src, dest, callbacks, variant) {
  const stats = fs.statSync(src)
  if (stats.isDirectory()) {
    // skip node_module
    if (path.basename(src) === 'node_modules') {
      return
    }

    // if it's a directory, render its subdirectories and files recursively
    fs.mkdirSync(dest, { recursive: true })
    for (const file of fs.readdirSync(src)) {
      renderTemplate(path.resolve(src, file), path.resolve(dest, file), callbacks, variant)
    }
    return
  }

  const filename = path.basename(src)

  if (filename === 'package.json' && fs.existsSync(dest)) {
    // merge instead of overwriting
    const existing = JSON.parse(fs.readFileSync(dest, 'utf8'))
    const newPackage = JSON.parse(fs.readFileSync(src, 'utf8'))
    const pkg = sortDependencies(deepMerge(existing, newPackage))
    fs.writeFileSync(dest, JSON.stringify(pkg, null, 2) + '\n')
    return
  }

  if (filename === 'extensions.json' && fs.existsSync(dest)) {
    // merge instead of overwriting
    const existing = JSON.parse(fs.readFileSync(dest, 'utf8'))
    const newExtensions = JSON.parse(fs.readFileSync(src, 'utf8'))
    const extensions = deepMerge(existing, newExtensions)
    fs.writeFileSync(dest, JSON.stringify(extensions, null, 2) + '\n')
    return
  }

  if (filename.startsWith('_')) {
    // rename `_file` to `.file`
    dest = path.resolve(path.dirname(dest), filename.replace(/^_/, '.'))
  }

  if (filename === '_gitignore' && fs.existsSync(dest)) {
    // append to existing .gitignore
    const existing = fs.readFileSync(dest, 'utf8')
    const newGitignore = fs.readFileSync(src, 'utf8')
    fs.writeFileSync(dest, existing + '\n' + newGitignore)
    return
  }

  if (variant.includes('ts')) {
    
  // `example.tjs` will be used to render `example.js`
    if (filename.endsWith('.t.mjs')) {
      dest = dest.replace(/\.t\.mjs$/, '')
      callbacks.push(async (dataStore, result) => {
        const getData = (await import(pathToFileURL(src).toString())).default
        // Though current `getData` are all sync, we still retain the possibility of async
        dataStore[dest] = await getData({
          oldData: dataStore[dest] || {},
          result
        })
      })
    }

    // data file for EJS templates
    // e.g. `example.data.mts` will be used to render `example.mts`
    if (filename.endsWith('.datat.mjs')) {
      // use dest path as key for the data store
      dest = dest.replace(/\.datat\.mjs$/, '')
      // Add a callback to the array for late usage when template files are being processed
      callbacks.push(async (dataStore, result) => {
        const getData = (await import(pathToFileURL(src).toString())).default
        // Though current `getData` are all sync, we still retain the possibility of async
        dataStore[dest] = await getData({
          oldData: dataStore[dest] || {},
          result
        })
      })

      return // skip copying the data file
    }
  } else {
    // `example.tjs` will be used to render `example.js`
    if (filename.endsWith('.m.mjs')) {
      dest = dest.replace(/\.m\.mjs$/, '')
      callbacks.push(async (dataStore, result) => {
        const getData = (await import(pathToFileURL(src).toString())).default
        // Though current `getData` are all sync, we still retain the possibility of async
        dataStore[dest] = await getData({
          oldData: dataStore[dest] || {},
          result
        })
      })
    }

    // data file for EJS templates
    // e.g. `example.data.mjs` will be used to render `example.mjs`
    if (filename.endsWith('.data.mjs')) {
      // use dest path as key for the data store
      dest = dest.replace(/\.data\.mjs$/, '')
      // Add a callback to the array for late usage when template files are being processed
      callbacks.push(async (dataStore, result) => {
        const getData = (await import(pathToFileURL(src).toString())).default
        // Though current `getData` are all sync, we still retain the possibility of async
        dataStore[dest] = await getData({
          oldData: dataStore[dest] || {},
          result
        })
      })

      return // skip copying the data file
    }
  }

  if (variant.includes('ts')) {
    if (src.includes('ts.mjs')) {
      dest = dest.replace(/ts\.mjs$/, 'ts')
    }
    if (!(src.includes('.m.mjs') || src.includes('.data.mjs') || src.includes('js.mjs'))) {
      // src原路径，dest目标路径
      fs.copyFileSync(src, dest)
    }
  } else {
    if (src.includes('js.mjs')) {
      dest = dest.replace(/js\.mjs$/, 'js')
    }
    if (!(src.includes('.t.mjs') || src.includes('.datat.mjs') || src.includes('ts.mjs'))) {
      
      fs.copyFileSync(src, dest)
    }
  }
  
}

export default renderTemplate
