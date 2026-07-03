#!/usr/bin/env node
/**
 * 拉取高德静态地图(satellite)图, 保存到 public/spot-images/.
 *
 * 用法:
 *   node scripts/fetch-satellite-images.mjs              # 拉所有 95 个 spot
 *   node scripts/fetch-satellite-images.mjs --sample     # 拉 /tmp/sample-spots.json 里的样例
 *
 * 依赖: .env.local 里 AMAP_KEY=...
 */

import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// === 1. 读 key from .env.local ===
const envContent = fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8')
const keyMatch = envContent.match(/^AMAP_KEY=(.+)$/m)
const AMAP_KEY = keyMatch?.[1]?.replace(/^["']|["']$/g, '').trim()
if (!AMAP_KEY) {
  console.error('❌ 未找到 AMAP_KEY, 请在 .env.local 加: AMAP_KEY="your_key"')
  process.exit(1)
}

// === 2. 选 spot: --sample 用 8 张样例, 否则全量 95 张 ===
const isSample = process.argv.includes('--sample')
let spots
if (isSample) {
  spots = JSON.parse(fs.readFileSync('/tmp/sample-spots.json', 'utf8'))
} else {
  // 从 mock.js 解析所有 spot
  const content = fs.readFileSync(path.join(ROOT, 'src/data/mock.js'), 'utf8')
  spots = []
  const re = /id:\s*'(sp_\d+)',\s*districtId:\s*'\w+'[^}]*?name:\s*'([^']+)'[^}]*?waterType:\s*'(\w+)'[^}]*?coords:\s*\{\s*lat:\s*([\d.]+),\s*lng:\s*([\d.]+)\s*\}/
  for (const m of content.matchAll(new RegExp(re, 'g'))) {
    const [, id, name, waterType, lat, lng] = m
    spots.push({ id, name, waterType, lat: parseFloat(lat), lng: parseFloat(lng) })
  }
}

console.log(`准备拉 ${spots.length} 张图 (${isSample ? '样例' : '全量'})`)
console.log(`API key: ${AMAP_KEY.slice(0, 4)}...${AMAP_KEY.slice(-4)}\n`)

// === 3. 输出目录 ===
const OUT_DIR = path.join(ROOT, 'public', 'spot-images')
fs.mkdirSync(OUT_DIR, { recursive: true })

// === 4. 拉图 ===
function fetchImage(spot) {
  const { lat, lng, name } = spot
  const params = new URLSearchParams({
    location: `${lng},${lat}`,
    zoom: '15',
    size: '800*600',
    scale: '2',
    maptype: 'satellite',
    markers: `mid,0xFFE66D,A:${lng},${lat}`,
    labels: `${name},2,0,14,0xFFFFFF,0x000000:${lng},${lat}`,
    key: AMAP_KEY
  })
  const url = `https://restapi.amap.com/v3/staticmap?${params.toString()}`

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        const buf = Buffer.concat(chunks)
        // 检测格式: PNG = 89 50 4E 47, JPG = FF D8 FF
        if (buf[0] === 0x89 && buf[1] === 0x50) {
          resolve({ buf, ext: 'png' })
        } else if (buf[0] === 0xFF && buf[1] === 0xD8) {
          resolve({ buf, ext: 'jpg' })
        } else {
          resolve({ buf, ext: 'err', text: buf.toString('utf8').slice(0, 300) })
        }
      })
    }).on('error', reject)
  })
}

let okCount = 0
let errCount = 0
const startTime = Date.now()

for (const spot of spots) {
  try {
    const result = await fetchImage(spot)
    if (result.ext === 'err') {
      errCount++
      console.log(`❌ ${spot.id} ${spot.name}: ${result.text.slice(0, 100)}`)
    } else {
      const filename = `${spot.id}.${result.ext}`
      fs.writeFileSync(path.join(OUT_DIR, filename), result.buf)
      okCount++
      const sizeKB = (result.buf.length / 1024).toFixed(0)
      console.log(`✅ ${spot.id} → ${filename} (${sizeKB} KB) ${spot.name}`)
    }
  } catch (e) {
    errCount++
    console.log(`❌ ${spot.id} ${spot.name}: ${e.message}`)
  }
  // 避免触发 rate limit
  await new Promise(r => setTimeout(r, 200))
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
console.log(`\n=== 完成 ===`)
console.log(`成功 ${okCount} / 失败 ${errCount} / 耗时 ${elapsed}s`)
console.log(`图片目录: ${OUT_DIR}`)
