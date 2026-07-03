<template>
  <div class="map-view">
    <!-- 左侧区列表 -->
    <aside class="left-panel">
      <div class="panel-header">
        <p class="eyebrow">杭州各区</p>
        <h2>{{ districts.length }} 区 · {{ stats.spotCount }} 处秘境</h2>
        <p class="muted">{{ hasDataCount }} 个区有钓点 · 点地图气泡或列表项进入</p>
      </div>

      <!-- 难度筛选 -->
      <div class="filter-row">
        <button
          v-for="t in difficulties"
          :key="t.value"
          class="chip chip-sm"
          :class="{ active: state.filter.difficulty === t.value }"
          @click="setFilter({ difficulty: t.value })"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- 目标鱼筛选(多选) -->
      <div class="filter-row filter-row-fish">
        <button
          class="chip chip-sm"
          :class="{ active: state.filter.targetFish.length === 0 }"
          @click="setFilter({ targetFish: [] })"
        >不限鱼种</button>
        <button
          v-for="f in featuredFish"
          :key="f"
          class="chip chip-sm"
          :class="{ active: state.filter.targetFish.includes(f) }"
          @click="toggleFish(f)"
        >{{ f }}</button>
      </div>

      <!-- 区列表 -->
      <div class="district-list">
        <article
          v-for="d in sortedDistricts"
          :key="d.id"
          class="district-card"
          :class="{ empty: !hasSpot(d.id), active: hoverId === d.id }"
          @click="goDistrict(d)"
          @mouseenter="hoverId = d.id"
          @mouseleave="hoverId = null"
        >
          <div class="district-icon" :style="{ background: d.fillColor }">
            <span v-if="hasSpot(d.id)" class="dist-count">{{ spotCounts[d.id] || 0 }}</span>
            <span v-else class="dist-empty">·</span>
          </div>
          <div class="district-body">
            <div class="district-name-row">
              <h3>{{ d.name }}</h3>
              <span v-if="hasSpot(d.id)" class="dot-dot moss"></span>
            </div>
            <p class="district-waters muted">
              <span v-for="(w, i) in d.waters.slice(0, 2)" :key="w">
                {{ w }}<span v-if="i < Math.min(d.waters.length, 2) - 1"> · </span>
              </span>
            </p>
            <p v-if="hasSpot(d.id)" class="district-meta">
              <span v-if="difficultyBreakdown(d.id).hard" class="meta-hard">★ {{ difficultyBreakdown(d.id).hard }} 硬核</span>
              <span v-if="difficultyBreakdown(d.id).medium" class="meta-medium">● {{ difficultyBreakdown(d.id).medium }} 进阶</span>
              <span v-if="difficultyBreakdown(d.id).easy" class="meta-easy">○ {{ difficultyBreakdown(d.id).easy }} 入门</span>
            </p>
          </div>
        </article>
      </div>
    </aside>

    <!-- 右侧地图 -->
    <section class="map-stage">
      <div class="map-toolbar">
        <div class="map-title">
          <p class="eyebrow">探秘地图</p>
          <h2>杭州各区钓点分布</h2>
        </div>
        <div class="legend">
          <span class="legend-item"><span class="dot-dot has-data"></span>有钓点</span>
          <span class="legend-item"><span class="dot-dot no-data"></span>暂无</span>
          <span class="legend-hint">点击气泡 / 区名进入</span>
        </div>
      </div>

      <div class="map-canvas">
        <CityMap
          :spot-counts="spotCounts"
          :selected-id="hoverId"
          @select-district="goDistrict"
        />

        <!-- 悬停区信息卡 -->
        <transition name="popup">
          <div v-if="hoveredDistrict" class="info-card" :key="hoveredDistrict.id">
            <button class="close" @click="hoverId = null">×</button>
            <p class="eyebrow">杭州 · {{ hoveredDistrict.name }}</p>
            <h3>{{ hoveredDistrict.name }}</h3>
            <div class="info-stats">
              <div class="info-stat">
                <span class="info-val">{{ spotCounts[hoveredDistrict.id] || 0 }}</span>
                <span class="info-label">钓点</span>
              </div>
              <div class="info-stat">
                <span class="info-val">{{ visitedCount(hoveredDistrict.id) }}</span>
                <span class="info-label">累计到访</span>
              </div>
              <div class="info-stat">
                <span class="info-val">{{ hoveredDistrict.waters.length }}</span>
                <span class="info-label">主要水域</span>
              </div>
            </div>
            <div class="info-waters">
              <span v-for="w in hoveredDistrict.waters" :key="w" class="tag tag-water">{{ w }}</span>
            </div>
            <div class="info-actions">
              <router-link :to="`/district/${hoveredDistrict.id}`" class="btn btn-primary">进入该区 →</router-link>
              <button class="btn btn-ghost" @click="$router.push('/add')">📍 添加</button>
            </div>
          </div>
        </transition>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import CityMap from '@/components/CityMap.vue'
