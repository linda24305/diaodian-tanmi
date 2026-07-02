<template>
  <div class="city-map-wrap">
    <svg
      :viewBox="`0 0 ${CITY_VIEW.width} ${CITY_VIEW.height}`"
      :width="CITY_VIEW.width"
      :height="CITY_VIEW.height"
      class="city-map-svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id="paper" patternUnits="userSpaceOnUse" width="120" height="120">
          <rect width="120" height="120" fill="#ecdfb8" />
          <circle cx="20" cy="30" r="0.6" fill="#a89878" opacity="0.35" />
          <circle cx="80" cy="90" r="0.5" fill="#a89878" opacity="0.3" />
          <circle cx="50" cy="65" r="0.4" fill="#a89878" opacity="0.45" />
        </pattern>
        <radialGradient id="bubbleGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#5a8a6a" />
          <stop offset="60%" stop-color="#3d5a47" />
          <stop offset="100%" stop-color="#2a3e32" />
        </radialGradient>
      </defs>

      <!-- 纸张底 -->
      <rect width="100%" height="100%" fill="url(#paper)" />

      <!-- 杭州陆地底色 -->
      <g class="land-bg">
        <rect
          :x="CITY_VIEW.mapLeft"
          :y="CITY_VIEW.mapTop"
          :width="CITY_VIEW.mapRight - CITY_VIEW.mapLeft"
          :height="CITY_VIEW.mapBottom - CITY_VIEW.mapTop"
          rx="14"
          fill="#d4c08a"
          opacity="0.45"
        />
      </g>

      <!-- 行政区划 -->
      <g class="districts">
        <path
          v-for="d in districts"
          :key="d.id"
          :d="outlineToPath(d.outline)"
          :fill="hasSpot(d.id) ? d.fillColor : '#cfc4a4'"
          :fill-opacity="hasSpot(d.id) ? 0.6 : 0.35"
          stroke="#7a6a4a"
          stroke-width="1"
          stroke-linejoin="round"
        />
      </g>

      <!-- 区名标注(无数据的区) -->
      <g class="district-labels-empty" fill="#8a7550" font-family="Noto Serif SC, serif" font-size="11" opacity="0.55" text-anchor="middle">
        <text
          v-for="d in districts.filter((x) => !hasSpot(x.id))"
          :key="`el-${d.id}`"
          :x="lngToX(d.center.lng)"
          :y="latToY(d.center.lat)"
        >
          {{ d.short }}
        </text>
      </g>

      <!-- 装饰水系(杭州主要水域简笔) -->
      <g class="water-decor" opacity="0.45">
        <!-- 千岛湖(在淳安中心) -->
        <path
          :d="`M ${lngToX(118.85)} ${latToY(29.65)} Q ${lngToX(118.95)} ${latToY(29.55)} ${lngToX(119.10)} ${latToY(29.55)} Q ${lngToX(119.20)} ${latToY(29.60)} ${lngToX(119.18)} ${latToY(29.75)} Q ${lngToX(119.05)} ${latToY(29.85)} ${lngToX(118.90)} ${latToY(29.78)} Z`"
          fill="#a8c4be" stroke="#4a6d6a" stroke-width="0.7"
        />
        <!-- 富春江(富阳段) -->
        <path
          :d="`M ${lngToX(119.40)} ${latToY(29.95)} Q ${lngToX(119.70)} ${latToY(29.88)} ${lngToX(120.00)} ${latToY(29.82)} Q ${lngToX(120.10)} ${latToY(29.78)}`"
          stroke="#7ba098" stroke-width="3" fill="none" stroke-linecap="round"
        />
        <!-- 钱塘江(主城段) -->
        <path
          :d="`M ${lngToX(120.10)} ${latToY(29.78)} Q ${lngToX(120.18)} ${latToY(29.90)} ${lngToX(120.15)} ${latToY(30.05)} Q ${lngToX(120.12)} ${latToY(30.18)} ${lngToX(120.18)} ${latToY(30.30)} Q ${lngToX(120.25)} ${latToY(30.32)} ${lngToX(120.35)} ${latToY(30.28)} Q ${lngToX(120.45)} ${latToY(30.20)} ${lngToX(120.55)} ${latToY(30.15)}`"
          stroke="#7ba098" stroke-width="4" fill="none" stroke-linecap="round"
        />
        <!-- 西湖 -->
        <path
          :d="`M ${lngToX(119.98)} ${latToY(30.22)} Q ${lngToX(120.04)} ${latToY(30.20)} ${lngToX(120.07)} ${latToY(30.24)} Q ${lngToX(120.05)} ${latToY(30.28)} ${lngToX(119.98)} ${latToY(30.27)} Z`"
          fill="#a8c4be" stroke="#4a6d6a" stroke-width="0.7"
        />
        <!-- 青山湖 -->
        <path
          :d="`M ${lngToX(119.62)} ${latToY(30.25)} Q ${lngToX(119.68)} ${latToY(30.22)} ${lngToX(119.73)} ${latToY(30.27)} Q ${lngToX(119.71)} ${latToY(30.30)} ${lngToX(119.65)} ${latToY(30.29)} Z`"
          fill="#a8c4be" stroke="#4a6d6a" stroke-width="0.7"
        />
        <!-- 运河 -->
        <path
          :d="`M ${lngToX(120.05)} ${latToY(30.32)} L ${lngToX(120.20)} ${latToY(30.34)} L ${lngToX(120.30)} ${latToY(30.36)}`"
          stroke="#7ba098" stroke-width="2" fill="none" stroke-linecap="round"
        />
      </g>

      <!-- 主要水域文字 -->
      <g class="water-text" fill="#4a6d6a" font-family="Noto Serif SC, serif" opacity="0.55" font-style="italic">
        <text :x="lngToX(119.00)" :y="latToY(29.70)" text-anchor="middle" font-size="13" letter-spacing="4">千 岛 湖</text>
        <text :x="lngToX(120.30)" :y="latToY(30.10)" text-anchor="middle" font-size="12" letter-spacing="3">钱 塘 江</text>
        <text :x="lngToX(119.67)" :y="latToY(30.30)" text-anchor="middle" font-size="10" letter-spacing="2">青 山 湖</text>
        <text :x="lngToX(120.02)" :y="latToY(30.27)" text-anchor="middle" font-size="10">西湖</text>
      </g>

      <!-- 区级气泡(有数据的区) -->
      <g class="bubbles">
        <g
          v-for="d in districts.filter((x) => hasSpot(x.id))"
          :key="`b-${d.id}`"
          :transform="`translate(${lngToX(d.center.lng)}, ${latToY(d.center.lat)})`"
          class="bubble"
          :class="{ selected: selectedId === d.id, hover: hoverId === d.id }"
          @click="$emit('select-district', d)"
          @mouseenter="hoverId = d.id"
          @mouseleave="hoverId = null"
        >
          <!-- 光晕 -->
          <circle r="36" fill="#3d5a47" opacity="0.12" />
          <circle r="30" class="bubble-glow" />
          <!-- 主气泡 -->
          <circle r="26" fill="url(#bubbleGrad)" stroke="#faf6ec" stroke-width="2.5" />
          <!-- 内圈高光 -->
          <ellipse cx="-6" cy="-8" rx="10" ry="5" fill="#fff" opacity="0.25" />
          <!-- 数字 -->
          <text
            y="6"
            text-anchor="middle"
            font-family="Noto Serif SC, serif"
            font-weight="700"
            font-size="20"
            fill="#faf6ec"
          >{{ districtCount(d.id) }}</text>
          <!-- 区名标签(下方) -->
          <g :transform="`translate(0, 44)`">
            <rect x="-32" y="-12" width="64" height="22" rx="3"
              fill="#faf6ec" stroke="#3d5a47" stroke-width="1" opacity="0.96" />
            <text y="3" text-anchor="middle" font-size="11" font-weight="600"
              fill="#2a3528" font-family="Noto Serif SC, serif" letter-spacing="1">{{ d.short }}</text>
            <!-- 引线 -->
            <line x1="0" y1="-12" x2="0" y2="-26" stroke="#3d5a47" stroke-width="1" />
          </g>
        </g>
      </g>

      <!-- 装饰:地图角落徽记 -->
      <g class="cartouche" transform="translate(75, 75)">
        <rect x="-8" y="-28" width="220" height="48" rx="5"
          fill="#faf6ec" stroke="#8a7550" stroke-width="1" opacity="0.95" />
        <text x="0" y="-12" font-size="13" font-family="Noto Serif SC, serif" font-weight="700" fill="#3d5a47" letter-spacing="5">
          杭 州 各 区 钓 点
        </text>
        <text x="0" y="6" font-size="8" font-family="Inter, sans-serif" fill="#7a6a4a" letter-spacing="1.5">
          HANGZHOU · DISTRICTS · MMXXVI
        </text>
      </g>

      <!-- 罗盘 -->
      <g class="compass" transform="translate(1380, 700)">
        <circle r="32" fill="#faf6ec" opacity="0.85" stroke="#8a7550" stroke-width="0.8" />
        <circle r="26" fill="none" stroke="#a89878" stroke-width="0.4" stroke-dasharray="2 2" />
        <path d="M 0 -28 L 4 0 L 0 28 L -4 0 Z" fill="#c8553d" opacity="0.7" />
        <path d="M 0 -28 L 4 0 L 0 0 Z" fill="#c8553d" />
        <text y="-32" text-anchor="middle" font-size="9" font-family="Noto Serif SC, serif" font-weight="700" fill="#c8553d">N</text>
      </g>

      <!-- 比例尺 -->
      <g class="scale-bar" transform="translate(80, 740)">
        <text x="0" y="-6" font-size="8" font-family="Inter, sans-serif" fill="#7a6a4a">比例尺</text>
        <rect x="0" y="0" width="30" height="6" fill="#3d5a47" />
        <rect x="30" y="0" width="30" height="6" fill="#faf6ec" stroke="#3d5a47" stroke-width="0.5" />
        <rect x="60" y="0" width="30" height="6" fill="#3d5a47" />
        <text x="0" y="20" font-size="8" fill="#7a6a4a">0</text>
        <text x="60" y="20" font-size="8" fill="#7a6a4a">20 km</text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { districts, outlineToPath, lngToX, latToY, CITY_VIEW } from '@/data/districts'

const props = defineProps({
  spotCounts: { type: Object, default: () => ({}) },
  selectedId: String
})
defineEmits(['select-district'])

const hoverId = ref(null)

function districtCount(id) {
  return props.spotCounts[id] || 0
}

function hasSpot(id) {
  return (props.spotCounts[id] || 0) > 0
}
</script>

<style scoped>
.city-map-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}
.city-map-svg {
  max-width: 100%;
  max-height: 100%;
  filter: drop-shadow(0 4px 16px rgba(42, 53, 40, 0.12));
}

.bubble {
  cursor: pointer;
  transition: transform 0.2s;
}
.bubble:hover {
  transform: translate(var(--tx, 0), var(--ty, 0)) scale(1.06);
}
.bubble-glow {
  fill: #3d5a47;
  opacity: 0;
  transition: opacity 0.2s;
}
.bubble.hover .bubble-glow {
  opacity: 0.25;
}
.bubble.selected .bubble-glow {
  opacity: 0.4;
}
.bubble.selected circle:nth-child(2) {
  stroke: #c8553d;
  stroke-width: 3;
}
</style>