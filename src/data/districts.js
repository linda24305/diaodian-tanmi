// 杭州 13 个区/县行政区划数据
// outline 用经纬度顶点数组,渲染时动态转画布坐标

import { HZ_BOUNDS } from './mock'

// 杭州市地图 viewBox 尺寸
export const CITY_VIEW = {
  width: 1500,
  height: 800,
  mapLeft: 50,
  mapRight: 1450,
  mapTop: 40,
  mapBottom: 760
}

// 经纬度 → 全市画布坐标
export function lngToX(lng) {
  const { west, east } = HZ_BOUNDS
  return CITY_VIEW.mapLeft + ((lng - west) / (east - west)) * (CITY_VIEW.mapRight - CITY_VIEW.mapLeft)
}
export function latToY(lat) {
  const { north, south } = HZ_BOUNDS
  return CITY_VIEW.mapTop + ((north - lat) / (north - south)) * (CITY_VIEW.mapBottom - CITY_VIEW.mapTop)
}

// 区 outline (经纬度顶点) → SVG path d
export function outlineToPath(outline) {
  return outline
    .map(([lng, lat], i) => `${i === 0 ? 'M' : 'L'} ${lngToX(lng).toFixed(1)} ${latToY(lat).toFixed(1)}`)
    .join(' ') + ' Z'
}

// 13 个区/县(杭州市行政区)
export const districts = [
  {
    id: 'shangcheng',
    name: '上城区',
    short: '上城',
    center: { lat: 30.24, lng: 120.20 },
    bounds: { west: 120.10, east: 120.25, north: 30.30, south: 30.18 },
    waters: ['钱塘江', '中河'],
    fillColor: '#b8c8a8',
    outline: [
      [120.10, 30.30], [120.25, 30.30], [120.25, 30.18], [120.10, 30.18]
    ]
  },
  {
    id: 'gongshu',
    name: '拱墅区',
    short: '拱墅',
    center: { lat: 30.34, lng: 120.13 },
    bounds: { west: 120.05, east: 120.20, north: 30.40, south: 30.28 },
    waters: ['京杭大运河', '半山'],
    fillColor: '#b8c8a8',
    outline: [
      [120.05, 30.40], [120.20, 30.40], [120.20, 30.28], [120.05, 30.28]
    ]
  },
  {
    id: 'xihu',
    name: '西湖区',
    short: '西湖',
    center: { lat: 30.22, lng: 120.00 },
    bounds: { west: 119.85, east: 120.10, north: 30.35, south: 30.08 },
    waters: ['西湖', '西溪湿地', '钱塘江'],
    fillColor: '#b8c8a8',
    outline: [
      [119.85, 30.35], [120.10, 30.35], [120.10, 30.08], [119.85, 30.08]
    ]
  },
  {
    id: 'binjiang',
    name: '滨江区',
    short: '滨江',
    center: { lat: 30.13, lng: 120.20 },
    bounds: { west: 120.13, east: 120.30, north: 30.20, south: 30.05 },
    waters: ['钱塘江'],
    fillColor: '#c8c0a0',
    outline: [
      [120.13, 30.20], [120.30, 30.20], [120.30, 30.05], [120.13, 30.05]
    ]
  },
  {
    id: 'xiaoshan',
    name: '萧山区',
    short: '萧山',
    center: { lat: 30.00, lng: 120.30 },
    bounds: { west: 120.05, east: 120.55, north: 30.18, south: 29.75 },
    waters: ['湘湖', '钱塘江'],
    fillColor: '#c8b888',
    outline: [
      [120.05, 30.18], [120.55, 30.18], [120.55, 29.75], [120.05, 29.75]
    ]
  },
  {
    id: 'yuhang',
    name: '余杭区',
    short: '余杭',
    center: { lat: 30.30, lng: 119.85 },
    bounds: { west: 119.45, east: 120.10, north: 30.55, south: 30.10 },
    waters: ['苕溪', '径山'],
    fillColor: '#c8c0a0',
    outline: [
      [119.45, 30.55], [120.10, 30.55], [120.10, 30.10], [119.45, 30.10]
    ]
  },
  {
    id: 'linping',
    name: '临平区',
    short: '临平',
    center: { lat: 30.42, lng: 120.28 },
    bounds: { west: 120.10, east: 120.45, north: 30.55, south: 30.30 },
    waters: ['上塘河'],
    fillColor: '#c8c0a0',
    outline: [
      [120.10, 30.55], [120.45, 30.55], [120.45, 30.30], [120.10, 30.30]
    ]
  },
  {
    id: 'qiantang',
    name: '钱塘区',
    short: '钱塘',
    center: { lat: 30.25, lng: 120.45 },
    bounds: { west: 120.30, east: 120.55, north: 30.35, south: 30.10 },
    waters: ['钱塘江'],
    fillColor: '#c8c0a0',
    outline: [
      [120.30, 30.35], [120.55, 30.35], [120.55, 30.10], [120.30, 30.10]
    ]
  },
  {
    id: 'linan',
    name: '临安区',
    short: '临安',
    center: { lat: 30.20, lng: 119.15 },
    bounds: { west: 118.85, east: 119.45, north: 30.55, south: 29.95 },
    waters: ['青山湖', '天目溪', '太湖源'],
    fillColor: '#c8c0a0',
    outline: [
      [118.85, 30.55], [119.45, 30.55], [119.45, 29.95], [118.85, 29.95]
    ]
  },
  {
    id: 'fuyang',
    name: '富阳区',
    short: '富阳',
    center: { lat: 29.90, lng: 119.75 },
    bounds: { west: 119.40, east: 120.10, north: 30.10, south: 29.65 },
    waters: ['富春江', '壶源江'],
    fillColor: '#c8b888',
    outline: [
      [119.40, 30.10], [120.10, 30.10], [120.10, 29.65], [119.40, 29.65]
    ]
  },
  {
    id: 'chunan',
    name: '淳安县',
    short: '淳安',
    center: { lat: 29.60, lng: 118.95 },
    bounds: { west: 118.50, east: 119.42, north: 30.05, south: 29.20 },
    waters: ['千岛湖', '新安江', '汾口溪'],
    fillColor: '#c8b888',
    outline: [
      [118.50, 30.05], [119.42, 30.05], [119.42, 29.20], [118.50, 29.20]
    ]
  },
  {
    id: 'tonglu',
    name: '桐庐县',
    short: '桐庐',
    center: { lat: 29.80, lng: 119.55 },
    bounds: { west: 119.10, east: 119.85, north: 29.95, south: 29.45 },
    waters: ['富春江', '分水江'],
    fillColor: '#c8c0a0',
    outline: [
      [119.10, 29.95], [119.85, 29.95], [119.85, 29.45], [119.10, 29.45]
    ]
  },
  {
    id: 'jiande',
    name: '建德市',
    short: '建德',
    center: { lat: 29.50, lng: 119.00 },
    bounds: { west: 118.50, east: 119.45, north: 29.65, south: 29.20 },
    waters: ['新安江', '寿昌江'],
    fillColor: '#c8c0a0',
    outline: [
      [118.50, 29.65], [119.45, 29.65], [119.45, 29.20], [118.50, 29.20]
    ]
  }
]

export function getDistrictById(id) {
  return districts.find((d) => d.id === id)
}

// 判断 spot 属于哪个区
export function findDistrictForSpot(spot) {
  // 优先用 spot.districtId 字段,如果没有,按 region 名称匹配
  if (spot.districtId) return districts.find((d) => d.id === spot.districtId)
  const name = spot.region?.split('·')[1]?.trim() || ''
  return districts.find((d) => d.short === name || d.name.includes(name))
}