import { useSpots } from '@/stores/spots'
import { districts } from '@/data/districts'

const router = useRouter()
const { state, stats, filteredSpots, setFilter } = useSpots()
const hoverId = ref(null)

// 精选鱼种(按热度+代表性挑选,展示前 8 个)
const featuredFish = ['马口', '溪石斑', '鲫鱼', '鲤鱼', '翘嘴', '鳜鱼', '草鱼', '鲢鳙']

function toggleFish(fish) {
  const cur = state.filter.targetFish
  const next = cur.includes(fish)
    ? cur.filter((f) => f !== fish)
    : [...cur, fish]
  setFilter({ targetFish: next })
}

// 基于 filteredSpots 重新统计各区数量(随鱼种/难度筛选变化)
const spotCounts = computed(() => {
  const counts = {}
  filteredSpots.value.forEach((s) => {
    if (s.districtId) {
      counts[s.districtId] = (counts[s.districtId] || 0) + 1
    }
  })
  return counts
})

function hasSpot(districtId) {
  return (spotCounts.value[districtId] || 0) > 0
}

const hasDataCount = computed(() =>
  districts.filter((d) => hasSpot(d.id)).length
)

// 区按"是否有数据 → 数量 → 名称"排序
const sortedDistricts = computed(() => {
  return [...districts].sort((a, b) => {
    const aHas = hasSpot(a.id) ? 1 : 0
    const bHas = hasSpot(b.id) ? 1 : 0
    if (aHas !== bHas) return bHas - aHas
    const ca = spotCounts.value[a.id] || 0
    const cb = spotCounts.value[b.id] || 0
    if (ca !== cb) return cb - ca
    return a.name.localeCompare(b.name)
  })
})

const hoveredDistrict = computed(() =>
  hoverId.value ? districts.find((d) => d.id === hoverId.value) : null
)

function difficultyBreakdown(districtId) {
  const spots = state.spots.filter((s) => s.districtId === districtId)
  return {
    easy: spots.filter((s) => s.difficulty === 'easy').length,
    medium: spots.filter((s) => s.difficulty === 'medium').length,
    hard: spots.filter((s) => s.difficulty === 'hard').length
  }
}

function visitedCount(districtId) {
  return state.spots
    .filter((s) => s.districtId === districtId)
    .reduce((sum, s) => sum + (s.visits || 0), 0)
}

function goDistrict(d) {
  if (!hasSpot(d.id)) return
  router.push(`/district/${d.id}`)
}

const difficulties = [
  { value: 'all', label: '难度不限' },
  { value: 'easy', label: '入门' },
  { value: 'medium', label: '进阶' },
  { value: 'hard', label: '硬核' }
]
</script>

<style scoped>
.map-view {
  display: flex;
  height: 100%;
  gap: 0;
}

.left-panel {
  width: 360px;
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--line-soft);
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 24px 22px 16px;
  border-bottom: 1px solid var(--line-soft);
}
.panel-header h2 {
  font-size: 22px;
  margin: 4px 0 4px;
  font-family: var(--font-serif);
}
.panel-header p {
  margin: 0;
  font-size: 12px;
}

