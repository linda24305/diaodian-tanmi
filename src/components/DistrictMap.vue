<template>
  <div class="district-map-wrap">
    <svg
      :viewBox="viewBox"
      :width="canvasW"
      :height="canvasH"
      class="district-map-svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id="dm-paper" patternUnits="userSpaceOnUse" width="120" height="120">
          <rect width="120" height="120" fill="#ecdfb8" />
          <circle cx="20" cy="30" r="0.6" fill="#a89878" opacity="0.35" />
          <circle cx="80" cy="90" r="0.5" fill="#a89878" opacity="0.3" />
          <circle cx="50" cy="65" r="0.4" fill="#a89878" opacity="0.45" />
        </pattern>
        <radialGradient id="dm-water" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="#a8c4be" />
          <stop offset="100%" stop-color="#7ba098" />
        </radialGradient>
        <linearGradient id="dm-river" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#7ba098" />
          <stop offset="100%" stop-color="#a8c4be" />
        </linearGradient>
      </defs>

      <rect :width="canvasW" :height="canvasH" fill="url(#dm-paper)" />

      <!-- 邻区轮廓(浅背景) -->
      <g class="neighbors" opacity="0.25">
        <path
          v-for="d in neighborDistricts"
          :key="`n-${d.id}`"
          :d="d.dPath"
          fill="#c8b888"
          stroke="#8a7550"
          stroke-width="0.8"
          stroke-dasharray="3 3"
        />
        <text
          v-for="d in neighborDistricts"
          :key="`nl-${d.id}`"
          :x="d.labelPos.x"
          :y="d.labelPos.y"
          font-family="Noto Serif SC, serif"
          font-size="13"
          fill="#7a6a4a"
          text-anchor="middle"
          opacity="0.5"
          letter-spacing="2"
        >{{ d.name }}</text>
      </g>

      <!-- 当前区底色 -->
      <path
        :d="mainPath"
        :fill="district.fillColor"
        fill-opacity="0.5"
        stroke="#3d5a47"
        stroke-width="2"
        stroke-linejoin="round"
      />

      <!-- 区名水印 -->
      <text
        :x="canvasW / 2"
        :y="canvasH * 0.85"
        text-anchor="middle"
        font-family="Noto Serif SC, serif"
        font-weight="700"
        :font-size="Math.min(canvasW, canvasH) * 0.18"
        fill="#3d5a47"
        opacity="0.08"
        letter-spacing="0.1em"
      >{{ district.name }}</text>

      <!-- 区名正式标注 -->
      <g :transform="`translate(${canvasW * 0.06}, ${canvasH * 0.12})`">
        <rect x="0" y="-22" width="220" height="36" rx="4"
          fill="#faf6ec" stroke="#3d5a47" stroke-width="1" opacity="0.95" />
        <text x="14" y="-3" font-size="14" font-family="Noto Serif SC, serif" font-weight="700" fill="#3d5a47" letter-spacing="3">
          {{ district.name }}
        </text>
        <text x="14" y="10" font-size="9" font-family="Inter, sans-serif" fill="#7a6a4a" letter-spacing="1.2">
          {{ district.waters.join(' · ') }}
        </text>
      </g>

      <!-- 区中心简化水系(根据区名判断) -->
      <g class="district-waters">
        <text
          v-for="(w, i) in district.waters"
          :key="w"
          :x="canvasW * (0.25 + i * 0.25)"
          :y="canvasH * 0.42 + (i % 2) * 40"
          text-anchor="middle"
          font-family="Noto Serif SC, serif"
          font-style="italic"
          font-size="16"
          fill="#4a6d6a"
          opacity="0.55"
          letter-spacing="3"
        >{{ w }}</text>
      </g>

      <!-- 比例尺 -->
      <g class="scale-bar" :transform="`translate(${canvasW * 0.06}, ${canvasH * 0.92})`">
        <text x="0" y="-6" font-size="8" font-family="Inter, sans-serif" fill="#7a6a4a">比例尺 SCALE</text>
        <rect x="0" y="0" width="30" height="5" fill="#3d5a47" />
        <rect x="30" y="0" width="30" height="5" fill="#faf6ec" stroke="#3d5a47" stroke-width="0.4" />
        <rect x="60" y="0" width="30" height="5" fill="#3d5a47" />
        <text x="0" y="16" font-size="7" fill="#7a6a4a">0</text>
        <text x="60" y="16" font-size="7" fill="#7a6a4a">{{ scaleKm }} km</text>
      </g>

      <!-- 罗盘 -->
      <g class="compass" :transform="`translate(${canvasW - 50}, ${canvasH - 50})`">
        <circle r="26" fill="#faf6ec" opacity="0.85" stroke="#8a7550" stroke-width="0.8" />
        <path d="M 0 -22 L 3 0 L 0 22 L -3 0 Z" fill="#c8553d" opacity="0.7" />
        <path d="M 0 -22 L 3 0 L 0 0 Z" fill="#c8553d" />
        <text y="-26" text-anchor="middle" font-size="8" font-family="Noto Serif SC, serif" font-weight="700" fill="#c8553d">N</text>
      </g>

      <!-- 钓点标记 -->
      <g class="markers">
        <g
          v-for="spot in spots"
          :key="spot.id"
          :transform="`translate(${spotX(spot)}, ${spotY(spot)})`"
          class="marker"
          :class="{
            selected: selectedId === spot.id,
            hover: hoverId === spot.id
          }"
          @click="$emit('select', spot)"
          @mouseenter="hoverId = spot.id"
          @mouseleave="hoverId = null"
        >
          <circle r="16" class="marker-glow" :class="`glow-${spot.waterType}`" />
          <circle r="11" :fill="colorFor(spot.waterType)" stroke="#fff" stroke-width="2.5" />
          <circle r="4" fill="#fff" />
          <circle v-if="selectedId === spot.id" r="11" fill="none" stroke="#c8553d" stroke-width="2.5" class="pulse" />
          <g :transform="`translate(14, 4)`" class="marker-label">
            <rect x="0" y="-11" rx="3" :width="textWidth(spot.name) + 14" height="22"
              :fill="selectedId === spot.id ? '#2a3528' : '#faf6ec'"
              :stroke="selectedId === spot.id ? '#2a3528' : '#d8cfb8'"
              stroke-width="0.8" opacity="0.96" />
            <text x="7" y="4" font-size="11" font-weight="600"
              :fill="selectedId === spot.id ? '#f4ede0' : '#2a3528'"
              font-family="Inter, sans-serif">{{ spot.name }}</text>
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { districts } from '@/data/districts'

