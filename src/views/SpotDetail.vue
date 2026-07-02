<template>
  <div class="spot-detail" v-if="spot">
    <div class="hero">
      <img :src="spot.cover" :alt="spot.name" class="hero-bg" />
      <div class="hero-overlay"></div>
      <button class="back-btn" @click="goBack">← 返回地图</button>
      <div class="hero-content">
        <div class="hero-tags">
          <span class="tag tag-water">{{ waterTypeLabel[spot.waterType] }}</span>
          <span class="tag tag-moss">{{ difficultyLabel[spot.difficulty] }}</span>
          <span v-if="spot.featured" class="tag tag-ember">⭐ 精选</span>
        </div>
        <h1>{{ spot.name }}</h1>
        <p class="hero-region">{{ spot.region }}</p>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-num">★ {{ spot.rating }}</span>
            <span class="stat-label">综合评分</span>
          </div>
          <div class="stat-sep"></div>
          <div class="stat">
            <span class="stat-num">{{ spot.visits }}</span>
            <span class="stat-label">到访次数</span>
          </div>
          <div class="stat-sep"></div>
          <div class="stat">
            <span class="stat-num">{{ spot.likes }}</span>
            <span class="stat-label">收藏</span>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-body">
      <div class="detail-main">
        <section class="section">
          <p class="eyebrow">笔记</p>
          <h2 class="section-title">关于这里</h2>
          <p class="notes-text">{{ spot.notes }}</p>
        </section>

        <section class="section">
          <p class="eyebrow">实景</p>
          <h2 class="section-title">现场照片</h2>
          <div class="photo-gallery">
            <img v-for="(p, i) in spot.photos" :key="i" :src="p" :alt="`照片 ${i+1}`" class="gallery-img" />
          </div>
        </section>

        <section class="section">
          <p class="eyebrow">鱼种</p>
          <h2 class="section-title">这里的鱼</h2>
          <div class="fish-grid">
            <div v-for="f in spot.fishSpecies" :key="f" class="fish-card">
              <span class="fish-emoji">🐟</span>
              <div>
                <h4>{{ f }}</h4>
                <p class="muted">常见,中等密度</p>
              </div>
            </div>
          </div>
        </section>

        <section class="section">
          <p class="eyebrow">攻略</p>
          <h2 class="section-title">最佳时间</h2>
          <div class="info-grid">
            <div class="info-card">
              <span class="info-icon">🌸</span>
              <p class="eyebrow">季节</p>
              <p class="info-value">{{ spot.bestSeason }}</p>
            </div>
            <div class="info-card">
              <span class="info-icon">⏰</span>
              <p class="eyebrow">时段</p>
              <p class="info-value">{{ spot.bestTime }}</p>
            </div>
            <div class="info-card">
              <span class="info-icon">📍</span>
              <p class="eyebrow">坐标</p>
              <p class="info-value">{{ spot.coords.lat.toFixed(2) }}N · {{ spot.coords.lng.toFixed(2) }}E</p>
            </div>
          </div>
        </section>

        <section class="section">
          <div class="cta-row">
            <button class="btn btn-ember" @click="like">
              {{ liked ? '★ 已收藏' : '☆ 收藏钓点' }}
            </button>
            <button class="btn btn-ghost" @click="share">↗ 分享</button>
            <button class="btn btn-ghost" @click="goAdd">📍 添加附近的钓点</button>
          </div>
        </section>
      </div>

      <aside class="detail-aside">
        <div class="author-card card">
          <p class="eyebrow">记录者</p>
          <div class="author-row">
            <div class="author-avatar">{{ spot.author.avatar }}</div>
            <div>
              <h4>{{ spot.author.name }}</h4>
              <p class="muted">{{ spot.createdAt }} 发布</p>
            </div>
          </div>
        </div>

        <div class="nearby card">
          <p class="eyebrow">附近钓点</p>
          <h4>同区域推荐</h4>
          <div class="nearby-list">
            <router-link
              v-for="n in nearby"
              :key="n.id"
              :to="`/spot/${n.id}`"
              class="nearby-item"
            >
              <img :src="n.cover" :alt="n.name" />
              <div>
                <p class="nearby-name">{{ n.name }}</p>
                <p class="nearby-region muted">{{ n.region }}</p>
                <p class="rating">★ {{ n.rating }}</p>
              </div>
            </router-link>
            <p v-if="nearby.length === 0" class="muted" style="font-size:12px;padding:8px 0;">附近暂无其他钓点</p>
          </div>
        </div>

        <div class="back-map card">
          <router-link to="/" class="back-link">
            <span>🗺️</span>
            <div>
              <h4>在地图上看</h4>
              <p class="muted">返回探秘地图</p>
            </div>
          </router-link>
        </div>
      </aside>
    </div>
  </div>

  <div v-else class="not-found">
    <p class="empty-icon">🎣</p>
    <h2>没找到这个钓点</h2>
    <p class="muted">它可能已经被删除了</p>
    <router-link to="/" class="btn btn-primary">回到地图</router-link>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSpots } from '@/stores/spots'
import { waterTypeLabel, difficultyLabel } from '@/data/mock'

const route = useRoute()
const router = useRouter()
const { state, getById, toggleLike, isLiked } = useSpots()

const spot = computed(() => getById(route.params.id))
const liked = computed(() => (spot.value ? isLiked(spot.value.id) : false))

const nearby = computed(() => {
  if (!spot.value) return []
  return state.spots
    .filter((s) => s.id !== spot.value.id && s.region.split('·')[0] === spot.value.region.split('·')[0])
    .slice(0, 3)
})

