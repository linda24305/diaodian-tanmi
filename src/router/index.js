import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/MapView.vue'),
    meta: { title: '探秘地图' }
  },
  {
    path: '/spot/:id',
    name: 'spot-detail',
    component: () => import('@/views/SpotDetail.vue'),
    meta: { title: '钓点详情' }
  },
  {
    path: '/district/:id',
    name: 'district',
    component: () => import('@/views/DistrictView.vue'),
    meta: { title: '区级钓点' }
  },
  {
    path: '/add',
    name: 'add-spot',
    component: () => import('@/views/AddSpot.vue'),
    meta: { title: '新增钓点' }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/Profile.vue'),
    meta: { title: '我的钓点' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.afterEach((to) => {
  document.title = `${to.meta.title || '钓点探秘'} · 钓点探秘`
})

export default router