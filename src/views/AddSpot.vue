<template>
  <div class="add-spot">
    <div class="form-wrap">
      <header class="form-head">
        <p class="eyebrow">新发现</p>
        <h1>记录一处新钓点</h1>
        <p class="muted">把它留在地图上,留给下一次出发</p>
      </header>

      <form class="form" @submit.prevent="onSubmit">
        <!-- 基础信息 -->
        <section class="block">
          <h3 class="block-title"><span class="block-num">01</span> 基础信息</h3>

          <div class="field">
            <label>钓点名称 <span class="req">*</span></label>
            <input
              v-model="form.name"
              type="text"
              placeholder="例:千岛湖·汾口湾"
              maxlength="40"
              required
            />
            <p class="field-hint">{{ form.name.length }}/40</p>
          </div>

          <div class="row">
            <div class="field">
              <label>所在区域 <span class="req">*</span></label>
              <input
                v-model="form.region"
                type="text"
                placeholder="例:浙江 · 杭州"
                required
              />
            </div>
            <div class="field">
              <label>水域类型</label>
              <div class="radio-row">
                <label
                  v-for="t in waterTypes"
                  :key="t.value"
                  class="radio-card"
                  :class="{ active: form.waterType === t.value }"
                >
                  <input type="radio" v-model="form.waterType" :value="t.value" />
                  <span>{{ t.icon }}</span>
                  <span>{{ t.label }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="field">
            <label>难度</label>
            <div class="radio-row">
              <label
                v-for="d in difficulties"
                :key="d.value"
                class="radio-pill"
                :class="{ active: form.difficulty === d.value }"
              >
                <input type="radio" v-model="form.difficulty" :value="d.value" />
                <span>{{ d.label }}</span>
              </label>
            </div>
          </div>
        </section>

        <!-- 位置 -->
        <section class="block">
          <h3 class="block-title"><span class="block-num">02</span> 位置</h3>
          <p class="muted block-sub">点击下方地图选定位置(原型简化)</p>

          <div class="mini-map" @click="pickOnMap">
            <svg viewBox="0 0 1200 750" preserveAspectRatio="xMidYMid meet">
              <defs>
                <pattern id="paper2" patternUnits="userSpaceOnUse" width="120" height="120">
                  <rect width="120" height="120" fill="#ecdfb8" />
                </pattern>
                <radialGradient id="waterGrad2" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stop-color="#a8c4be" />
                  <stop offset="100%" stop-color="#7ba098" />
                </radialGradient>
                <linearGradient id="riverGrad2" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stop-color="#7ba098" />
                  <stop offset="100%" stop-color="#a8c4be" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#paper2)" />
              <rect x="50" y="40" width="1100" height="670" rx="14"
                fill="#d4c08a" opacity="0.4" />

              <!-- 千岛湖 -->
              <path
                d="M 240 360 Q 280 350 320 365 Q 360 380 400 380 Q 440 378 480 395
                   Q 510 410 530 440 Q 540 470 530 500 Q 510 520 480 525
                   Q 440 530 400 525 Q 360 520 320 510 Q 280 495 260 475
                   Q 245 450 240 420 Q 235 390 240 360 Z"
                fill="url(#waterGrad2)" stroke="#4a6d6a" stroke-width="1" opacity="0.85" />

              <!-- 江流主线 -->
              <path d="M 530 460 Q 620 480 800 525" stroke="url(#riverGrad2)"
                stroke-width="4" fill="none" stroke-linecap="round" opacity="0.9" />
              <path d="M 800 525 Q 900 510 985 470" stroke="url(#riverGrad2)"
                stroke-width="4.5" fill="none" stroke-linecap="round" opacity="0.9" />
              <path d="M 985 470 Q 1055 380 1150 260" stroke="url(#riverGrad2)"
                stroke-width="5" fill="none" stroke-linecap="round" opacity="0.9" />

              <!-- 西湖 -->
              <path
                d="M 920 100 Q 945 95 965 100 Q 985 105 990 120 Q 995 138 985 150
                   Q 970 160 945 158 Q 925 155 915 140 Q 910 122 920 100 Z"
                fill="url(#waterGrad2)" stroke="#4a6d6a" stroke-width="1" opacity="0.88" />

              <!-- 青山湖 -->
              <path
                d="M 720 120 Q 745 115 770 122 Q 790 130 795 148 Q 790 165 770 172
                   Q 745 178 725 168 Q 712 152 720 120 Z"
                fill="url(#waterGrad2)" stroke="#4a6d6a" stroke-width="0.9" opacity="0.85" />

              <!-- 运河 -->
              <path d="M 850 90 Q 1000 95 1140 105" stroke="url(#riverGrad2)"
                stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.7" />

              <!-- 水系文字 -->
              <g fill="#4a6d6a" font-family="Noto Serif SC, serif" opacity="0.7" font-style="italic">
                <text x="385" y="450" text-anchor="middle" font-size="14" letter-spacing="6">千 岛 湖</text>
                <text x="952" y="135" text-anchor="middle" font-size="11" letter-spacing="3">西 湖</text>
                <text x="1110" y="295" font-size="12" letter-spacing="3">钱 塘 江</text>
              </g>

              <!-- 选点 pin -->
              <g v-if="form.position" class="pin-set">
                <line :x1="50 + form.position.x * 11" y1="40"
                  :x2="50 + form.position.x * 11" y2="710"
                  stroke="#c8553d" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.6" />
                <line x1="50" :y1="40 + form.position.y * 6.7" x2="1150"
                  :y2="40 + form.position.y * 6.7"
                  stroke="#c8553d" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.6" />
                <g :transform="`translate(${50 + form.position.x * 11}, ${40 + form.position.y * 6.7})`">
                  <circle r="16" fill="#c8553d" opacity="0.22" />
                  <circle r="8" fill="#c8553d" stroke="#fff" stroke-width="2" />
                </g>
              </g>

              <text x="20" y="725" font-size="10" fill="#7a6a4a" opacity="0.6">点击地图选点 · 杭州范围内</text>
              <text x="1180" y="725" font-size="10" fill="#7a6a4a" opacity="0.6" text-anchor="end">118-120.5°E · 29-30.5°N</text>
            </svg>
          </div>

          <div class="row">
            <div class="field">
              <label>经度</label>
              <input v-model.number="form.coords.lng" type="number" step="0.0001" />
            </div>
            <div class="field">
              <label>纬度</label>
              <input v-model.number="form.coords.lat" type="number" step="0.0001" />
            </div>
          </div>
        </section>

        <!-- 鱼种 -->
        <section class="block">
          <h3 class="block-title"><span class="block-num">03</span> 鱼种与最佳时间</h3>

          <div class="field">
            <label>常见鱼种</label>
            <div class="chip-input">
              <span v-for="(f, idx) in form.fishSpecies" :key="idx" class="tag tag-moss chip-removable">
                {{ f }}
                <button type="button" @click="removeFish(idx)">×</button>
              </span>
              <input
                v-model="fishInput"
                type="text"
                placeholder="输入鱼种后回车添加"
                @keydown.enter.prevent="addFish"
              />
            </div>
          </div>

          <div class="row">
            <div class="field">
              <label>最佳季节</label>
              <input v-model="form.bestSeason" type="text" placeholder="例:春秋两季" />
            </div>
            <div class="field">
              <label>最佳时段</label>
              <input v-model="form.bestTime" type="text" placeholder="例:清晨 5-8 点" />
            </div>
          </div>

          <div class="field">
            <label>评分 <span class="muted">(0-5)</span></label>
            <div class="rating-input">
              <button
                v-for="n in 5"
                :key="n"
                type="button"
                class="star-btn"
                :class="{ on: form.rating >= n }"
                @click="form.rating = n"
              >★</button>
              <span class="rating-num">{{ form.rating.toFixed(1) }}</span>
            </div>
          </div>
        </section>

        <!-- 笔记与封面 -->
        <section class="block">
          <h3 class="block-title"><span class="block-num">04</span> 笔记与封面</h3>

          <div class="field">
            <label>封面图 URL <span class="muted">(可选)</span></label>
            <input v-model="form.cover" type="url" placeholder="https://..." />
            <div class="cover-preview" v-if="form.cover">
              <img :src="form.cover" alt="封面预览" />
            </div>
          </div>

          <div class="field">
            <label>详细笔记 <span class="req">*</span></label>
            <textarea
              v-model="form.notes"
              rows="6"
              placeholder="把这里的水情、饵料、走位、上鱼窗口都记下来——以后回来对照..."
              required
            />
            <p class="field-hint">{{ form.notes.length }} 字</p>
          </div>
        </section>

        <!-- 操作 -->
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" @click="resetForm">重置</button>
          <button type="submit" class="btn btn-primary" :disabled="!canSubmit">
            📍 在地图上留下这个点
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSpots } from '@/stores/spots'
import { HZ_BOUNDS } from '@/data/mock'

