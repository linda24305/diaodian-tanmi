<template>
  <div class="map-canvas-wrap" ref="wrap">
    <svg
      :viewBox="`0 0 ${width} ${height}`"
      :width="width"
      :height="height"
      class="map-svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id="paper" patternUnits="userSpaceOnUse" width="120" height="120">
          <rect width="120" height="120" fill="#ecdfb8" />
          <circle cx="20" cy="30" r="0.6" fill="#a89878" opacity="0.35" />
          <circle cx="80" cy="90" r="0.5" fill="#a89878" opacity="0.3" />
          <circle cx="50" cy="65" r="0.4" fill="#a89878" opacity="0.45" />
          <circle cx="105" cy="20" r="0.3" fill="#a89878" opacity="0.4" />
        </pattern>
        <pattern id="hatch" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="#8a7550" stroke-width="0.5" opacity="0.4" />
        </pattern>
        <radialGradient id="waterGrad" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="#a8c4be" />
          <stop offset="100%" stop-color="#7ba098" />
        </radialGradient>
        <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#7ba098" />
          <stop offset="100%" stop-color="#a8c4be" />
        </linearGradient>
        <radialGradient id="land" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stop-color="#e8d9b2" />
          <stop offset="100%" stop-color="#d4c08a" />
        </radialGradient>
      </defs>

      <rect width="100%" height="100%" fill="url(#paper)" />

      <!-- 经纬度网格 -->
      <g class="grid" stroke="#a89878" stroke-width="0.4" opacity="0.2" fill="none">
        <line v-for="(lng, i) in lngLines" :key="`v${i}`"
          :x1="lngToX(lng)" y1="40" :x2="lngToX(lng)" y2="710" stroke-dasharray="2 4" />
        <line v-for="(lat, i) in latLines" :key="`h${i}`"
          x1="50" :y1="latToY(lat)" x2="1150" :y2="latToY(lat)" stroke-dasharray="2 4" />
      </g>
      <g class="scale" fill="#8a7550" font-family="Inter, sans-serif" font-size="9" opacity="0.55">
        <text v-for="(lng, i) in lngLines" :key="`lx${i}`"
          :x="lngToX(lng)" y="725" text-anchor="middle">{{ lng.toFixed(1) }}°E</text>
        <text v-for="(lat, i) in latLines" :key="`ly${i}`"
          x="32" :y="latToY(lat) + 3" text-anchor="middle">{{ lat.toFixed(1) }}°N</text>
      </g>

      <!-- 杭州陆地背景 -->
      <g class="land-bg">
        <rect x="50" y="40" width="1100" height="670" rx="14" fill="url(#land)" opacity="0.45" />
      </g>

      <!-- 西部山地纹理 -->
      <g class="terrain-west">
        <path
          d="M 50 220 Q 100 200 150 240 Q 200 280 240 320 L 240 470 Q 220 540 200 590 L 200 710 L 50 710 Z"
          fill="url(#hatch)" opacity="0.5" />
        <path
          d="M 200 470 Q 250 500 280 560 L 280 710 L 50 710 L 50 580 Q 100 540 150 510 Q 180 490 200 470 Z"
          fill="url(#hatch)" opacity="0.4" />
      </g>

      <!-- 南部山地纹理 -->
      <g class="terrain-south">
        <path
          d="M 700 600 Q 750 580 820 590 Q 900 600 970 620 Q 1050 640 1110 660 L 1150 670 L 1150 710 L 700 710 Z"
          fill="url(#hatch)" opacity="0.45" />
      </g>

      <!-- 山脉符号 -->
      <g class="mountains" stroke="#7a6a4a" stroke-width="1.1" fill="none" opacity="0.65">
        <path d="M 95 320 l 4 -8 l 4 8 M 103 320 l 4 -10 l 4 10 M 111 320 l 4 -8 l 4 8" />
        <path d="M 110 380 l 4 -8 l 4 8 M 118 380 l 4 -10 l 4 10 M 126 380 l 4 -8 l 4 8" />
        <path d="M 130 440 l 4 -8 l 4 8 M 138 440 l 4 -10 l 4 10 M 146 440 l 4 -8 l 4 8" />
        <path d="M 90 480 l 4 -8 l 4 8 M 98 480 l 4 -10 l 4 10" />
        <path d="M 150 540 l 4 -8 l 4 8 M 158 540 l 4 -10 l 4 10 M 166 540 l 4 -8 l 4 8" />
        <path d="M 100 580 l 4 -8 l 4 8 M 108 580 l 4 -10 l 4 10" />
        <path d="M 780 640 l 4 -8 l 4 8 M 788 640 l 4 -10 l 4 10 M 796 640 l 4 -8 l 4 8" />
        <path d="M 880 650 l 4 -8 l 4 8 M 888 650 l 4 -10 l 4 10 M 896 650 l 4 -8 l 4 8" />
        <path d="M 990 670 l 4 -8 l 4 8 M 998 670 l 4 -10 l 4 10" />
      </g>

      <!-- 水系组 -->
      <g class="water-system">
        <!-- 千岛湖 -->
        <path
          d="M 240 360 Q 280 350 320 365 Q 360 380 400 380 Q 440 378 480 395
             Q 510 410 530 440 Q 540 470 530 500 Q 510 520 480 525
             Q 440 530 400 525 Q 360 520 320 510 Q 280 495 260 475
             Q 245 450 240 420 Q 235 390 240 360 Z"
          fill="url(#waterGrad)" stroke="#4a6d6a" stroke-width="1.2" opacity="0.85" />
        <g class="islands" fill="#c8b888" stroke="#8a7550" stroke-width="0.6">
          <ellipse cx="310" cy="410" rx="14" ry="6" />
          <ellipse cx="370" cy="445" rx="18" ry="7" />
          <ellipse cx="430" cy="420" rx="12" ry="5" />
          <ellipse cx="400" cy="490" rx="20" ry="8" />
          <ellipse cx="340" cy="475" rx="10" ry="4" />
          <ellipse cx="460" cy="465" rx="14" ry="6" />
        </g>

        <!-- 新安江 -->
        <path
          d="M 530 460 Q 580 460 620 475 Q 670 490 720 505 Q 760 515 800 525"
          stroke="url(#riverGrad)" stroke-width="4.5" fill="none" stroke-linecap="round" opacity="0.9" />

        <!-- 富春江 -->
        <path
          d="M 800 525 Q 840 530 870 525 Q 905 515 930 500 Q 960 480 985 470"
          stroke="url(#riverGrad)" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.92" />

        <!-- 钱塘江 -->
        <path
          d="M 985 470 Q 1010 460 1030 445 Q 1050 425 1055 400
             Q 1058 375 1050 350 Q 1042 325 1050 300
             Q 1062 275 1085 265 Q 1115 258 1150 260"
          stroke="url(#riverGrad)" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.93" />

        <!-- 西湖 -->
        <path
          d="M 920 100 Q 945 95 965 100 Q 985 105 990 120 Q 995 138 985 150
             Q 970 160 945 158 Q 925 155 915 140 Q 910 122 920 100 Z"
          fill="url(#waterGrad)" stroke="#4a6d6a" stroke-width="1" opacity="0.88" />
        <g stroke="#e8d9b2" stroke-width="0.8" fill="none" opacity="0.7">
          <path d="M 925 105 Q 950 130 980 150" />
          <path d="M 920 130 Q 945 145 985 145" />
        </g>

        <!-- 青山湖 -->
        <path
          d="M 720 120 Q 745 115 770 122 Q 790 130 795 148 Q 790 165 770 172
             Q 745 178 725 168 Q 712 152 720 120 Z"
          fill="url(#waterGrad)" stroke="#4a6d6a" stroke-width="0.9" opacity="0.85" />

        <!-- 京杭大运河 -->
        <path
          d="M 850 90 Q 920 92 980 95 Q 1040 97 1080 100 Q 1110 102 1140 105"
          stroke="url(#riverGrad)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8" />
        <path
          d="M 920 105 Q 925 115 925 120"
          stroke="url(#riverGrad)" stroke-width="2" fill="none" opacity="0.6" />
      </g>

      <!-- 水系文字标注 -->
      <g class="water-labels" fill="#4a6d6a" font-family="Noto Serif SC, serif" opacity="0.78" font-style="italic">
        <text x="385" y="455" text-anchor="middle" font-size="14" letter-spacing="6">千 岛 湖</text>
        <text x="980" y="135" text-anchor="middle" font-size="12" letter-spacing="3">西 湖</text>
        <text x="755" y="180" text-anchor="middle" font-size="11" letter-spacing="2">青 山 湖</text>
        <text x="980" y="86" text-anchor="middle" font-size="10">京杭大运河</text>
        <text x="700" y="498" font-size="11" letter-spacing="2">新安江</text>
        <text x="900" y="500" font-size="12" letter-spacing="3">富春江</text>
        <text x="1100" y="290" font-size="13" letter-spacing="3">钱 塘 江</text>
      </g>

      <!-- 行政区文字 -->
      <g class="region-labels" fill="#8a7550" font-family="Inter, sans-serif" font-size="10" opacity="0.55">
        <text x="180" y="280" letter-spacing="2">临 安 区</text>
        <text x="160" y="380" letter-spacing="2">淳 安 县</text>
        <text x="830" y="600" letter-spacing="2">富 阳 区</text>
        <text x="1000" y="540" letter-spacing="2">萧 山 区</text>
        <text x="1000" y="220" letter-spacing="2" fill="#3d5a47" font-weight="600" opacity="0.85">杭 州 主 城</text>
      </g>

      <!-- 主城图标 -->
      <g class="city-mark" transform="translate(1010, 232)">
        <circle r="8" fill="#3d5a47" opacity="0.18" />
        <circle r="4" fill="#3d5a47" />
        <circle r="1.5" fill="#f4ede0" />
      </g>

      <!-- 右侧水纹 -->
      <g class="sea-waves" stroke="#7ba098" stroke-width="0.8" fill="none" opacity="0.5">
        <path v-for="i in 8" :key="i"
          :d="`M 1148 ${150 + i * 30} q 5 -3 10 0 t 10 0`" />
      </g>

      <!-- 地图角落徽记 -->
      <g class="cartouche" transform="translate(70, 80)">
        <rect x="-8" y="-26" width="190" height="42" rx="5"
          fill="#faf6ec" stroke="#8a7550" stroke-width="1" opacity="0.95" />
        <text x="0" y="-10" font-size="12" font-family="Noto Serif SC, serif" font-weight="700" fill="#3d5a47" letter-spacing="5">
          杭 州 水 域 秘 境
        </text>
        <text x="0" y="6" font-size="7" font-family="Inter, sans-serif" fill="#7a6a4a" letter-spacing="1.5">
          HANGZHOU · CARTE DES PÊCHEURS
        </text>
      </g>

      <!-- 罗盘 -->
      <g class="compass" transform="translate(1080, 660)">
        <circle r="32" fill="#faf6ec" opacity="0.85" stroke="#8a7550" stroke-width="0.8" />
        <circle r="26" fill="none" stroke="#a89878" stroke-width="0.4" stroke-dasharray="2 2" />
        <path d="M 0 -28 L 4 0 L 0 28 L -4 0 Z" fill="#c8553d" opacity="0.7" />
        <path d="M 0 -28 L 4 0 L 0 0 Z" fill="#c8553d" />
        <text y="-32" text-anchor="middle" font-size="9" font-family="Noto Serif SC, serif" font-weight="700" fill="#c8553d">N</text>
        <text y="40" text-anchor="middle" font-size="8" fill="#8a7550">S</text>
        <text x="-36" y="3" text-anchor="middle" font-size="8" fill="#8a7550">W</text>
        <text x="36" y="3" text-anchor="middle" font-size="8" fill="#8a7550">E</text>
      </g>

      <!-- 比例尺 -->
      <g class="scale-bar" transform="translate(80, 670)">
        <text x="0" y="-6" font-size="8" font-family="Inter, sans-serif" fill="#7a6a4a">比例尺 SCALE</text>
        <rect x="0" y="0" width="30" height="6" fill="#3d5a47" />
        <rect x="30" y="0" width="30" height="6" fill="#faf6ec" stroke="#3d5a47" stroke-width="0.5" />
        <rect x="60" y="0" width="30" height="6" fill="#3d5a47" />
        <text x="0" y="20" font-size="8" fill="#7a6a4a">0</text>
        <text x="60" y="20" font-size="8" fill="#7a6a4a">20</text>
        <text x="90" y="20" font-size="8" fill="#7a6a4a">40 km</text>
      </g>

      <!-- 钓点标记 -->
      <g class="markers">
        <g
          v-for="spot in spots"
          :key="spot.id"
          :transform="`translate(${posToX(spot.position.x)}, ${posToY(spot.position.y)})`"
          class="marker"
          :class="{
            selected: selectedId === spot.id,
            hover: hoverId === spot.id,
            dim: selectedId && selectedId !== spot.id
          }"
          @click="$emit('select', spot)"
        >
          <circle r="14" class="marker-glow" :class="`glow-${spot.waterType}`" />
          <circle r="9" :fill="colorFor(spot.waterType)" stroke="#fff" stroke-width="2" />
          <circle r="3" fill="#fff" />
          <circle v-if="selectedId === spot.id" r="9" fill="none" stroke="#c8553d" stroke-width="2" class="pulse" />
          <g :transform="labelOffset(spot)" class="marker-label">
            <rect x="0" y="-9" rx="3" :width="textWidth(spot.name) + 12" height="18"
              :fill="selectedId === spot.id ? '#2a3528' : '#faf6ec'"
              :stroke="selectedId === spot.id ? '#2a3528' : '#d8cfb8'"
              stroke-width="0.8" opacity="0.96" />
            <text x="6" y="3" font-size="10" font-weight="600"
              :fill="selectedId === spot.id ? '#f4ede0' : '#2a3528'"
              font-family="Inter, sans-serif">{{ spot.name }}</text>
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { HZ_BOUNDS } from '@/data/mock'