const props = defineProps({
  district: { type: Object, required: true },
  spots: { type: Array, default: () => [] },
  selectedId: String
})
defineEmits(['select'])

const hoverId = ref(null)
const canvasW = 900
const canvasH = 600
const padding = 0.12  // 区 bounds 外扩比例

const viewBox = computed(() => `0 0 ${canvasW} ${canvasH}`)

// 把经纬度 → 区局部画布坐标 (0-900, 0-600)
function lngToX(lng) {
  const { west, east } = props.district.bounds
  const span = east - west
  const paddedWest = west - span * padding
  const paddedEast = east + span * padding
  const xPct = (lng - paddedWest) / (paddedEast - paddedWest)
  return xPct * canvasW
}
function latToY(lat) {
  const { north, south } = props.district.bounds
  const span = north - south
  const paddedNorth = north + span * padding
  const paddedSouth = south - span * padding
  const yPct = (paddedNorth - lat) / (paddedNorth - paddedSouth)
  return yPct * canvasH
}

function spotX(spot) {
  return lngToX(spot.coords.lng)
}
function spotY(spot) {
  return latToY(spot.coords.lat)
}

// 当前区 path
const mainPath = computed(() => {
  return props.district.outline
    .map(([lng, lat], i) => `${i === 0 ? 'M' : 'L'} ${lngToX(lng).toFixed(1)} ${latToY(lat).toFixed(1)}`)
    .join(' ') + ' Z'
})

// 邻区(共享边界的区)
const neighborDistricts = computed(() => {
  // 简化:把 bounds 与当前区相交的区视为邻居
  const cur = props.district.bounds
  return districts
    .filter((d) => d.id !== props.district.id)
    .filter((d) => {
      // 边界重叠判断:经度/纬度范围有交集
      const lngOverlap = !(d.bounds.east < cur.west || d.bounds.west > cur.east)
      const latOverlap = !(d.bounds.south > cur.north || d.bounds.north < cur.south)
      return lngOverlap && latOverlap
    })
    .map((d) => ({
      ...d,
      dPath: d.outline
        .map(([lng, lat], i) => `${i === 0 ? 'M' : 'L'} ${lngToX(lng).toFixed(1)} ${latToY(lat).toFixed(1)}`)
        .join(' ') + ' Z',
      labelPos: {
        x: lngToX(d.center.lng),
        y: latToY(d.center.lat)
      }
    }))
})

const scaleKm = computed(() => {
  const { west, east } = props.district.bounds
  const lngSpan = east - west
  // 杭州纬度 lng 1 度 ≈ 100km
  const totalKm = lngSpan * 100
  // 选一个好看的 round 数
  if (totalKm < 8) return Math.round(totalKm * 2)
  if (totalKm < 25) return Math.round(totalKm / 2)
  return Math.round(totalKm / 4)
})

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
    w += /[\u4e00-\u9fff]/.test(c) ? 11 : 6
  }
  return w
}
</script>

<style scoped>
.district-map-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}
.district-map-svg {
  max-width: 100%;
  max-height: 100%;
  filter: drop-shadow(0 4px 16px rgba(42, 53, 40, 0.12));
}

.marker {
  cursor: pointer;
  transition: opacity 0.2s;
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
  0% { r: 11; opacity: 1; }
  100% { r: 28; opacity: 0; }
}

.marker-label {
  pointer-events: none;
}
</style>