.filter-row {
  display: flex;
  gap: 6px;
  padding: 12px 18px;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--line-soft);
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--surface-2);
  font-size: 12.5px;
  color: var(--ink-soft);
  font-weight: 500;
  border: 1px solid transparent;
  transition: all 0.15s;
}
.chip:hover { background: var(--surface-3); }
.chip.active {
  background: var(--moss);
  color: #f4ede0;
  border-color: var(--moss-deep);
}
.chip-sm {
  padding: 4px 10px;
  font-size: 11.5px;
}

.district-list {
  flex: 1;
  overflow-y: auto;
  padding: 14px 14px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.district-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--surface);
  border: 1px solid var(--line-soft);
  border-radius: var(--r-md);
  cursor: pointer;
  transition: all 0.18s;
}
.district-card:hover {
  transform: translateX(2px);
  box-shadow: var(--shadow-sm);
  border-color: var(--moss-soft);
}
.district-card.active {
  border-color: var(--moss);
  background: linear-gradient(90deg, rgba(61, 90, 71, 0.04), var(--surface));
}
.district-card.empty {
  opacity: 0.55;
}
.district-card.empty:hover {
  opacity: 0.7;
}

.district-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--r-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  border: 1.5px solid rgba(255, 255, 255, 0.5);
  box-shadow: var(--shadow-sm);
}
.dist-count {
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: 18px;
  color: var(--ink);
}
.dist-empty {
  font-size: 22px;
  color: var(--ink-mute);
}

.district-body {
  flex: 1;
  min-width: 0;
}
.district-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}
.district-body h3 {
  font-family: var(--font-serif);
  font-size: 15px;
  margin: 0;
}
.dot-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.dot-dot.moss { background: var(--moss); }
.dot-dot.has-data { background: var(--moss); }
.dot-dot.no-data { background: var(--ink-mute); opacity: 0.4; }

.district-waters {
  font-size: 11.5px;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.district-meta {
  display: flex;
  gap: 10px;
  font-size: 11px;
  margin: 0;
  color: var(--ink-mute);
}
.meta-hard { color: var(--ember); font-weight: 600; }
.meta-medium { color: var(--moss); }
.meta-easy { color: var(--ink-mute); }

/* ===== 地图舞台 ===== */
.map-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.map-toolbar {
  padding: 18px 28px 14px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  border-bottom: 1px solid var(--line-soft);
}
.map-title h2 {
  font-size: 22px;
  margin: 4px 0 0;
}
.legend {
  display: flex;
  gap: 14px;
  align-items: center;
}
.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--ink-soft);
}
.legend-hint {
  font-size: 11.5px;
  color: var(--ink-mute);
  padding-left: 8px;
  border-left: 1px solid var(--line);
}

.map-canvas {
  flex: 1;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse at top, #ece1c5 0%, #d9c89c 100%);
}

.info-card {
  position: absolute;
  right: 24px;
  top: 24px;
  width: 320px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-lg);
  padding: 20px 22px;
  z-index: 10;
}
.close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--surface-2);
  font-size: 18px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink);
}
.close:hover { background: var(--surface-3); }

.info-card h3 {
  font-size: 22px;
  margin: 4px 0 16px;
}

.info-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 14px 0;
  border-top: 1px solid var(--line-soft);
  border-bottom: 1px solid var(--line-soft);
  margin-bottom: 14px;
}
.info-stat {
  text-align: center;
}
.info-val {
  display: block;
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 700;
  color: var(--moss-deep);
  line-height: 1;
}
.info-label {
  display: block;
  font-size: 11px;
  color: var(--ink-mute);
  margin-top: 4px;
}

.info-waters {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.info-actions {
  display: flex;
  gap: 8px;
}
.info-actions .btn {
  flex: 1;
  justify-content: center;
}

.popup-enter-active,
.popup-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.popup-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.popup-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>