const props = defineProps({
  spots: Array,
  selectedId: String,
  hoverId: String
})
defineEmits(['select'])

const width = 1200
const height = 750

// 内部画布边界(viewBox 1200x750 内,留 50px 边距)
const MAP_LEFT = 50
const MAP_RIGHT = 1150
const MAP_TOP = 40
const MAP_BOTTOM = 710

// spot.position 是百分比(0-100),映射到画布 px
function posToX(xPct) {
  return MAP_LEFT + (xPct / 100) * (MAP_RIGHT - MAP_LEFT)
}
function posToY(yPct) {
  return MAP_TOP + (yPct / 100) * (MAP_BOTTOM - MAP_TOP)
}

// 经纬度 → 画布 px(用于经纬度网格)
function lngToX(lng) {
  const { west, east } = HZ_BOUNDS
  return MAP_LEFT + ((lng - west) / (east - west)) * (MAP_RIGHT - MAP_LEFT)
}
function latToY(lat) {
  const { north, south } = HZ_BOUNDS
  return MAP_TOP + ((north - lat) / (north - south)) * (MAP_BOTTOM - MAP_TOP)
}

// 经纬度网格线(0.4 度一条)
const lngLines = []
for (let lng = 118.0; lng <= 120.8; lng += 0.4) lngLines.push(lng)
const latLines = []
for (let lat = 29.0; lat <= 30.8; lat += 0.4) latLines.push(lat)

