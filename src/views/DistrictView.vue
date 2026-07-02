<template>
  <div class="district-view" v-if="district">
    <!-- 顶部区信息条 -->
    <header class="district-head">
      <nav class="breadcrumb">
        <router-link to="/" class="crumb-link">杭州</router-link>
        <span class="crumb-sep">/</span>
        <span class="crumb-current">{{ district.name }}</span>
      </nav>
      <div class="head-info">
        <p class="eyebrow">杭州 · {{ district.name }}</p>
        <h1>{{ district.name }}钓点</h1>
        <p class="muted">
          {{ districtSpots.length }} 处秘境 ·
          主要水域:{{ district.waters.join('、') }}
        </p>
      </div>
      <button class="btn btn-ghost back-btn" @click="$router.push('/')">← 返回全市</button>
    </header>

    <div class="district-body">
      <!-- 左侧钓点列表 -->
      <aside class="left-panel">
        <div class="panel-section">
          <p class="eyebrow">{{ district.name }}</p>
          <h2>{{ districtSpots.length }} 处钓点</h2>
        </div>

        <!-- 难度筛选 -->
        <div class="filter-row">
          <button
            v-for="t in difficulties"
            :key="t.value"
            class="chip chip-sm"
            :class="{ active: diffFilter === t.value }"
            @click="diffFilter = t.value"
          >{{ t.label }}</button>
        </div>

        <!-- 钓点列表(按水域类型分组) -->
        <div class="spot-list">
          <template v-for="group in groupedSpots" :key="group.type">
            <div v-if="group.spots.length" class="group">
              <h4 class="group-title">
                <span>{{ waterTypeEmoji[group.type] }}</span>
                <span>{{ waterTypeLabel[group.type] }}</span>
                <span class="group-count">{{ group.spots.length }}</span>
              </h4>
              <article
                v-for="spot in group.spots"
                :key="spot.id"
                class="spot-card"
                :class="{ selected: selectedId === spot.id }"
                @click="select(spot)"
                @mouseenter="hoverId = spot.id"
                @mouseleave="hoverId = null"
              >
                <div class="spot-cover">
                  <img :src="spot.cover" :alt="spot.name" loading="lazy" />
                </div>
                <div class="spot-body">
                  <h3>{{ spot.name }}</h3>
                  <div class="spot-meta">
                    <span class="rating">★ {{ spot.rating }}</span>
                    <span class="dot-sep">·</span>
                    <span>{{ difficultyLabel[spot.difficulty] }}</span>
                  </div>
                  <div class="fish-tags">
                    <span v-for="f in spot.fishSpecies.slice(0, 2)" :key="f" class="tag tag-moss">{{ f }}</span>
                  </div>
                </div>
              </article>
            </div>
          </template>

          <div v-if="districtSpots.length === 0" class="empty">
            <p class="empty-icon">📍</p>
            <p>该区暂无钓点</p>
            <router-link to="/add" class="btn btn-primary">添加第一处</router-link>
          </div>
        </div>
      </aside>

      <!-- 右侧地图 -->
      <section class="map-stage">
        <div class="map-toolbar">
          <div class="map-title">
            <p class="eyebrow">{{ district.name }}</p>
            <h2>{{ district.name }}水域秘境</h2>
          </div>
          <div class="legend">
            <span class="legend-item"><span class="dot-dot lake"></span>湖泊</span>
            <span class="legend-item"><span class="dot-dot river"></span>江河</span>
            <span class="legend-item"><span class="dot-dot reservoir"></span>水库</span>
            <span class="legend-item"><span class="dot-dot creek"></span>溪流</span>
          </div>
        </div>

        <div class="map-canvas">
          <DistrictMap
            :district="district"
            :spots="districtSpots"
            :selected-id="selectedId"
            :hover-id="hoverId"
            @select="select"
          />

          <!-- 选中钓点浮动卡 -->
          <transition name="popup">
            <div v-if="selected" class="spot-popup" :key="selected.id">
              <button class="close" @click="selectedId = null">×</button>
              <img :src="selected.cover" :alt="selected.name" class="popup-cover" />
              <div class="popup-body">
                <p class="eyebrow">{{ district.name }}</p>
                <h3>{{ selected.name }}</h3>
                <div class="popup-meta">
                  <span class="rating">★ {{ selected.rating }}</span>
                  <span class="tag tag-water">{{ waterTypeLabel[selected.waterType] }}</span>
                  <span class="tag tag-moss">{{ difficultyLabel[selected.difficulty] }}</span>
                </div>
                <p class="popup-notes">{{ truncate(selected.notes, 80) }}</p>
                <div class="popup-actions">
                  <router-link :to="`/spot/${selected.id}`" class="btn btn-primary">查看详情 →</router-link>
                  <button class="btn btn-ghost" @click="$router.push('/add')">📍 附近添加</button>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </section>
    </div>
  </div>

  <div v-else class="not-found">
    <p class="empty-icon">🗺️</p>
    <h2>没找到这个区</h2>
    <p class="muted">它可能改名了</p>
    <router-link to="/" class="btn btn-primary">回到全市地图</router-link>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DistrictMap from '@/components/DistrictMap.vue'
import { useSpots } from '@/stores/spots'
import { getDistrictById } from '@/data/districts'
import { waterTypeLabel, difficultyLabel, waterTypeEmoji } from '@/data/mock'

const route = useRoute()
const router = useRouter()
const { getSpotsByDistrict } = useSpots()

