#!/usr/bin/env node
/**
 * 一键部署 dist 到 gh-pages 分支。
 *
 * 流程: vite build → 同步 dist 到 gh-pages worktree → commit → push
 *
 * 用法: npm run deploy
 *
 * 依赖:
 *   - git worktree (复用或自动创建 /tmp/<project>-gh-pages)
 *   - 远端 origin 已配置
 */

import { execSync } from 'node:child_process'
import { existsSync, cpSync, readdirSync, rmSync } from 'node:fs'
import { join, basename } from 'node:path'

const ROOT = process.cwd()
const PROJECT_NAME = basename(ROOT)
const DEFAULT_WT = `/tmp/${PROJECT_NAME}-gh-pages`

const sleep = (ms) => execSync(`sleep ${ms / 1000}`)

function sh(cmd, cwd = ROOT) {
  console.log(`$ ${cmd}`)
  return execSync(cmd, { stdio: 'inherit', cwd })
}

function shOut(cmd, cwd = ROOT) {
  return execSync(cmd, { cwd, encoding: 'utf8' }).toString()
}

/**
 * 跑一条命令,失败时按指数退避重试(给 GitHub 偶发的 HTTP2/timeout 错误留余地)。
 */
function shWithRetry(cmd, cwd, retries = 3) {
  for (let i = 1; i <= retries; i++) {
    try {
      return sh(cmd, cwd)
    } catch (e) {
      console.warn(`[retry] attempt ${i}/${retries} failed: ${e.message.split('\n')[0]}`)
      if (i === retries) throw e
      sleep(2000 * i)
    }
  }
}

console.log('\n=== 1/4 build ===')
sh('npm run build')

console.log('\n=== 2/4 找或建 gh-pages worktree ===')
const wtList = shOut('git worktree list')
let wtPath = null
for (const line of wtList.split('\n')) {
  // 形如 "/path/to/wt  abc1234 [gh-pages]"
  if (line.includes('[gh-pages]')) {
    wtPath = line.trim().split(/\s+/)[0]
    break
  }
}
if (wtPath) {
  console.log(`复用已存在的 worktree: ${wtPath}`)
} else {
  wtPath = DEFAULT_WT
  console.log(`新建 worktree: ${wtPath}`)
  sh(`git worktree add ${wtPath} gh-pages`)
}

// worktree 必须干净(没有未提交的改动),否则覆盖会冲突
const wtStatus = shOut('git status --porcelain', wtPath).trim()
if (wtStatus) {
  console.error(`\ngh-pages worktree 不干净,有未提交改动:\n${wtStatus}`)
  console.error('请先在 worktree 里处理这些改动(commit / stash / 丢弃),再跑 deploy。')
  process.exit(1)
}

console.log('\n=== 3/4 同步 dist → worktree ===')
const dist = join(ROOT, 'dist')

cpSync(join(dist, 'index.html'), join(wtPath, 'index.html'))

const wtAssets = join(wtPath, 'assets')
if (existsSync(wtAssets)) {
  for (const f of readdirSync(wtAssets)) {
    rmSync(join(wtAssets, f))
  }
} else {
  execSync(`mkdir -p ${wtAssets}`)
}
for (const f of readdirSync(join(dist, 'assets'))) {
  cpSync(join(dist, 'assets', f), join(wtAssets, f))
}

const faviconSrc = join(ROOT, 'public', 'favicon.svg')
if (existsSync(faviconSrc)) {
  cpSync(faviconSrc, join(wtPath, 'favicon.svg'))
}

// macOS 杂质,gh-pages 不该提交
for (const noise of ['.DS_Store']) {
  const p = join(wtPath, noise)
  if (existsSync(p)) rmSync(p)
}

console.log('\n=== 4/4 commit + push ===')
sh('git add -A', wtPath)
const diffStat = shOut('git status --porcelain', wtPath).trim()
if (!diffStat) {
  console.log('dist 跟上次部署一致,没有新内容,跳过 commit/push')
} else {
  sh('git commit -m "chore: sync dist to gh-pages"', wtPath)
  shWithRetry('git push origin gh-pages', wtPath)
}

console.log('\n✅ 部署完成 → GitHub Pages 会在 1-2 分钟内刷新')
