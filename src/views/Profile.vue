<template>
  <div class="profile">
    <!-- 头部卡片 -->
    <section class="hero-card card">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <div class="avatar-lg">🐟</div>
        <div class="hero-info">
          <p class="eyebrow">老周 · 资深探秘者</p>
          <h1>钓鱼佬的日志本</h1>
          <p class="muted">加入 138 天 · 探秘 {{ stats.spotCount }} 处钓点 · 累计 {{ stats.visitCount }} 次到访</p>
        </div>
        <div class="hero-actions">
          <button class="btn btn-primary" @click="$router.push('/add')">📍 新增钓点</button>
          <button class="btn btn-ghost" @click="confirmReset">⟲ 重置示例数据</button>
        </div>
      </div>
    </section>

    <!-- 数据面板 -->
    <section class="stats-grid">
      <div class="stat-card card">
        <p class="eyebrow">钓点收藏</p>
        <p class="stat-val">{{ mySpots.length }}</p>
        <p class="stat-sub">处</p>
      </div>
      <div class="stat-card card">
        <p class="eyebrow">鱼种记录</p>
        <p class="stat-val">{{ fishCount }}</p>
        <p class="stat-sub">种</p>
      </div>
      <div class="stat-card card">
        <p class="eyebrow">地区覆盖</p>
        <p class="stat-val">{{ stats.regionCount }}</p>
        <p class="stat-sub">省份</p>
      </div>
      <div class="stat-card card highlight">
        <p class="eyebrow">累计收藏</p>
        <p class="stat-val">{{ stats.likeCount }}</p>
        <p class="stat-sub">♥ 来自钓友</p>
      </div>
    </section>

    <!-- 标签切换 -->
    <nav class="tabs">
      <button
        v-for="t in tabs"
        :key="t.value"
        class="tab"
        :class="{ active: tab === t.value }"
        @click="tab = t.value"
      >
        {{ t.label }}
        <span class="tab-count">{{ t.count }}</span>
      </button>
    </nav>

    <!-- 我的钓点 -->
    <section v-if="tab === 'mine'" class="my-spots">
      <div class="grid">
        <article v-for="s in mySpots" :key="s.id" class="my-spot card" @click="goSpot(s.id)">
          <div class="my-cover">
            <img :src="s.cover" :alt="s.name" />
          </div>
          <div class="my-body">
            <h3>{{ s.name }}</h3>
            <p class="muted">{{ s.region }}</p>
            <div class="my-meta">
              <span class="rating">★ {{ s.rating }}</span>
              <span>{{ waterTypeLabel[s.waterType] }}</span>
            </div>
          </div>
        </article>

        <div v-if="mySpots.length === 0" class="empty card">
          <p class="empty-icon">📍</p>
          <p>还没有记录过钓点</p>
          <router-link to="/add" class="btn btn-primary">记录第一处</router-link>
        </div>
      </div>
    </section>

    <!-- 收藏的钓点 -->
    <section v-if="tab === 'liked'" class="my-spots">
      <div class="grid">
        <article v-for="s in likedSpots" :key="s.id" class="my-spot card" @click="goSpot(s.id)">
          <div class="my-cover">
            <img :src="s.cover" :alt="s.name" />
            <span class="cover-flag">♥</span>
          </div>
          <div class="my-body">
            <h3>{{ s.name }}</h3>
            <p class="muted">{{ s.region }}</p>
            <div class="my-meta">
              <span class="rating">★ {{ s.rating }}</span>
              <span>{{ waterTypeLabel[s.waterType] }}</span>
            </div>
          </div>
        </article>

        <div v-if="likedSpots.length === 0" class="empty card">
          <p class="empty-icon">★</p>
          <p>还没收藏过钓点</p>
          <p class="muted" style="font-size:12px;">在地图上点击标记,进入详情后点收藏</p>
        </div>
      </div>
    </section>

    <!-- 统计图表 -->
    <section v-if="tab === 'stats'" class="charts">
      <div class="chart-card card">
        <h3>水域分布</h3>
        <div class="bar-list">
          <div v-for="b in waterDist" :key="b.label" class="bar-row">
            <span class="bar-label">{{ b.label }}</span>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: b.pct + '%', background: b.color }"></div>
            </div>
            <span class="bar-num">{{ b.count }}</span>
          </div>
        </div>
      </div>

      <div class="chart-card card">
        <h3>季节活跃度</h3>
        <div class="season-grid">
          <div v-for="s in seasons" :key="s.label" class="season-item" :class="`s-${s.level}`">
            <span class="season-icon">{{ s.icon }}</span>
            <p class="season-label">{{ s.label }}</p>
            <p class="season-bar"><span :style="{ width: s.pct + '%' }"></span></p>
          </div>
        </div>
      </div>

      <div class="chart-card card trophy">
        <h3>🏆 我的成就</h3>
        <ul class="trophy-list">
          <li v-for="a in achievements" :key="a.title" :class="{ earned: a.earned }">
            <span class="trophy-icon">{{ a.icon }}</span>
            <div>
              <h4>{{ a.title }}</h4>
              <p class="muted">{{ a.desc }}</p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSpots } from '@/stores/spots'
