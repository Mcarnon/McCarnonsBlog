import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'

const VUE_OVERRIDE_PACKAGES = [
  'vue',
  '@vue/compiler-core',
  '@vue/compiler-dom',
  '@vue/compiler-sfc',
  '@vue/compiler-ssr',
  '@vue/reactivity',
  '@vue/runtime-core',
  '@vue/runtime-dom',
  '@vue/server-renderer',
  '@vue/shared',
]

const workspaceFile = path.resolve('pnpm-workspace.yaml')
const requireFromRoot = createRequire(`${process.cwd()}/`)
const shouldWrite = process.argv.includes('--write')

function resolvePackageJson(packageName, paths) {
  try {
    return requireFromRoot.resolve(`${packageName}/package.json`, { paths })
  }
  catch {
    return ''
  }
}

function resolveValaxyDir() {
  const searchPaths = [
    process.cwd(),
    path.resolve('theme'),
  ]
  const packageJson = resolvePackageJson('valaxy', searchPaths)

  if (!packageJson)
    throw new Error('Cannot resolve valaxy/package.json. Run pnpm install first.')

  return path.dirname(fs.realpathSync(packageJson))
}

function resolveValaxyVueVersion(valaxyDir) {
  const packageJson = resolvePackageJson('vue', [valaxyDir])

  if (!packageJson)
    throw new Error('Cannot resolve vue/package.json from Valaxy. Run pnpm install first.')

  const raw = fs.readFileSync(packageJson, 'utf8')
  const parsed = JSON.parse(raw)

  if (!parsed.version)
    throw new Error(`Cannot read Vue version from ${packageJson}.`)

  return parsed.version
}

function readWorkspaceOverrides() {
  if (!fs.existsSync(workspaceFile))
    throw new Error('Cannot find pnpm-workspace.yaml.')

  // pnpm-workspace.yaml 结构固定且很小，手写读取可避免为脚本引入 YAML 运行时依赖。
  const lines = fs.readFileSync(workspaceFile, 'utf8').split(/\r?\n/)
  const overrides = new Map()
  let inOverrides = false

  for (const line of lines) {
    if (/^\S/.test(line))
      inOverrides = line.trim() === 'overrides:'

    if (!inOverrides)
      continue

    const matched = line.match(/^\s{2}['"]?([^'":]+)['"]?:\s*['"]?([^'"]+)['"]?\s*$/)
    if (matched)
      overrides.set(matched[1], matched[2])
  }

  return overrides
}

function formatOverrideKey(packageName) {
  return packageName.includes('/') ? `'${packageName}'` : packageName
}

function updateWorkspaceOverrides(version) {
  const source = fs.readFileSync(workspaceFile, 'utf8')
  // 写回时保留原文件换行风格，减少自动修复造成的无关 diff。
  const hasTrailingNewline = /\r?\n$/.test(source)
  const lineBreak = source.includes('\r\n') ? '\r\n' : '\n'
  const lines = source.split(/\r?\n/)
  const nextOverrideLines = VUE_OVERRIDE_PACKAGES.map(packageName => `  ${formatOverrideKey(packageName)}: ${version}`)
  const overridesIndex = lines.findIndex(line => line.trim() === 'overrides:' && !line.startsWith(' '))

  if (overridesIndex === -1) {
    const packagesIndex = lines.findIndex(line => line.trim() === 'packages:' && !line.startsWith(' '))
    const insertIndex = packagesIndex === -1 ? lines.findIndex(line => line.trim() === 'catalog:' && !line.startsWith(' ')) : packagesIndex
    const block = ['overrides:', ...nextOverrideLines]

    if (insertIndex === -1)
      lines.push('', ...block)
    else
      lines.splice(insertIndex, 0, ...block, '')
  }
  else {
    let endIndex = overridesIndex + 1
    while (endIndex < lines.length && (lines[endIndex].startsWith(' ') || lines[endIndex].trim() === ''))
      endIndex += 1

    lines.splice(overridesIndex, endIndex - overridesIndex, 'overrides:', ...nextOverrideLines)
  }

  let nextSource = lines.join(lineBreak)
  if (hasTrailingNewline && !nextSource.endsWith(lineBreak))
    nextSource += lineBreak

  fs.writeFileSync(workspaceFile, nextSource)
}

function main() {
  const valaxyDir = resolveValaxyDir()
  const vueVersion = resolveValaxyVueVersion(valaxyDir)
  const overrides = readWorkspaceOverrides()
  const mismatches = []

  VUE_OVERRIDE_PACKAGES.forEach((packageName) => {
    const actual = overrides.get(packageName)
    if (actual !== vueVersion)
      mismatches.push({ packageName, actual })
  })

  if (!mismatches.length) {
    process.stdout.write(`Vue overrides match Valaxy resolved Vue version: ${vueVersion}\n`)
    return
  }

  if (shouldWrite) {
    updateWorkspaceOverrides(vueVersion)
    process.stdout.write(`Updated Vue overrides to match Valaxy resolved Vue version: ${vueVersion}\n`)
    return
  }

  process.stderr.write(`Vue overrides should match Valaxy resolved Vue version: ${vueVersion}\n`)
  mismatches.forEach(({ packageName, actual }) => {
    process.stderr.write(`- ${packageName}: ${actual || '(missing)'} -> ${vueVersion}\n`)
  })
  process.exit(1)
}

try {
  main()
}
catch (error) {
  process.stderr.write(`${error.message}\n`)
  process.exit(1)
}