const router = useRouter()
const { addSpot } = useSpots()

const form = reactive(emptyForm())
const fishInput = ref('')

const waterTypes = [
  { value: 'lake', label: '湖泊', icon: '🏞️' },
  { value: 'river', label: '江河', icon: '🌊' },
  { value: 'reservoir', label: '水库', icon: '💧' },
  { value: 'sea', label: '近海', icon: '🌅' }
]
const difficulties = [
  { value: 'easy', label: '入门' },
  { value: 'medium', label: '进阶' },
  { value: 'hard', label: '硬核' }
]

const canSubmit = computed(() =>
  form.name.trim() && form.region.trim() && form.notes.trim() && form.position
)

function emptyForm() {
  return {
    name: '',
    region: '',
    waterType: 'lake',
    difficulty: 'medium',
    rating: 4.0,
    position: { x: 50, y: 50 },
    coords: { lat: 35.0, lng: 110.0 },
    fishSpecies: [],
    bestSeason: '',
    bestTime: '',
    cover: '',
    notes: '',
    featured: false
  }
}

function pickOnMap(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  form.position = { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }
  // 用杭州经纬度边界做准确换算
  form.coords.lng = Math.round((HZ_BOUNDS.west + (x / 100) * (HZ_BOUNDS.east - HZ_BOUNDS.west)) * 1000) / 1000
  form.coords.lat = Math.round((HZ_BOUNDS.north - (y / 100) * (HZ_BOUNDS.north - HZ_BOUNDS.south)) * 1000) / 1000
}