import { waterTypeLabel } from '@/data/mock'

const router = useRouter()
const { state, stats, resetData } = useSpots()

const tab = ref('mine')

const mySpots = computed(() => state.spots.filter((s) => s.author.name === '我'))
const likedSpots = computed(() => state.spots.filter((s) => state.liked.includes(s.id)))

const fishCount = computed(() => {
  const set = new Set()
  state.spots.forEach((s) => s.fishSpecies.forEach((f) => set.add(f)))
  return set.size
})

const tabs = computed(() => [
  { value: 'mine', label: '我的钓点', count: mySpots.value.length },
  { value: 'liked', label: '收藏的', count: likedSpots.value.length },
  { value: 'stats', label: '统计', count: '' }
])

const waterDist = computed(() => {
  const colors = { lake: '#7ba098', river: '#4a6d6a', reservoir: '#5a8a8e', sea: '#3a6b8a' }
  const total = state.spots.length || 1
  const groups = {}
  state.spots.forEach((s) => {
    groups[s.waterType] = (groups[s.waterType] || 0) + 1
  })
  return Object.entries(groups).map(([k, v]) => ({
    label: waterTypeLabel[k] || k,
    count: v,
    pct: (v / total) * 100,
    color: colors[k]
  }))
})

const seasons = [
  { label: '春', icon: '🌱', pct: 75, level: 'high' },
  { label: '夏', icon: '☀️', pct: 95, level: 'peak' },
  { label: '秋', icon: '🍂', pct: 80, level: 'high' },
  { label: '冬', icon: '❄️', pct: 35, level: 'low' }
]

const achievements = computed(() => [
  { icon: '🌱', title: '初探者', desc: '记录第一处钓点', earned: state.spots.length >= 1 },
  { icon: '🗺️', title: '地图绘制者', desc: '记录 5 处以上钓点', earned: state.spots.length >= 5 },
  { icon: '🎣', title: '淡水专家', desc: '湖泊/江河/水库齐全', earned: ['lake', 'river', 'reservoir'].every((t) => state.spots.some((s) => s.waterType === t)) },
  { icon: '💦', title: '溪流客', desc: '解锁 3 处以上溪流钓点', earned: state.spots.filter((s) => s.waterType === 'creek').length >= 3 },
  { icon: '🏆', title: '资深钓友', desc: '到访次数破百', earned: stats.value.visitCount >= 100 },
  { icon: '🌊', title: '远征军', desc: '收藏近海钓点', earned: state.spots.some((s) => s.waterType === 'sea') }
])

function goSpot(id) {
  router.push(`/spot/${id}`)
}

function confirmReset() {
  if (confirm('将清空你添加的钓点和收藏,恢复到初始示例数据。继续?')) {
    resetData()
  }
}
</script>

<style scoped>
.profile {
  padding: 32px 36px 60px;
  max-width: 1280px;
  margin: 0 auto;
}

