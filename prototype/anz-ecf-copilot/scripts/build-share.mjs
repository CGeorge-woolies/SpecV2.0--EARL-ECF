#!/usr/bin/env node
// Interactive wrapper around `vite build --mode share`. Before building, it asks whether
// to bump the version count shown in the app's header/footer (src/version.json). Bumping
// increments by 0.1 by default (e.g. 1.1 -> 1.2), or you can type an exact version (e.g.
// 2.0). A bump also refreshes the "as at" timestamp; skipping the bump leaves both alone.
// The built file is named after the current version: anz-ecf-union-v-<version>.html.

import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync, renameSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const versionPath = path.join(root, 'src', 'version.json')

function incrementVersion(version) {
  const tenths = Math.round(parseFloat(version) * 10) + 1
  return (tenths / 10).toFixed(1)
}

function formatTimestamp(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

async function resolveVersion(current) {
  if (!process.stdin.isTTY) {
    console.log(`Non-interactive shell — skipping version bump prompt, keeping version ${current}.`)
    return current
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout })
  try {
    const suggested = incrementVersion(current)
    const answer = await rl.question(
      `Current version is ${current}. Update version count? [Enter/y = bump to ${suggested}, type a version e.g. 2.0, or n = keep ${current}]: `
    )
    const trimmed = answer.trim().toLowerCase()

    if (trimmed === '' || trimmed === 'y' || trimmed === 'yes') return suggested
    if (trimmed === 'n' || trimmed === 'no') return current
    if (/^\d+(\.\d+)?$/.test(trimmed)) return trimmed

    console.log(`Didn't recognise "${answer}" — keeping version ${current}.`)
    return current
  } finally {
    rl.close()
  }
}

const versionData = JSON.parse(readFileSync(versionPath, 'utf8'))
const newVersion = await resolveVersion(versionData.version)

if (newVersion !== versionData.version) {
  versionData.version = newVersion
  versionData.timestamp = formatTimestamp(new Date())
  writeFileSync(versionPath, JSON.stringify(versionData, null, 2) + '\n')
  console.log(`Version updated to ${newVersion} (${versionData.timestamp}).`)
} else {
  console.log(`Keeping version ${versionData.version}.`)
}

execSync('tsc -b && vite build --mode share', { cwd: root, stdio: 'inherit' })

const distDir = path.join(root, 'dist')
const outputName = `anz-ecf-union-v-${versionData.version.replace('.', '-')}.html`
renameSync(path.join(distDir, 'index.html'), path.join(distDir, outputName))
console.log(`Built dist/${outputName}`)