function addFish() {
  const v = fishInput.value.trim()
  if (v && !form.fishSpecies.includes(v)) {
    form.fishSpecies.push(v)
  }
  fishInput.value = ''
}

function removeFish(idx) {
  form.fishSpecies.splice(idx, 1)
}

function resetForm() {
  Object.assign(form, emptyForm())
  fishInput.value = ''
}

function onSubmit() {
  if (!canSubmit.value) return
  const newSpot = addSpot({
    ...form,
    photos: form.cover ? [form.cover] : []
  })
  router.push(`/spot/${newSpot.id}`)
}

</script>

<style scoped>
.add-spot {
  min-height: 100%;
  padding: 40px 24px 80px;
  display: flex;
  justify-content: center;
}

.form-wrap {
  width: 100%;
  max-width: 760px;
}

.form-head {
  margin-bottom: 32px;
  text-align: center;
}
.form-head h1 {
  font-size: 30px;
  margin: 6px 0 8px;
}
.form-head p {
  margin: 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.block {
  background: var(--surface);
  border: 1px solid var(--line-soft);
  border-radius: var(--r-lg);
  padding: 28px;
}
.block-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 17px;
  margin: 0 0 6px;
}
.block-num {
  font-family: var(--font-serif);
  font-size: 13px;
  color: var(--ember);
  background: rgba(200, 85, 61, 0.1);
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 600;
}
.block-sub {
  font-size: 12.5px;
  margin: 0 0 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;
}
.field:last-child {
  margin-bottom: 0;
}
.field label {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
}
.req {
  color: var(--ember);
}
.field input,
.field textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--bg);
  font-size: 14px;
  transition: all 0.15s;
}
.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: var(--moss);
  box-shadow: 0 0 0 3px rgba(61, 90, 71, 0.12);
  background: var(--surface);
}
.field textarea {
  resize: vertical;
  font-family: var(--font-serif);
  line-height: 1.6;
}
.field-hint {
  font-size: 11px;
  color: var(--ink-mute);
  margin: 0;
  text-align: right;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.radio-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.radio-card {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--bg);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
}
.radio-card:hover {
  border-color: var(--moss-soft);
}
.radio-card.active {
  border-color: var(--moss);
  background: rgba(61, 90, 71, 0.08);
}
.radio-card input {
  display: none;
}

.radio-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--bg);
  border: 1px solid var(--line);
  cursor: pointer;
  font-size: 12.5px;
  transition: all 0.15s;
}
.radio-pill.active {
  background: var(--moss);
  color: #f4ede0;
  border-color: var(--moss-deep);
}
.radio-pill input { display: none; }

.mini-map {
  width: 100%;
  height: 320px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  overflow: hidden;
  cursor: crosshair;
  background: var(--surface-2);
  margin-bottom: 14px;
}
.mini-map svg {
  width: 100%;
  height: 100%;
  display: block;
}

.chip-input {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--bg);
  min-height: 42px;
}
.chip-input:focus-within {
  border-color: var(--moss);
  box-shadow: 0 0 0 3px rgba(61, 90, 71, 0.12);
}
.chip-input input {
  flex: 1;
  min-width: 140px;
  border: none;
  outline: none;
  background: transparent;
  padding: 4px 6px;
  font-size: 13px;
}
.chip-removable {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.chip-removable button {
  font-size: 13px;
  line-height: 1;
  color: inherit;
  opacity: 0.6;
  padding: 0;
  width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.chip-removable button:hover {
  opacity: 1;
}

.rating-input {
  display: flex;
  align-items: center;
  gap: 6px;
}
.star-btn {
  font-size: 26px;
  color: var(--line);
  transition: all 0.15s;
  padding: 0 2px;
}
.star-btn.on {
  color: var(--ember);
}
.star-btn:hover {
  transform: scale(1.1);
}
.rating-num {
  margin-left: 8px;
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 700;
  color: var(--ember);
}

.cover-preview {
  margin-top: 8px;
  width: 100%;
  height: 160px;
  border-radius: var(--r-md);
  overflow: hidden;
  background: var(--surface-2);
}
.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>