/* Hero */
.hero-card {
  position: relative;
  padding: 0;
  overflow: hidden;
  margin-bottom: 24px;
}
.hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 50%, rgba(61, 90, 71, 0.18), transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(200, 85, 61, 0.12), transparent 50%),
    linear-gradient(135deg, var(--surface-2), var(--surface-3));
  z-index: 0;
}
.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 28px 32px;
}
.avatar-lg {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--moss), var(--moss-deep));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38px;
  border: 4px solid var(--surface);
  box-shadow: var(--shadow-md);
  flex-shrink: 0;
}
.hero-info {
  flex: 1;
}
.hero-info h1 {
  font-size: 26px;
  margin: 4px 0 6px;
}
.hero-info p {
  margin: 0;
  font-size: 13px;
}
.hero-actions {
  display: flex;
  gap: 10px;
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 28px;
}
.stat-card {
  padding: 20px 22px;
}
.stat-card.highlight {
  background: linear-gradient(135deg, rgba(200, 85, 61, 0.08), var(--surface));
  border-color: rgba(200, 85, 61, 0.2);
}
.stat-val {
  font-family: var(--font-serif);
  font-size: 36px;
  font-weight: 700;
  margin: 8px 0 2px;
  color: var(--moss-deep);
  line-height: 1;
}
.stat-card.highlight .stat-val {
  color: var(--ember);
}
.stat-sub {
  font-size: 12px;
  color: var(--ink-mute);
  margin: 0;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 6px;
  border-bottom: 1px solid var(--line-soft);
  margin-bottom: 22px;
}
.tab {
  padding: 10px 18px;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--ink-mute);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.15s;
}
.tab:hover {
  color: var(--ink);
}
.tab.active {
  color: var(--moss-deep);
  border-bottom-color: var(--moss);
  font-weight: 600;
}
.tab-count {
  background: var(--surface-2);
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 11px;
}
.tab.active .tab-count {
  background: var(--moss);
  color: #f4ede0;
}

/* My spots */
.my-spots {
  margin-bottom: 32px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.my-spot {
  cursor: pointer;
  padding: 0;
  overflow: hidden;
}
.my-cover {
  position: relative;
  height: 150px;
  overflow: hidden;
}
.my-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}
.my-spot:hover .my-cover img {
  transform: scale(1.05);
}
.cover-flag {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--ember);
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}
.my-body {
  padding: 14px 16px 16px;
}
.my-body h3 {
  font-size: 15px;
  margin: 0 0 4px;
  font-family: var(--font-serif);
}
.my-body .muted {
  font-size: 12px;
  margin: 0 0 8px;
}
.my-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: var(--ink-soft);
}
.my-meta .rating {
  color: var(--ember);
  font-weight: 600;
}

.empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
}
.empty-icon {
  font-size: 36px;
  margin: 0 0 12px;
}

/* Charts */
.charts {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}
.chart-card {
  padding: 22px 24px;
}
.chart-card h3 {
  font-size: 16px;
  margin: 0 0 18px;
}
.chart-card.trophy {
  grid-row: span 2;
}

.bar-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.bar-row {
  display: grid;
  grid-template-columns: 60px 1fr 30px;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}
.bar-label {
  color: var(--ink-soft);
}
.bar-track {
  height: 8px;
  background: var(--surface-2);
  border-radius: 4px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s;
}
.bar-num {
  font-family: var(--font-serif);
  font-weight: 700;
  color: var(--moss-deep);
  text-align: right;
}

.season-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.season-item {
  text-align: center;
  padding: 14px 8px;
  border-radius: var(--r-md);
  background: var(--surface-2);
}
.season-icon {
  font-size: 28px;
  display: block;
}
.season-label {
  font-size: 13px;
  margin: 6px 0 8px;
  font-weight: 600;
}
.season-bar {
  height: 5px;
  background: var(--surface-3);
  border-radius: 3px;
  overflow: hidden;
  margin: 0;
}
.season-bar span {
  display: block;
  height: 100%;
  background: var(--moss-soft);
}
.season-item.s-peak .season-bar span { background: var(--ember); }
.season-item.s-low .season-bar span { background: var(--ink-mute); }

.trophy-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.trophy-list li {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  border-radius: var(--r-md);
  background: var(--surface-2);
  opacity: 0.4;
  transition: all 0.15s;
}
.trophy-list li.earned {
  opacity: 1;
  background: linear-gradient(90deg, rgba(200, 85, 61, 0.06), var(--surface));
  border-left: 3px solid var(--ember);
}
.trophy-icon {
  font-size: 26px;
}
.trophy-list h4 {
  font-size: 13.5px;
  margin: 0 0 2px;
  font-family: var(--font-sans);
  font-weight: 600;
}
.trophy-list p {
  margin: 0;
  font-size: 12px;
}
</style>