function colorFor(type) {
  return {
    lake: '#7ba098',
    river: '#4a6d6a',
    reservoir: '#5a8a8e',
    creek: '#7eaab5',
    sea: '#3a6b8a'
  }[type] || '#7ba098'
}

function textWidth(name) {
  let w = 0
  for (const c of name) {
    w += /[\u4e00-\u9fff]/.test(c) ? 10 : 5.5
  }
  return w
}

// 标签错开:杭州主城附近 4 个点会挤一起,用 leader line 错开
function labelOffset(spot) {
  const map = {
    sp_004: 'translate(-110, -22)',   // 西溪(左上)
    sp_005: 'translate(16, -28)',     // 拱宸桥(右上)
    sp_006: 'translate(16, 22)'       // 七堡(右下)
  }
  return map[spot.id] || 'translate(14, 4)'
}
</script>

<style scoped>
.map-canvas-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}
.map-svg {
  max-width: 100%;
  max-height: 100%;
  filter: drop-shadow(0 4px 16px rgba(42, 53, 40, 0.12));
}

.marker {
  cursor: pointer;
  transition: opacity 0.2s;
}
.marker.dim {
  opacity: 0.35;
}
.marker-glow {
  opacity: 0;
  transition: opacity 0.2s;
}
.marker.hover .marker-glow,
.marker.selected .marker-glow {
  opacity: 0.5;
}
.glow-lake { fill: #7ba098; }
.glow-river { fill: #4a6d6a; }
.glow-reservoir { fill: #5a8a8e; }
.glow-creek { fill: #7eaab5; }
.glow-sea { fill: #3a6b8a; }

.pulse {
  animation: pulse 1.6s ease-out infinite;
  transform-origin: center;
}
@keyframes pulse {
  0% { r: 9; opacity: 1; }
  100% { r: 24; opacity: 0; }
}

.marker-label {
  pointer-events: none;
}
</style>