const district = computed(() => getDistrictById(route.params.id))
const districtSpots = computed(() =>
  district.value ? getSpotsByDistrict(district.value.id) : []
)

const selectedId = ref(null)
const hoverId = ref(null)
const diffFilter = ref('all')

const selected = computed(() =>
  selectedId.value ? districtSpots.value.find((s) => s.id === selectedId.value) : null
)

const difficulties = [
  { value: 'all', label: '全部' },
  { value: 'easy', label: '入门' },
  { value: 'medium', label: '进阶' },
  { value: 'hard', label: '硬核' }
]

// 按水域类型分组
const groupedSpots = computed(() => {
  const filtered = districtSpots.value.filter((s) =>
    diffFilter.value === 'all' || s.difficulty === diffFilter.value
  )
  const groups = { lake: [], river: [], reservoir: [], sea: [], creek: [] }
  filtered.forEach((s) => {
    if (groups[s.waterType]) groups[s.waterType].push(s)
  })
  return [
    { type: 'lake', spots: groups.lake },
    { type: 'river', spots: groups.river },
    { type: 'reservoir', spots: groups.reservoir },
    { type: 'creek', spots: groups.creek },
    { type: 'sea', spots: groups.sea }
  ]
})

function select(spot) {
  selectedId.value = spot.id
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n) + '…' : s
}
</script>

<style scoped>
.district-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.district-head {
  padding: 18px 32px;
  border-bottom: 1px solid var(--line-soft);
  background: var(--surface);
  display: flex;
  align-items: center;
  gap: 24px;
  position: relative;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  flex-shrink: 0;
}
.crumb-link {
  color: var(--moss);
  text-decoration: none;
  font-weight: 500;
}
.crumb-link:hover { text-decoration: underline; }
.crumb-sep { color: var(--ink-mute); }
.crumb-current {
  color: var(--ink);
  font-weight: 600;
}

.head-info {
  flex: 1;
}
.head-info h1 {
  font-size: 22px;
  margin: 4px 0 4px;
}
.head-info p { margin: 0; font-size: 12.5px; }

.back-btn {
  flex-shrink: 0;
}

.district-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.left-panel {
  width: 360px;
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--line-soft);
  display: flex;
  flex-direction: column;
}

.panel-section {
  padding: 22px 22px 14px;
  border-bottom: 1px solid var(--line-soft);
}
.panel-section h2 {
  font-size: 20px;
  margin: 4px 0 0;
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
  padding: 5px 12px;
  border-radius: 999px;
  background: var(--surface-2);
  font-size: 12px;
  color: var(--ink-soft);
  font-weight: 500;
  border: 1px solid transparent;
}
.chip:hover { background: var(--surface-3); }
.chip.active {
  background: var(--moss);
  color: #f4ede0;
}
.chip-sm { padding: 4px 10px; font-size: 11.5px; }

.spot-list {
  flex: 1;
  overflow-y: auto;
  padding: 14px 14px 24px;
}

.group {
  margin-bottom: 18px;
}
.group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--ink-soft);
  padding: 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-family: var(--font-sans);
}
.group-count {
  margin-left: auto;
  background: var(--surface-2);
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 11px;
  color: var(--ink-mute);
}

.spot-card {
  background: var(--surface);
  border: 1px solid var(--line-soft);
  border-radius: var(--r-md);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.18s;
  margin-bottom: 8px;
}
.spot-card:hover {
  transform: translateX(2px);
  box-shadow: var(--shadow-sm);
  border-color: var(--moss-soft);
}
.spot-card.selected {
  border-color: var(--moss);
  background: linear-gradient(90deg, rgba(61, 90, 71, 0.04), var(--surface));
}

.spot-cover {
  height: 110px;
  overflow: hidden;
  background: var(--surface-2);
}
.spot-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.spot-body {
  padding: 10px 14px 12px;
}
.spot-body h3 {
  font-family: var(--font-serif);
  font-size: 14px;
  margin: 0 0 6px;
  line-height: 1.3;
}
.spot-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: var(--ink-soft);
  margin-bottom: 6px;
}
.rating {
  color: var(--ember);
  font-weight: 600;
}
.dot-sep { color: var(--line); }
.fish-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--ink-mute);
}
.empty-icon {
  font-size: 32px;
  margin: 0 0 12px;
}

/* 地图舞台 */
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
}
.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--ink-soft);
}
.dot-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.dot-dot.lake { background: var(--water); }
.dot-dot.river { background: var(--water-deep); }
.dot-dot.reservoir { background: #5a8a8e; }
.dot-dot.creek { background: #7eaab5; }

.map-canvas {
  flex: 1;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse at top, #ece1c5 0%, #d9c89c 100%);
}

.spot-popup {
  position: absolute;
  right: 24px;
  top: 24px;
  width: 320px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 10;
}
.close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  font-size: 18px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink);
  z-index: 2;
}
.close:hover { background: var(--surface-2); }
.popup-cover {
  width: 100%;
  height: 140px;
  object-fit: cover;
}
.popup-body { padding: 14px 16px 16px; }
.popup-body h3 {
  font-size: 17px;
  margin: 4px 0 8px;
}
.popup-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}
.popup-notes {
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 1.55;
  margin: 0 0 14px;
}
.popup-actions {
  display: flex;
  gap: 8px;
}
.popup-actions .btn {
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

.not-found {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
}
.not-found .empty-icon {
  font-size: 48px;
  margin: 0 0 16px;
}
.not-found h2 { margin: 0 0 8px; }
.not-found p { margin: 0 0 24px; }
</style>