function goBack() {
  router.back()
}

function goAdd() {
  router.push('/add')
}

function like() {
  if (spot.value) toggleLike(spot.value.id)
}

function share() {
  alert('分享链接已复制到剪贴板(模拟)\n\n钓点探秘 · ' + spot.value.name)
}
</script>

<style scoped>
.spot-detail {
  height: 100%;
  overflow-y: auto;
}

/* Hero */
.hero {
  position: relative;
  height: 360px;
  overflow: hidden;
}
.hero-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.7);
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(42, 53, 40, 0.2) 0%, rgba(42, 53, 40, 0.85) 100%);
}
.back-btn {
  position: absolute;
  top: 22px;
  left: 28px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: var(--r-md);
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
  box-shadow: var(--shadow-sm);
  z-index: 2;
}
.back-btn:hover {
  background: #fff;
  transform: translateX(-2px);
}
.hero-content {
  position: absolute;
  bottom: 32px;
  left: 32px;
  right: 32px;
  color: #f4ede0;
  z-index: 2;
}
.hero-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.hero-tags .tag {
  background: rgba(255, 255, 255, 0.18);
  color: #f4ede0;
  backdrop-filter: blur(8px);
}
.hero-tags .tag-moss { background: rgba(123, 160, 152, 0.6); }
.hero-tags .tag-water { background: rgba(74, 109, 106, 0.6); }
.hero-tags .tag-ember { background: rgba(200, 85, 61, 0.7); }
.hero-content h1 {
  font-size: 38px;
  color: #faf6ec;
  margin: 0 0 6px;
  letter-spacing: 0.01em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
.hero-region {
  margin: 0 0 18px;
  font-size: 14px;
  opacity: 0.9;
}
.hero-stats {
  display: flex;
  align-items: center;
  gap: 24px;
}
.stat {
  display: flex;
  flex-direction: column;
}
.stat-num {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 700;
  color: #faf6ec;
}
.stat-label {
  font-size: 12px;
  opacity: 0.75;
  margin-top: 2px;
}
.stat-sep {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.25);
}

/* Body */
.detail-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 32px 60px;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 40px;
}

.section {
  margin-bottom: 40px;
}
.section-title {
  font-size: 22px;
  margin: 4px 0 16px;
}
.notes-text {
  font-size: 15px;
  line-height: 1.75;
  color: var(--ink-soft);
  margin: 0;
  white-space: pre-wrap;
  font-family: var(--font-serif);
}

.photo-gallery {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 10px;
  height: 320px;
}
.gallery-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--r-md);
  background: var(--surface-2);
}
.gallery-img:first-child {
  grid-row: span 1;
}

.fish-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
.fish-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--surface);
  border: 1px solid var(--line-soft);
  border-radius: var(--r-md);
  transition: all 0.15s;
}
.fish-card:hover {
  border-color: var(--moss-soft);
  transform: translateY(-1px);
}
.fish-emoji {
  font-size: 26px;
}
.fish-card h4 {
  font-size: 14px;
  margin: 0 0 2px;
  font-family: var(--font-sans);
  font-weight: 600;
}
.fish-card p {
  margin: 0;
  font-size: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.info-card {
  background: var(--surface);
  border: 1px solid var(--line-soft);
  border-radius: var(--r-md);
  padding: 16px;
  text-align: left;
}
.info-icon {
  font-size: 24px;
  display: block;
  margin-bottom: 8px;
}
.info-value {
  font-family: var(--font-serif);
  font-size: 16px;
  margin: 4px 0 0;
  color: var(--ink);
}

.cta-row {
  display: flex;
  gap: 10px;
  padding: 20px;
  background: linear-gradient(135deg, var(--surface), var(--surface-2));
  border-radius: var(--r-lg);
  border: 1px solid var(--line-soft);
}

/* Aside */
.detail-aside {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.author-card,
.nearby,
.back-map {
  padding: 16px 18px;
  border-radius: var(--r-lg);
}
.author-card .eyebrow,
.nearby .eyebrow {
  margin-bottom: 10px;
}
.author-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
}
.author-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}
.author-row h4 {
  font-size: 14px;
  margin: 0 0 2px;
  font-family: var(--font-sans);
  font-weight: 600;
}
.author-row p {
  margin: 0;
  font-size: 12px;
}

.nearby h4 {
  font-size: 15px;
  margin: 0 0 12px;
}
.nearby-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.nearby-item {
  display: flex;
  gap: 10px;
  text-decoration: none;
  color: var(--ink);
  padding: 8px;
  border-radius: var(--r-sm);
  transition: background 0.15s;
}
.nearby-item:hover {
  background: var(--surface-2);
}
.nearby-item img {
  width: 56px;
  height: 56px;
  border-radius: var(--r-sm);
  object-fit: cover;
  flex-shrink: 0;
}
.nearby-name {
  font-size: 13.5px;
  font-weight: 600;
  margin: 0 0 2px;
  font-family: var(--font-serif);
}
.nearby-region {
  font-size: 11.5px;
  margin: 0 0 4px;
}
.nearby-item .rating {
  font-size: 11.5px;
  margin: 0;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--ink);
}
.back-link span:first-child {
  font-size: 22px;
}
.back-link h4 {
  font-size: 14px;
  margin: 0 0 2px;
  font-family: var(--font-sans);
  font-weight: 600;
}
.back-link p {
  margin: 0;
  font-size: 12px;
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
.not-found h2 {
  margin: 0 0 8px;
}
.not-found p {
  margin: 0 0 24px;
}
</style>