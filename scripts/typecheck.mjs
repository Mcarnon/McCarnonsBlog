import { execSync } from 'node:child_process'
import process from 'node:process'

let output = ''
let exitCode = 0

try {
  output = execSync('pnpm exec vue-tsc --noEmit --skipLibCheck --pretty false', {
    encoding: 'utf8',
    stdio: 'pipe',
  })
}
catch (error) {
  output = `${error.stdout || ''}${error.stderr || ''}`
  exitCode = error.status ?? 1
}

function isDiagnosticStart(line) {
  return /(?:^|[\\/])[^()\s]+\(\d+,\d+\):\s+error\s+TS\d+:/.test(line)
}

function isNodeModulesDiagnostic(lines) {
  return lines.some(line => line.includes('node_modules/'))
}

// Valaxy 依赖里的类型噪声不属于主题源码问题；按诊断块过滤，避免留下孤立的多行错误详情。
const diagnostics = []
let currentDiagnostic = []

for (const line of output.split(/\r?\n/)) {
  if (isDiagnosticStart(line) && currentDiagnostic.length) {
    diagnostics.push(currentDiagnostic)
    currentDiagnostic = []
  }

  currentDiagnostic.push(line)
}

if (currentDiagnostic.length)
  diagnostics.push(currentDiagnostic)

const filtered = diagnostics
  .filter(lines => !isNodeModulesDiagnostic(lines))
  .flat()
  .join('\n')
  .trim()

if (filtered) {
  process.stdout.write(`${filtered}\n`)
  process.exit(exitCode)
}

process.exit(0)
