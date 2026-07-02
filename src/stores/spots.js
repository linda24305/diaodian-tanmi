import { reactive, computed, watch } from 'vue'
import { initialSpots } from '@/data/mock'

const STORAGE_KEY = 'diaodian_spots_v1'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('[spots store] 加载本地数据失败', e)
  }
  return initialSpots
}

const state = reactive({
  spots: loadFromStorage(),
  filter: {
    waterType: 'all',
    difficulty: 'all',
    keyword: ''
  },
  liked: JSON.parse(localStorage.getItem('diaodian_liked_v1') || '[]')
})

// 持久化
watch(
  () => state.spots,
  (v) => localStorage.setItem(STORAGE_KEY, JSON.stringify(v)),
  { deep: true }
)
watch(
  () => state.liked,
  (v) => localStorage.setItem('diaodian_liked_v1', JSON.stringify(v)),
  { deep: true }
)

// 派生
const filteredSpots = computed(() => {
  const { waterType, difficulty, keyword } = state.filter
  return state.spots.filter((s) => {
    if (waterType !== 'all' && s.waterType !== waterType) return false
    if (difficulty !== 'all' && s.difficulty !== difficulty) return false
    if (keyword) {
      const k = keyword.toLowerCase()
      const hit =
        s.name.toLowerCase().includes(k) ||
        s.region.toLowerCase().includes(k) ||
        s.fishSpecies.some((f) => f.toLowerCase().includes(k))
      if (!hit) return false
    }
    return true
  })
})

// 按区统计
const spotCountsByDistrict = computed(() => {
  const counts = {}
  state.spots.forEach((s) => {
    if (s.districtId) {
      counts[s.districtId] = (counts[s.districtId] || 0) + 1
    }
  })
  return counts
})

function getSpotsByDistrict(districtId) {
  return state.spots.filter((s) => s.districtId === districtId)
}

const stats = computed(() => {
  const spots = state.spots
  const totalVisits = spots.reduce((sum, s) => sum + (s.visits || 0), 0)
  const totalLikes = spots.reduce((sum, s) => sum + (s.likes || 0), 0)
  const regionSet = new Set(spots.map((s) => s.region.split('·')[0].trim()))
  return {
    spotCount: spots.length,
    visitCount: totalVisits,
    likeCount: totalLikes,
    regionCount: regionSet.size
  }
})

// 操作
function getById(id) {
  return state.spots.find((s) => s.id === id)
}

function addSpot(spot) {
  const newSpot = {
    id: 'sp_' + Date.now().toString(36),
    createdAt: new Date().toISOString().slice(0, 10),
    visits: 0,
    likes: 0,
    author: { name: '我', avatar: '👤' },
    ...spot
  }
  state.spots.unshift(newSpot)
  return newSpot
}

function toggleLike(id) {
  const idx = state.liked.indexOf(id)
  if (idx === -1) state.liked.push(id)
  else state.liked.splice(idx, 1)
}

function isLiked(id) {
  return state.liked.includes(id)
}

function resetData() {
  state.spots = JSON.parse(JSON.stringify(initialSpots))
  state.liked = []
}

function setFilter(patch) {
  Object.assign(state.filter, patch)
}

export function useSpots() {
  return {
    state,
    filteredSpots,
    spotCountsByDistrict,
    stats,
    getById,
    getSpotsByDistrict,
    addSpot,
    toggleLike,
    isLiked,
    resetData,
    setFilter
  }
}