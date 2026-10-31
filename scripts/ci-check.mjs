// 仓库自检：把「发版前必须成立」的约束写成可执行断言，交给 GitHub Actions 每次 push 跑一遍。
// 全部为纯 Node 实现，无第三方依赖，Windows / macOS / Linux 行为一致。
//
// 覆盖的坑（都是真实踩过的）：
//   · 语法错误导致插件整树加载失败（3.1.0 的漏逗号）
//   · 打包产物里语法错误 / 少了文件（3.1.1 的坏包）
//   · 版本号三段不一致（package.json / go-fetch UA / CHANGELOG 首节）
//   · 宿主包被静态 import（dsh.so 沙箱 L5 因此 failed）
//   · 清单与 patch 文件结构漂移（dsh.bundle.patch / id / name）
//   · 内置兜底数据格式或取值崩坏

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
let failures = 0
const ok = (name) => console.log(`  ok   ${name}`)
const fail = (name, detail) => {
  failures += 1
  console.error(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`)
}
const check = (name, fn) => {
  try {
    const result = fn()
    if (result === false) fail(name)
    else ok(name)
  } catch (error) {
    fail(name, error instanceof Error ? error.message : String(error))
  }
}
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const exists = (file) => fs.existsSync(path.join(root, file))

console.log('# files')
for (const file of [
  'index.js', 'client.js', 'go-fetch.js', 'go-data.js', 'cordis.patch.yml',
  'package.json', 'README.md', 'README.en.md', 'CHANGELOG.md', 'LICENSE', 'icon.svg',
  'locale/zh.json', 'locale/en.json', 'screenshots.json',
]) {
  check(`exists ${file}`, () => exists(file))
}

console.log('# syntax (host + client halves and data modules)')
for (const file of ['index.js', 'client.js', 'go-fetch.js', 'go-data.js']) {
  check(`node --check ${file}`, () => {
    execFileSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'pipe' })
    return true
  })
}

console.log('# version triple')
const pkg = JSON.parse(read('package.json'))
check('semver-ish version', () => /^\d+\.\d+\.\d+$/.test(pkg.version))
check('go-fetch User-Agent carries the same version', () => read('go-fetch.js').includes(`dsh-opencode-go-usage/${pkg.version}`))
check('CHANGELOG has a section for this version', () => read('CHANGELOG.md').split('\n').includes(`## ${pkg.version}`))
check('CHANGELOG newest section is this version', () => (read('CHANGELOG.md').match(/^## (\d+\.\d+\.\d+)$/m) || [])[1] === pkg.version)

console.log('# manifest')
check('name', () => pkg.name === '@verneuil/dsh-opencode-go-usage')
check('type is module', () => pkg.type === 'module')
check('main is index.js', () => pkg.main === 'index.js')
check('exports has "."', () => Boolean(pkg.exports?.['.']))
check('engines.dsh declared', () => typeof pkg.engines?.dsh === 'string' && pkg.engines.dsh.length > 0)
check('dsh.manifestVersion === 1', () => pkg.dsh?.manifestVersion === 1)
check('dsh.bundle.patch points at an existing file', () => {
  const declared = pkg.dsh?.bundle?.patch
  if (typeof declared !== 'string') return false
  return exists(declared.replace(/^\.\//, ''))
})
check('dsh.client.platform === "web"', () => pkg.dsh?.client?.platform === 'web')
check('files[] covers every shipped entry', () => {
  const files = Array.isArray(pkg.files) ? pkg.files : []
  return ['index.js', 'client.js', 'go-fetch.js', 'go-data.js', 'cordis.patch.yml', 'locale', 'icon.svg', 'README.md', 'README.en.md', 'CHANGELOG.md', 'LICENSE']
    .every((entry) => files.includes(entry))
})
check('no runtime dependency on host packages', () => {
  const deps = Object.keys(pkg.dependencies ?? {})
  return deps.length === 0 && Object.keys(pkg.peerDependencies ?? {}).length > 0
})
check('host packages are never regular dependencies', () => Object.keys(pkg.dependencies ?? {}).every((n) => !n.startsWith('@deepseek-ai/')))

console.log('# loader patch')
const patch = read('cordis.patch.yml')
check('patch declares an insert row', () => /^\s*-\s*insert:/m.test(patch))
check('patch row id is opencode-go-usage', () => /id:\s*opencode-go-usage\b/.test(patch))
check('patch row name is the package name', () => patch.includes(`'${pkg.name}'`) || patch.includes(`"${pkg.name}"`))

console.log('# host half contract')
const host = read('index.js')
check('exports name', () => /export\s+const\s+name\b/.test(host))
check('exports apply', () => /export\s+(async\s+)?function\s+apply\b/.test(host) || /export\s*\{[^}]*\bapply\b[^}]*\}/.test(host))
check('exports Config', () => /export\s+const\s+Config\b/.test(host))
check('declares inject', () => /export\s+const\s+inject\b/.test(host))
check('no static import of host packages (sandbox L5 regression guard)', () => !/^import\s[^;]*from\s+['"]@deepseek-ai\//m.test(host))
check('schemastery resolved lazily in two stages', () => host.includes('createRequire') && host.includes('await import("@deepseek-ai/schemastery")'))
check('degraded Config path exists', () => /Config\s*=\s*zReal\s*\?/.test(host))

console.log('# client half contract')
const client = read('client.js')
for (const [label, needle] of [
  ['module loader wrapper', '__ModuleLoader__'],
  ['shell.overlay seat', 'shell.overlay'],
  ['settings.section seat', 'settings.section'],
  ['sidebar.panellist seat', 'sidebar.panellist'],
  ['main panel seat', "'main'"],
  ['locale registration', 'locale.register'],
  ['settings nav icon marker', 'data-ocgu-nav'],
  ['popover refresh state', 'refreshState'],
]) {
  check(`client contains ${label}`, () => client.includes(needle))
}

console.log('# ring mapping')
check('Config declares the three ring fields', () => ['ringOuter', 'ringMiddle', 'ringInner'].every((k) => read('index.js').includes('  ' + k + ': z.string()')))
check('ring defaults keep outer=M / middle=W / inner=R', () => /ringOuter: z\.string\(\)\.default\("monthly"\)/.test(read('index.js')) && /ringMiddle: z\.string\(\)\.default\("weekly"\)/.test(read('index.js')) && /ringInner: z\.string\(\)\.default\("rolling"\)/.test(read('index.js')))
check('client resolves the mapping with a uniqueness fallback', () => read('client.js').includes('function ringKeysOf'))
check('client renders the live preview block', () => read('client.js').includes('ocgu-rmap') && read('client.js').includes('ringMapPreview'))
check('minimal pill consumes the mapping', () => read('client.js').includes('NEST_RADII'))
check('Config declares the pill scale', () => read('index.js').includes('widgetScale: z.number().default(1)'))
check('client exposes the eight slider stops', () => read('client.js').includes('var SCALE_STEPS = [0.8, 0.9, 1, 1.15, 1.3, 1.5, 1.75, 2]') && read('client.js').includes('ocgu-scale-input'))
check('pill root applies the scale transform', () => read('client.js').includes("transform: 'scale(' + pillScale + ')'"))

console.log('# locale bundles')
for (const file of ['locale/zh.json', 'locale/en.json']) {
  check(`${file} parses and carries meta.title`, () => {
    const parsed = JSON.parse(read(file))
    return typeof parsed.meta?.title === 'string' && parsed.meta.title.length > 0
  })
}

console.log('# bundled snapshot data')
const snapshot = await import(new URL('../go-data.js', import.meta.url))
const data = snapshot.GO_DATA_SNAPSHOT
check('snapshotDate is an ISO date', () => /^\d{4}-\d{2}-\d{2}$/.test(data.snapshotDate))
check('snapshotDate is not in the future', () => new Date(`${data.snapshotDate}T00:00:00Z`).getTime() <= Date.now() + 86400000)
check('snapshotDate is not older than 400 days', () => Date.now() - new Date(`${data.snapshotDate}T00:00:00Z`).getTime() < 400 * 86400000)
check('usdCny looks like a real rate', () => typeof data.fx?.usdCny === 'number' && data.fx.usdCny > 1 && data.fx.usdCny < 20)
check('model table has at least 20 entries', () => Array.isArray(data.models) && data.models.length >= 20)
check('every model has id and name', () => data.models.every((m) => typeof m.id === 'string' && m.id && typeof m.name === 'string' && m.name))
check('quota values are null or positive numbers', () => data.models.every((m) => m.go === null || (typeof m.go === 'number' && m.go > 0)))

console.log('# docs stay pinned to the shipped version')
for (const file of ['README.md', 'README.en.md']) {
  check(`${file} pins the current tag (v${pkg.version})`, () => read(file).includes(`v${pkg.version}`))
}

console.log('# screenshots referenced by the manifest exist')
check('screenshots.json lists existing files', () => {
  const list = JSON.parse(read('screenshots.json'))
  const rows = Array.isArray(list) ? list : list.screenshots
  return Array.isArray(rows) && rows.length > 0 && rows.every((rel) => exists(rel))
})

// 打包冒烟：真正跑一次 npm pack，核对产物内容并逐文件 node --check。
// 这一步就是为了挡住「仓库里是好的、发出去的包里是坏的」这类事故。
console.log('# pack smoke test')
const packDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ocgu-pack-'))
try {
  check('npm pack succeeds', () => {
    execFileSync('npm', ['pack', '--silent', '--pack-destination', packDir], { cwd: root, stdio: 'pipe', shell: process.platform === 'win32' })
    return fs.readdirSync(packDir).some((f) => f.endsWith('.tgz'))
  })
  const tarball = fs.readdirSync(packDir).find((f) => f.endsWith('.tgz'))
  const entries = tarball
    ? execFileSync('tar', ['-tzf', path.join(packDir, tarball)], { stdio: 'pipe' }).toString('utf8').split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    : []
  check('tarball ships the plugin entry points', () => ['index.js', 'client.js', 'go-fetch.js', 'go-data.js', 'cordis.patch.yml', 'package.json']
    .every((name) => entries.includes(`package/${name}`)))
  check('tarball excludes build leftovers', () => !entries.some((e) => /\.tgz$|\/scripts\/|node_modules|\/screenshots\//.test(e)))
  check('packed javascript parses', () => {
    if (!tarball) return false
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'ocgu-unpack-'))
    try {
      execFileSync('tar', ['-xzf', path.join(packDir, tarball), '-C', out], { stdio: 'pipe' })
      for (const file of ['index.js', 'client.js', 'go-fetch.js', 'go-data.js']) {
        execFileSync(process.execPath, ['--check', path.join(out, 'package', file)], { stdio: 'pipe' })
      }
      return true
    } finally {
      fs.rmSync(out, { recursive: true, force: true })
    }
  })
  check('packed package.json version matches the repo', () => {
    if (!tarball) return false
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'ocgu-unpack-'))
    try {
      execFileSync('tar', ['-xzf', path.join(packDir, tarball), '-C', out, 'package/package.json'], { stdio: 'pipe' })
      return JSON.parse(fs.readFileSync(path.join(out, 'package', 'package.json'), 'utf8')).version === pkg.version
    } finally {
      fs.rmSync(out, { recursive: true, force: true })
    }
  })
} finally {
  fs.rmSync(packDir, { recursive: true, force: true })
}

console.log('')
if (failures > 0) {
  console.error(`CI check failed: ${failures} problem(s).`)
  process.exit(1)
}
console.log('CI check passed.')
